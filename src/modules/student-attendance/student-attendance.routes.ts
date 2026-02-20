import { Router } from 'express';
import type { StudentAttendanceController } from './student-attendance.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createStudentAttendanceRoutes(controller: StudentAttendanceController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /student-attendance:
   *   get:
   *     tags: [Attendance]
   *     summary: List student attendance records
   *     description: Get a paginated list of student attendance records with filtering options.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: studentId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by student ID
   *       - in: query
   *         name: classSectionId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by class section ID
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by specific date
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter from this date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter until this date
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
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('student-attendance.list'), controller.list);

  /**
   * @openapi
   * /student-attendance/summary:
   *   get:
   *     tags: [Attendance]
   *     summary: Get attendance summary statistics
   *     description: |
   *       Get attendance summary for a student, class, or entire school.
   *       Returns counts and percentages for each attendance status.
   *     parameters:
   *       - in: query
   *         name: studentId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Get summary for specific student
   *       - in: query
   *         name: classSectionId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Get summary for specific class section
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for summary period
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for summary period
   *     responses:
   *       200:
   *         description: Attendance summary retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     present: { type: integer, example: 85 }
   *                     absent: { type: integer, example: 5 }
   *                     late: { type: integer, example: 7 }
   *                     excused: { type: integer, example: 3 }
   *                     totalDays: { type: integer, example: 100 }
   *                     attendanceRate: { type: number, example: 92.0 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/summary', requirePermission('student-attendance.list'), controller.summary);

  /**
   * @openapi
   * /student-attendance/{id}:
   *   get:
   *     tags: [Attendance]
   *     summary: Get an attendance record by ID
   *     description: Retrieve detailed information about a specific attendance record.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Attendance record ID
   *     responses:
   *       200:
   *         description: Attendance record retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/StudentAttendance'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('student-attendance.read'), controller.getById);

  /**
   * @openapi
   * /student-attendance/bulk:
   *   post:
   *     tags: [Attendance]
   *     summary: Record attendance for multiple students
   *     description: |
   *       Record attendance for multiple students at once (e.g., entire class).
   *       Typically used at the beginning of each day or lesson.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [date, records]
   *             properties:
   *               date:
   *                 type: string
   *                 format: date
   *                 description: Date of attendance
   *               lessonId:
   *                 type: string
   *                 format: uuid
   *                 description: Optional lesson/period ID
   *               records:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   type: object
   *                   required: [studentId, status]
   *                   properties:
   *                     studentId: { type: string, format: uuid }
   *                     status: { type: string, enum: [present, absent, late, excused] }
   *                     remarks: { type: string, maxLength: 500 }
   *     responses:
   *       201:
   *         description: Attendance recorded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     recordedCount: { type: integer, example: 30 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: One or more students not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/bulk', requirePermission('student-attendance.create'), controller.bulkRecord);

  /**
   * @openapi
   * /student-attendance/{id}:
   *   patch:
   *     tags: [Attendance]
   *     summary: Correct an attendance record
   *     description: Update an existing attendance record to correct errors.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Attendance record ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status: { type: string, enum: [present, absent, late, excused] }
   *               remarks: { type: string, maxLength: 500 }
   *     responses:
   *       200:
   *         description: Attendance record corrected successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/StudentAttendance'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('student-attendance.update'), controller.correct);

  return router;
}
