import type { Prisma } from '../../generated/prisma/client.ts';
import type { ReportCardRepository } from './report-card.repository.ts';
import type { GenerateReportCardsInput, UpdateRemarksInput, ListReportCardsQuery } from './report-card.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

interface ScaleLevel {
  letter: string;
  minScore: { toString(): string };
  maxScore: { toString(): string };
  gpaPoints: { toString(): string } | null;
}

function lookupGrade(percentage: number, levels: ScaleLevel[]): { letter: string | null; gpaPoints: number | null } {
  for (const level of levels) {
    if (percentage >= Number(level.minScore.toString()) && percentage <= Number(level.maxScore.toString())) {
      return {
        letter: level.letter,
        gpaPoints: level.gpaPoints !== null ? Number(level.gpaPoints.toString()) : null,
      };
    }
  }
  return { letter: null, gpaPoints: null };
}

export class ReportCardService {
  private readonly repo: ReportCardRepository;
  constructor(repo: ReportCardRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListReportCardsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const card = await this.repo.findById(id);
    if (!card) throw new AppError('Report card not found', 404, 'REPORT_CARD_NOT_FOUND');
    return card;
  }

  async updateRemarks(id: string, input: UpdateRemarksInput) {
    await this.getById(id);
    const data: Record<string, unknown> = {};
    if (input.teacherRemarks !== undefined) data['teacherRemarks'] = input.teacherRemarks;
    if (input.rankInClass !== undefined) data['rankInClass'] = input.rankInClass;
    return this.repo.update(id, data);
  }

  async generate(schoolId: string, generatedBy: string, input: GenerateReportCardsInput) {
    const term = await this.repo.getTermWithYear(input.termId);
    if (!term) throw new AppError('Term not found', 404, 'TERM_NOT_FOUND');

    const enrollments = await this.repo.getEnrolledStudents(input.classSectionId);
    if (enrollments.length === 0) {
      throw new AppError('No active enrollments found for this class section', 404, 'NO_ENROLLMENTS');
    }

    const studentIds = enrollments.map((e) => e.studentId);

    // Check for existing report cards
    const existing = await this.repo.findExistingForTerm(schoolId, input.termId, studentIds);
    const existingIds = new Set(existing.map((e) => e.studentId));
    const newStudentIds = studentIds.filter((id) => !existingIds.has(id));

    if (newStudentIds.length === 0) {
      throw new AppError('Report cards already exist for all students in this term', 409, 'REPORT_CARD_ALREADY_EXISTS');
    }

    // Get all grades for these students in this term
    const allGrades = await this.repo.getGradesForStudents(schoolId, input.termId, newStudentIds);

    // Build per-student snapshot data
    const studentSnapshots: Array<{
      studentId: string;
      snapshotData: Record<string, unknown>;
      overallPercentage: number;
      overallGpa: number | null;
    }> = [];

    const missingGrades: string[] = [];

    for (const studentId of newStudentIds) {
      const studentGrades = allGrades.filter((g) => g.studentId === studentId);

      if (studentGrades.length === 0) {
        missingGrades.push(studentId);
        continue;
      }

      // Group by subject
      const subjectMap = new Map<string, {
        subjectName: string;
        grades: Array<{ examName: string; score: number; maxScore: number; weight: number; gradeLetter: string | null }>;
        levels: ScaleLevel[];
      }>();

      for (const g of studentGrades) {
        const subjectId = g.examSubject.subjectId;
        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            subjectName: g.examSubject.subject.name,
            grades: [],
            levels: g.examSubject.exam.gradingScale.levels,
          });
        }
        subjectMap.get(subjectId)!.grades.push({
          examName: g.examSubject.exam.name,
          score: Number(g.score.toString()),
          maxScore: Number(g.examSubject.maxScore.toString()),
          weight: Number(g.examSubject.exam.weight.toString()),
          gradeLetter: g.gradeLetter,
        });
      }

      // Compute weighted averages per subject
      const subjects: Array<Record<string, unknown>> = [];
      let totalPct = 0;
      let totalGpa = 0;
      let gpaCount = 0;

      for (const [, sub] of subjectMap) {
        let weightedSum = 0;
        let totalWeight = 0;
        for (const g of sub.grades) {
          const pct = (g.score / g.maxScore) * 100;
          weightedSum += pct * g.weight;
          totalWeight += g.weight;
        }
        const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        const { letter, gpaPoints } = lookupGrade(finalScore, sub.levels);

        subjects.push({
          subjectName: sub.subjectName,
          finalScore: Math.round(finalScore * 100) / 100,
          gradeLetter: letter,
          gpaPoints,
          exams: sub.grades,
        });

        totalPct += finalScore;
        if (gpaPoints !== null) {
          totalGpa += gpaPoints;
          gpaCount++;
        }
      }

      const overallPercentage = subjects.length > 0 ? Math.round((totalPct / subjects.length) * 100) / 100 : 0;
      const overallGpa = gpaCount > 0 ? Math.round((totalGpa / gpaCount) * 100) / 100 : null;

      studentSnapshots.push({
        studentId,
        snapshotData: { subjects, termName: term.name, academicYear: term.academicYear.name },
        overallPercentage,
        overallGpa,
      });
    }

    // Rank by overall percentage
    studentSnapshots.sort((a, b) => b.overallPercentage - a.overallPercentage);
    let rank = 1;
    for (const snapshot of studentSnapshots) {
      snapshot.snapshotData['rankInClass'] = rank;
      rank++;
    }

    // Create snapshots
    const createInputs: Prisma.ReportCardSnapshotCreateInput[] = studentSnapshots.map((s) => ({
      school: { connect: { id: schoolId } },
      student: { connect: { id: s.studentId } },
      academicYear: { connect: { id: term.academicYearId } },
      term: { connect: { id: input.termId } },
      classSection: { connect: { id: input.classSectionId } },
      snapshotData: s.snapshotData as unknown as Prisma.InputJsonValue,
      overallGpa: s.overallGpa,
      overallPercentage: s.overallPercentage,
      rankInClass: s.snapshotData['rankInClass'] as number,
      generatedByUser: { connect: { id: generatedBy } },
      generatedAt: new Date(),
    }));

    const created = await this.repo.bulkCreate(createInputs);

    return {
      generated: created.length,
      missingGrades: missingGrades.length > 0 ? missingGrades : undefined,
      skippedExisting: existingIds.size > 0 ? existingIds.size : undefined,
    };
  }
}
