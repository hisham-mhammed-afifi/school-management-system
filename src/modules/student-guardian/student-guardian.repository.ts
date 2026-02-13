import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';

export class StudentGuardianRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findByStudent(studentId: string) {
    return this.db.studentGuardian.findMany({
      where: { studentId },
      include: { guardian: true },
      orderBy: [{ isPrimary: 'desc' }],
    });
  }

  async findById(id: string) {
    return this.db.studentGuardian.findUnique({
      where: { id },
      include: { guardian: true },
    });
  }

  async create(data: Prisma.StudentGuardianCreateInput) {
    return this.db.studentGuardian.create({
      data,
      include: { guardian: true },
    });
  }

  async update(id: string, data: Prisma.StudentGuardianUpdateInput) {
    return this.db.studentGuardian.update({
      where: { id },
      data,
      include: { guardian: true },
    });
  }

  async delete(id: string) {
    return this.db.studentGuardian.delete({ where: { id } });
  }
}
