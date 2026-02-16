import { Router } from 'express';
import type { SelfServiceController } from './self-service.controller.ts';
import { authenticate } from '../../shared/middleware/auth.middleware.ts';

export function createSelfServiceRoutes(controller: SelfServiceController): Router {
  const router = Router();

  router.use(authenticate);

  // ---- Shared (teacher or student) ----

  /**
   * @openapi
   * /my/timetable:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my timetable
   *     description: |
   *       Get the current user's timetable. Works for both teachers and students.
   *       - Teachers: returns their teaching schedule
   *       - Students: returns their class schedule
   *     parameters:
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Optional date to get timetable for (defaults to today)
   *       - in: query
   *         name: week
   *         schema:
   *           type: boolean
   *         description: If true, returns the entire week's schedule
   *     responses:
   *       200:
   *         description: Timetable retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Lesson'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.get('/timetable', controller.myTimetable);

  // ---- Teacher self-service ----

  /**
   * @openapi
   * /my/classes:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my classes (teacher)
   *     description: Get all classes/sections that the current teacher is teaching
   *     responses:
   *       200:
   *         description: Classes retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id: { type: string, format: uuid }
   *                       name: { type: string }
   *                       grade: { type: string }
   *                       subject: { type: string }
   *                       studentCount: { type: integer }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only teachers can access this endpoint
   */
  router.get('/classes', controller.myClasses);

  /**
   * @openapi
   * /my/leaves:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my leave requests (teacher)
   *     description: Get all leave requests submitted by the current teacher
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, approved, rejected, cancelled]
   *         description: Filter by leave status
   *     responses:
   *       200:
   *         description: Leave requests retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id: { type: string, format: uuid }
   *                       startDate: { type: string, format: date }
   *                       endDate: { type: string, format: date }
   *                       reason: { type: string }
   *                       status: { type: string }
   *                       createdAt: { type: string, format: date-time }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only teachers can access this endpoint
   */
  router.get('/leaves', controller.myLeaves);

  /**
   * @openapi
   * /my/leaves:
   *   post:
   *     tags: [Self-Service]
   *     summary: Submit a leave request (teacher)
   *     description: Submit a new leave request as a teacher
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [startDate, endDate, reason]
   *             properties:
   *               startDate: { type: string, format: date }
   *               endDate: { type: string, format: date }
   *               reason: { type: string, minLength: 1, maxLength: 500 }
   *     responses:
   *       201:
   *         description: Leave request submitted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     id: { type: string, format: uuid }
   *                     status: { type: string, example: 'pending' }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only teachers can submit leave requests
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/leaves', controller.submitLeave);

  /**
   * @openapi
   * /my/substitutions:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my substitutions (teacher)
   *     description: Get all substitutions where the current teacher is either the original or substitute teacher
   *     parameters:
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by date
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, confirmed, completed, cancelled]
   *         description: Filter by substitution status
   *     responses:
   *       200:
   *         description: Substitutions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Substitution'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only teachers can access this endpoint
   */
  router.get('/substitutions', controller.mySubstitutions);

  // ---- Student self-service ----

  /**
   * @openapi
   * /my/grades:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my grades (student)
   *     description: Get all grades for the current student
   *     parameters:
   *       - in: query
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by academic year
   *       - in: query
   *         name: termId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by term
   *       - in: query
   *         name: subjectId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by subject
   *     responses:
   *       200:
   *         description: Grades retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/StudentGrade'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only students can access this endpoint
   */
  router.get('/grades', controller.myGrades);

  /**
   * @openapi
   * /my/attendance:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my attendance (student)
   *     description: Get attendance records for the current student
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for attendance range
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for attendance range
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [present, absent, late, excused]
   *         description: Filter by attendance status
   *     responses:
   *       200:
   *         description: Attendance records retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/StudentAttendance'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only students can access this endpoint
   */
  router.get('/attendance', controller.myAttendance);

  /**
   * @openapi
   * /my/report-cards:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my report cards (student)
   *     description: Get all report cards for the current student
   *     parameters:
   *       - in: query
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by academic year
   *     responses:
   *       200:
   *         description: Report cards retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id: { type: string, format: uuid }
   *                       academicYear: { type: string }
   *                       term: { type: string }
   *                       generatedAt: { type: string, format: date-time }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only students can access this endpoint
   */
  router.get('/report-cards', controller.myReportCards);

  /**
   * @openapi
   * /my/invoices:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my invoices (student)
   *     description: Get all fee invoices for the current student
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [draft, issued, partially_paid, paid, overdue, cancelled]
   *         description: Filter by invoice status
   *     responses:
   *       200:
   *         description: Invoices retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FeeInvoice'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only students can access this endpoint
   */
  router.get('/invoices', controller.myInvoices);

  // ---- Guardian self-service ----

  /**
   * @openapi
   * /my/children:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get my children (guardian)
   *     description: Get all students linked to the current guardian
   *     responses:
   *       200:
   *         description: Children retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     allOf:
   *                       - $ref: '#/components/schemas/Student'
   *                       - type: object
   *                         properties:
   *                           relationship: { type: string, example: 'father' }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only guardians can access this endpoint
   */
  router.get('/children', controller.myChildren);

  /**
   * @openapi
   * /my/children/{studentId}/grades:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get child's grades (guardian)
   *     description: Get all grades for a specific child
   *     parameters:
   *       - in: path
   *         name: studentId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Student ID
   *       - in: query
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by academic year
   *       - in: query
   *         name: termId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by term
   *     responses:
   *       200:
   *         description: Grades retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/StudentGrade'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Guardian can only access their own children's data
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/children/:studentId/grades', controller.childGrades);

  /**
   * @openapi
   * /my/children/{studentId}/attendance:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get child's attendance (guardian)
   *     description: Get attendance records for a specific child
   *     parameters:
   *       - in: path
   *         name: studentId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Student ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for attendance range
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for attendance range
   *     responses:
   *       200:
   *         description: Attendance records retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/StudentAttendance'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Guardian can only access their own children's data
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/children/:studentId/attendance', controller.childAttendance);

  /**
   * @openapi
   * /my/children/{studentId}/report-cards:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get child's report cards (guardian)
   *     description: Get all report cards for a specific child
   *     parameters:
   *       - in: path
   *         name: studentId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Student ID
   *       - in: query
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by academic year
   *     responses:
   *       200:
   *         description: Report cards retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id: { type: string, format: uuid }
   *                       academicYear: { type: string }
   *                       term: { type: string }
   *                       generatedAt: { type: string, format: date-time }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Guardian can only access their own children's data
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/children/:studentId/report-cards', controller.childReportCards);

  /**
   * @openapi
   * /my/children/{studentId}/invoices:
   *   get:
   *     tags: [Self-Service]
   *     summary: Get child's invoices (guardian)
   *     description: Get all fee invoices for a specific child
   *     parameters:
   *       - in: path
   *         name: studentId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Student ID
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [draft, issued, partially_paid, paid, overdue, cancelled]
   *         description: Filter by invoice status
   *     responses:
   *       200:
   *         description: Invoices retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FeeInvoice'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Guardian can only access their own children's data
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/children/:studentId/invoices', controller.childInvoices);

  return router;
}
