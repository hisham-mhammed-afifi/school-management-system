import { Router } from 'express';
import type { EnrollmentController } from './enrollment.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createEnrollmentRoutes(controller: EnrollmentController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /enrollments:
   *   get:
   *     tags: [Enrollments]
   *     summary: List enrollments
   *     description: |
   *       Get a paginated list of student enrollments for the current school.
   *       Enrollments link students to class sections within an academic year.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: studentId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by student
   *       - in: query
   *         name: classSectionId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by class section
   *       - in: query
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by academic year
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ACTIVE, GRADUATED, TRANSFERRED, WITHDRAWN]
   *         description: Filter by enrollment status
   *     responses:
   *       200:
   *         description: Enrollments retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Enrollment'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('enrollments.list'), controller.list);

  /**
   * @openapi
   * /enrollments/{id}:
   *   get:
   *     tags: [Enrollments]
   *     summary: Get an enrollment by ID
   *     description: Retrieve detailed information about a specific enrollment.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Enrollment ID
   *     responses:
   *       200:
   *         description: Enrollment retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Enrollment'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('enrollments.read'), controller.getById);

  /**
   * @openapi
   * /enrollments:
   *   post:
   *     tags: [Enrollments]
   *     summary: Create a new enrollment
   *     description: |
   *       Enroll a student in a class section for a specific academic year.
   *       Validates capacity constraints and existing enrollments.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [studentId, classSectionId, academicYearId]
   *             properties:
   *               studentId:
   *                 type: string
   *                 format: uuid
   *                 description: Student to enroll
   *               classSectionId:
   *                 type: string
   *                 format: uuid
   *                 description: Class section to enroll in
   *               academicYearId:
   *                 type: string
   *                 format: uuid
   *                 description: Academic year for enrollment
   *               enrollmentDate:
   *                 type: string
   *                 format: date
   *                 description: Enrollment date (defaults to today)
   *               status:
   *                 type: string
   *                 enum: [ACTIVE, GRADUATED, TRANSFERRED, WITHDRAWN]
   *                 default: ACTIVE
   *     responses:
   *       201:
   *         description: Enrollment created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Enrollment'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Student, class section, or academic year not found
   *       409:
   *         description: Student already enrolled or section at capacity
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('enrollments.create'), controller.create);

  /**
   * @openapi
   * /enrollments/bulk-promote:
   *   post:
   *     tags: [Enrollments]
   *     summary: Bulk promote students
   *     description: |
   *       Promote multiple students from one class section to another for a new academic year.
   *       Useful for end-of-year class progression (e.g., Grade 10A to Grade 11A).
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [fromClassSectionId, toClassSectionId, academicYearId]
   *             properties:
   *               fromClassSectionId:
   *                 type: string
   *                 format: uuid
   *                 description: Source class section
   *               toClassSectionId:
   *                 type: string
   *                 format: uuid
   *                 description: Destination class section
   *               academicYearId:
   *                 type: string
   *                 format: uuid
   *                 description: New academic year
   *               studentIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: Specific students to promote (if empty, promotes all active students)
   *     responses:
   *       201:
   *         description: Students promoted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     promotedCount:
   *                       type: integer
   *                       example: 35
   *                     enrollments:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Enrollment'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Class section or academic year not found
   *       409:
   *         description: Destination section at capacity or students already enrolled
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/bulk-promote', requirePermission('enrollments.create'), controller.bulkPromote);

  /**
   * @openapi
   * /enrollments/{id}:
   *   patch:
   *     tags: [Enrollments]
   *     summary: Update an enrollment
   *     description: |
   *       Update enrollment details such as status or class section.
   *       Commonly used to mark students as graduated, transferred, or withdrawn.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Enrollment ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               classSectionId:
   *                 type: string
   *                 format: uuid
   *                 description: Change class section
   *               status:
   *                 type: string
   *                 enum: [ACTIVE, GRADUATED, TRANSFERRED, WITHDRAWN]
   *               enrollmentDate: { type: string, format: date }
   *     responses:
   *       200:
   *         description: Enrollment updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Enrollment'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: New section at capacity
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('enrollments.update'), controller.update);

  /**
   * @openapi
   * /enrollments/{id}:
   *   delete:
   *     tags: [Enrollments]
   *     summary: Delete an enrollment
   *     description: |
   *       Delete an enrollment record.
   *       Note: Consider updating status to WITHDRAWN instead of deleting for audit purposes.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Enrollment ID
   *     responses:
   *       204:
   *         description: Enrollment deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete enrollment with associated attendance or grades
   */
  router.delete('/:id', requirePermission('enrollments.delete'), controller.remove);

  return router;
}
