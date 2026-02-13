import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.ts';
import { logger } from './shared/utils/logger.ts';
import { errorHandler } from './shared/errors/error-handler.ts';
import { requestId } from './shared/middleware/request-id.middleware.ts';
import { createContainer } from './container.ts';

// Phase 1 routes
import { createPlatformSchoolRoutes, createSchoolProfileRoutes } from './modules/school/school.routes.ts';
import { createAuthRoutes } from './modules/auth/auth.routes.ts';
import { createUserRoutes } from './modules/user/user.routes.ts';
import { createRoleRoutes } from './modules/role/role.routes.ts';
import { createPermissionRoutes } from './modules/permission/permission.routes.ts';

// Phase 2 routes
import { createAcademicYearRoutes } from './modules/academic-year/academic-year.routes.ts';
import { createTermNestedRoutes, createTermRoutes } from './modules/term/term.routes.ts';
import { createDepartmentRoutes } from './modules/department/department.routes.ts';
import { createGradeRoutes } from './modules/grade/grade.routes.ts';
import { createSubjectRoutes, createGradeSubjectsRoutes } from './modules/subject/subject.routes.ts';
import { createClassSectionRoutes } from './modules/class-section/class-section.routes.ts';
import { createRequirementRoutes } from './modules/requirement/requirement.routes.ts';

// Phase 3 routes
import { createStudentRoutes } from './modules/student/student.routes.ts';
import { createGuardianRoutes } from './modules/guardian/guardian.routes.ts';
import { createStudentGuardianRoutes } from './modules/student-guardian/student-guardian.routes.ts';
import { createEnrollmentRoutes } from './modules/enrollment/enrollment.routes.ts';
import { createTeacherRoutes } from './modules/teacher/teacher.routes.ts';

// Phase 4 routes
import { createPeriodSetRoutes } from './modules/period-set/period-set.routes.ts';
import { createWorkingDayRoutes } from './modules/working-day/working-day.routes.ts';
import { createPeriodRoutes } from './modules/period/period.routes.ts';
import { createTimeSlotRoutes } from './modules/time-slot/time-slot.routes.ts';
import { createRoomRoutes } from './modules/room/room.routes.ts';

// Phase 5 routes
import { createLessonRoutes, createTimetableRoutes } from './modules/lesson/lesson.routes.ts';
import { createSubstitutionRoutes } from './modules/substitution/substitution.routes.ts';

// Phase 6 routes
import { createTeacherAvailabilityRoutes } from './modules/teacher-availability/teacher-availability.routes.ts';
import { createTeacherLeaveRoutes } from './modules/teacher-leave/teacher-leave.routes.ts';
import { createStudentAttendanceRoutes } from './modules/student-attendance/student-attendance.routes.ts';
import { createTeacherAttendanceRoutes } from './modules/teacher-attendance/teacher-attendance.routes.ts';

// Phase 7 routes
import { createGradingScaleRoutes } from './modules/grading-scale/grading-scale.routes.ts';
import { createExamRoutes } from './modules/exam/exam.routes.ts';
import { createExamSubjectRoutes } from './modules/exam-subject/exam-subject.routes.ts';
import { createStudentGradeRoutes } from './modules/student-grade/student-grade.routes.ts';
import { createReportCardRoutes } from './modules/report-card/report-card.routes.ts';

// Phase 8 routes
import { createFeeCategoryRoutes } from './modules/fee-category/fee-category.routes.ts';
import { createFeeStructureRoutes } from './modules/fee-structure/fee-structure.routes.ts';
import { createFeeDiscountRoutes } from './modules/fee-discount/fee-discount.routes.ts';
import { createFeeInvoiceRoutes } from './modules/fee-invoice/fee-invoice.routes.ts';
import { createFeePaymentRoutes } from './modules/fee-payment/fee-payment.routes.ts';
import { createFinancialReportRoutes } from './modules/financial-report/financial-report.routes.ts';

// Phase 9 routes
import { createAnnouncementRoutes } from './modules/announcement/announcement.routes.ts';
import { createNotificationRoutes } from './modules/notification/notification.routes.ts';
import { createAcademicEventRoutes } from './modules/academic-event/academic-event.routes.ts';

