import type { ExamSubjectRepository } from './exam-subject.repository.ts';
import type { CreateExamSubjectInput, UpdateExamSubjectInput } from './exam-subject.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

function timeStringToDate(time: string): Date {
  const parts = time.split(':').map(Number);
  return new Date(1970, 0, 1, parts[0], parts[1], 0, 0);
}

export class ExamSubjectService {
  private readonly repo: ExamSubjectRepository;
  constructor(repo: ExamSubjectRepository) {
    this.repo = repo;
  }

  async listByExam(examId: string) {
    return this.repo.findByExam(examId);
  }

  async getById(id: string) {
    const examSubject = await this.repo.findById(id);
    if (!examSubject) throw new AppError('Exam subject not found', 404, 'EXAM_SUBJECT_NOT_FOUND');
    return examSubject;
  }

  async create(schoolId: string, examId: string, input: CreateExamSubjectInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      exam: { connect: { id: examId } },
      subject: { connect: { id: input.subjectId } },
      grade: { connect: { id: input.gradeId } },
      maxScore: input.maxScore,
      passScore: input.passScore ?? null,
      examDate: input.examDate ?? null,
      examTime: input.examTime ? timeStringToDate(input.examTime) : null,
    });
  }

  async update(id: string, input: UpdateExamSubjectInput) {
    await this.getById(id);

    const data: Record<string, unknown> = {};
    if (input.maxScore !== undefined) data['maxScore'] = input.maxScore;
    if (input.passScore !== undefined) data['passScore'] = input.passScore;
    if (input.examDate !== undefined) data['examDate'] = input.examDate;
    if (input.examTime !== undefined) data['examTime'] = timeStringToDate(input.examTime);

    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);

    const hasGrades = await this.repo.hasGrades(id);
    if (hasGrades) {
      throw new AppError('Cannot delete exam subject that has grade entries', 409, 'EXAM_SUBJECT_HAS_GRADES');
    }

    await this.repo.delete(id);
  }
}
