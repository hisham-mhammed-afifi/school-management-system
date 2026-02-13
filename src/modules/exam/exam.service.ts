import type { ExamRepository } from './exam.repository.ts';
import type { CreateExamInput, UpdateExamInput, ListExamsQuery } from './exam.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class ExamService {
  private readonly repo: ExamRepository;
  constructor(repo: ExamRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListExamsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const exam = await this.repo.findById(id);
    if (!exam) throw new AppError('Exam not found', 404, 'EXAM_NOT_FOUND');
    return exam;
  }

  async create(schoolId: string, input: CreateExamInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      academicYear: { connect: { id: input.academicYearId } },
      term: { connect: { id: input.termId } },
      gradingScale: { connect: { id: input.gradingScaleId } },
      name: input.name,
      examType: input.examType,
      weight: input.weight,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
    });
  }

  async update(id: string, input: UpdateExamInput) {
    await this.getById(id);

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data['name'] = input.name;
    if (input.examType !== undefined) data['examType'] = input.examType;
    if (input.weight !== undefined) data['weight'] = input.weight;
    if (input.startDate !== undefined) data['startDate'] = input.startDate;
    if (input.endDate !== undefined) data['endDate'] = input.endDate;
    if (input.gradingScaleId !== undefined) {
      data['gradingScale'] = { connect: { id: input.gradingScaleId } };
    }

    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);

    const hasGrades = await this.repo.hasGrades(id);
    if (hasGrades) {
      throw new AppError('Cannot delete exam that has grade entries', 409, 'EXAM_HAS_GRADES');
    }

    await this.repo.delete(id);
  }
}