export function createServer() {
  const app = express();
  const { controllers, prisma } = createContainer();

  // ---- Global middleware ----
  app.use(requestId);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }),
  );

  // ---- Health check ----
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ---- Phase 1: API routes ----
  app.use('/api/v1/platform/schools', createPlatformSchoolRoutes(controllers.schoolController));
  app.use('/api/v1/school/profile', createSchoolProfileRoutes(controllers.schoolController));
  app.use('/api/v1/auth', createAuthRoutes(controllers.authController));
  app.use('/api/v1/users', createUserRoutes(controllers.userController));
  app.use('/api/v1/roles', createRoleRoutes(controllers.roleController));
  app.use('/api/v1/permissions', createPermissionRoutes(prisma));

  // ---- Phase 2: Academic Structure ----
  app.use('/api/v1/academic-years', createAcademicYearRoutes(controllers.academicYearController));
  app.use('/api/v1/academic-years/:yearId/terms', createTermNestedRoutes(controllers.termController));
  app.use('/api/v1/terms', createTermRoutes(controllers.termController));
  app.use('/api/v1/departments', createDepartmentRoutes(controllers.departmentController));
  app.use('/api/v1/grades', createGradeRoutes(controllers.gradeController));
  app.use('/api/v1/grades/:gradeId/subjects', createGradeSubjectsRoutes(controllers.subjectController));
  app.use('/api/v1/subjects', createSubjectRoutes(controllers.subjectController));
  app.use('/api/v1/class-sections', createClassSectionRoutes(controllers.classSectionController));
  app.use('/api/v1/class-sections/:sectionId/requirements', createRequirementRoutes(controllers.requirementController));

  // ---- Phase 3: People ----
  app.use('/api/v1/students', createStudentRoutes(controllers.studentController));
  app.use('/api/v1/students/:studentId/guardians', createStudentGuardianRoutes(controllers.studentGuardianController));
  app.use('/api/v1/guardians', createGuardianRoutes(controllers.guardianController));
  app.use('/api/v1/enrollments', createEnrollmentRoutes(controllers.enrollmentController));
  app.use('/api/v1/teachers', createTeacherRoutes(controllers.teacherController));

  // ---- Phase 4: Time & Space ----
  app.use('/api/v1/period-sets', createPeriodSetRoutes(controllers.periodSetController));
  app.use('/api/v1/period-sets/:setId/working-days', createWorkingDayRoutes(controllers.workingDayController));
  app.use('/api/v1/period-sets/:setId/periods', createPeriodRoutes(controllers.periodController));
  app.use('/api/v1/period-sets/:setId/time-slots', createTimeSlotRoutes(controllers.timeSlotController));
  app.use('/api/v1/rooms', createRoomRoutes(controllers.roomController));

  // ---- Phase 5: Scheduling ----
  app.use('/api/v1/lessons', createLessonRoutes(controllers.lessonController));
  app.use('/api/v1/timetable', createTimetableRoutes(controllers.lessonController));
  app.use('/api/v1/substitutions', createSubstitutionRoutes(controllers.substitutionController));

  // ---- Phase 6: Daily Operations ----
  app.use('/api/v1/teachers/:teacherId/availability', createTeacherAvailabilityRoutes(controllers.teacherAvailabilityController));
  app.use('/api/v1/teacher-leaves', createTeacherLeaveRoutes(controllers.teacherLeaveController));
  app.use('/api/v1/student-attendance', createStudentAttendanceRoutes(controllers.studentAttendanceController));
  app.use('/api/v1/teacher-attendance', createTeacherAttendanceRoutes(controllers.teacherAttendanceController));

  // ---- Phase 7: Assessment ----
  app.use('/api/v1/grading-scales', createGradingScaleRoutes(controllers.gradingScaleController));
  app.use('/api/v1/exams', createExamRoutes(controllers.examController));
  app.use('/api/v1/exams/:examId/subjects', createExamSubjectRoutes(controllers.examSubjectController));
  app.use('/api/v1/grades', createStudentGradeRoutes(controllers.studentGradeController));
  app.use('/api/v1/report-cards', createReportCardRoutes(controllers.reportCardController));

  // ---- Phase 8: Finance ----
  app.use('/api/v1/fee-categories', createFeeCategoryRoutes(controllers.feeCategoryController));
  app.use('/api/v1/fee-structures', createFeeStructureRoutes(controllers.feeStructureController));
  app.use('/api/v1/fee-discounts', createFeeDiscountRoutes(controllers.feeDiscountController));
  app.use('/api/v1/fee-invoices', createFeeInvoiceRoutes(controllers.feeInvoiceController));
  app.use('/api/v1/fee-payments', createFeePaymentRoutes(controllers.feePaymentController));
  app.use('/api/v1/reports/fees', createFinancialReportRoutes(controllers.financialReportController));

  // ---- Phase 9: Communication & Calendar ----
  app.use('/api/v1/announcements', createAnnouncementRoutes(controllers.announcementController));
  app.use('/api/v1/notifications', createNotificationRoutes(controllers.notificationController));
  app.use('/api/v1/academic-events', createAcademicEventRoutes(controllers.academicEventController));

  // ---- 404 handler ----
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  // ---- Error handler (must be last, must have 4 params) ----
  app.use(errorHandler);

  return app;
}
