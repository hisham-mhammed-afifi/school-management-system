import { Router } from 'express';
import type { SelfServiceController } from './self-service.controller.ts';
import { authenticate } from '../../shared/middleware/auth.middleware.ts';

export function createSelfServiceRoutes(controller: SelfServiceController): Router {
  const router = Router();

  router.use(authenticate);

  // Shared (teacher or student)
  router.get('/timetable', controller.myTimetable);

  // Teacher self-service
  router.get('/classes', controller.myClasses);
  router.get('/leaves', controller.myLeaves);
  router.post('/leaves', controller.submitLeave);
  router.get('/substitutions', controller.mySubstitutions);

  // Student self-service
  router.get('/grades', controller.myGrades);
  router.get('/attendance', controller.myAttendance);
  router.get('/report-cards', controller.myReportCards);
  router.get('/invoices', controller.myInvoices);

  // Guardian self-service
  router.get('/children', controller.myChildren);
  router.get('/children/:studentId/grades', controller.childGrades);
  router.get('/children/:studentId/attendance', controller.childAttendance);
  router.get('/children/:studentId/report-cards', controller.childReportCards);
  router.get('/children/:studentId/invoices', controller.childInvoices);

  return router;
}
