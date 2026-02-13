import type { StudentGradeRepository } from './student-grade.repository.ts';
import type { BulkGradeInput, CorrectGradeInput, ListGradesQuery, GradeReportQuery } from './student-grade.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

interface ScaleLevel {
  letter: string;
  minScore: { toString(): string };
  maxScore: { toString(): string };
  gpaPoints: { toString(): string } | null;
}

function computeGradeLetter(score: number, maxScore: number, levels: ScaleLevel[]): { letter: string | null; gpaPoints: number | null } {
  const percentage = (score / maxScore) * 100;

  for (const level of levels) {
    const min = Number(level.minScore.toString());
    const maxVal = Number(level.maxScore.toString());
    if (percentage >= min && percentage <= maxVal) {
      return {
        letter: level.letter,
        gpaPoints: level.gpaPoints !== null ? Number(level.gpaPoints.toString()) : null,
      };
    }
  }

  return { letter: null, gpaPoints: null };
}

export class StudentGradeService {
  private readonly repo: StudentGradeRepository;
  constructor(repo: StudentGradeRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListGradesQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const grade = await this.repo.findById(id);
    if (!grade) throw new AppError('Student grade not found', 404, 'GRADE_NOT_FOUND');
    return grade;
  }

  async bulkRecord(schoolId: string, gradedBy: string, input: BulkGradeInput) {
    const examSubject = await this.repo.findExamSubjectWithScale(input.examSubjectId);
    if (!examSubject) throw new AppError('Exam subject not found', 404, 'EXAM_SUBJECT_NOT_FOUND');

    const maxScore = Number(examSubject.maxScore.toString());
    const levels = examSubject.exam.gradingScale.levels;

    const gradesWithLetters = input.grades.map((g) => {
      if (g.score > maxScore) {
        throw new AppError(
          `Score ${g.score} exceeds max score ${maxScore} for student ${g.studentId}`,
          422,
          'SCORE_EXCEEDS_MAX',
        );
      }

      const { letter } = computeGradeLetter(g.score, maxScore, levels);
      return {
        studentId: g.studentId,
        score: g.score,
        gradeLetter: letter,
        notes: g.notes,
      };
    });

    return this.repo.bulkCreate(schoolId, input.examSubjectId, gradedBy, gradesWithLetters);
  }

  async correct(id: string, input: CorrectGradeInput) {
    const existing = await this.getById(id);

    const data: Record<string, unknown> = {};
    if (input.notes !== undefined) data['notes'] = input.notes;

    if (input.score !== undefined) {
      const examSubject = await this.repo.findExamSubjectWithScale(existing.examSubjectId);
      if (!examSubject) throw new AppError('Exam subject not found', 404, 'EXAM_SUBJECT_NOT_FOUND');

      const maxScore = Number(examSubject.maxScore.toString());
      if (input.score > maxScore) {
        throw new AppError(`Score ${input.score} exceeds max score ${maxScore}`, 422, 'SCORE_EXCEEDS_MAX');
      }

      const levels = examSubject.exam.gradingScale.levels;
      const { letter } = computeGradeLetter(input.score, maxScore, levels);
      data['score'] = input.score;
      data['gradeLetter'] = letter;
    }

    return this.repo.update(id, data);
  }

  async getReport(schoolId: string, query: GradeReportQuery) {
    const grades = await this.repo.findGradesForReport(schoolId, query.termId, query.classSectionId);

    const studentMap = new Map<string, {
      studentId: string;
      studentName: string;
      subjects: Map<string, { subjectName: string; grades: Array<{ examName: string; score: number; maxScore: number; weight: number; gradeLetter: string | null }> }>;
    }>();

    for (const g of grades) {
      if (!studentMap.has(g.studentId)) {
        studentMap.set(g.studentId, {
          studentId: g.studentId,
          studentName: `${g.student.firstName} ${g.student.lastName}`,
          subjects: new Map(),
        });
      }

      const student = studentMap.get(g.studentId)!;
      const subjectId = g.examSubject.subjectId;

      if (!student.subjects.has(subjectId)) {
        student.subjects.set(subjectId, {
          subjectName: g.examSubject.subject.name,
          grades: [],
        });
      }

      student.subjects.get(subjectId)!.grades.push({
        examName: g.examSubject.exam.name,
        score: Number(g.score.toString()),
        maxScore: Number(g.examSubject.maxScore.toString()),
        weight: Number(g.examSubject.exam.weight.toString()),
        gradeLetter: g.gradeLetter,
      });
    }

    const report = Array.from(studentMap.values()).map((s) => {
      const subjects = Array.from(s.subjects.values()).map((sub) => {
        let weightedSum = 0;
        let totalWeight = 0;
        for (const g of sub.grades) {
          const pct = (g.score / g.maxScore) * 100;
          weightedSum += pct * g.weight;
          totalWeight += g.weight;
        }
        const avg = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
        return { subjectName: sub.subjectName, weightedAverage: avg, grades: sub.grades };
      });

      const overallPct = subjects.length > 0
        ? Math.round((subjects.reduce((sum, s) => sum + s.weightedAverage, 0) / subjects.length) * 100) / 100
        : 0;

      return {
        studentId: s.studentId,
        studentName: s.studentName,
        overallPercentage: overallPct,
        subjects,
      };
    });

    report.sort((a, b) => b.overallPercentage - a.overallPercentage);

    return report;
  }
}
