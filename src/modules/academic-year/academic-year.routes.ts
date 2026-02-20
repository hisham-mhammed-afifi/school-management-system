import { Router } from 'express';
import type { AcademicYearController } from './academic-year.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createAcademicYearRoutes(controller: AcademicYearController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /academic-years:
   *   get:
   *     tags: [Academic Years]
   *     summary: List academic years
   *     description: Get a paginated list of academic years for the current school.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [draft, active, completed]
   *         description: Filter by academic year status
   *     responses:
   *       200:
   *         description: Academic years retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AcademicYear'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('academic-years.list'), controller.list);

  /**
   * @openapi
   * /academic-years/{id}:
   *   get:
   *     tags: [Academic Years]
   *     summary: Get an academic year by ID
   *     description: Retrieve detailed information about a specific academic year.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Academic year ID
   *     responses:
   *       200:
   *         description: Academic year retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AcademicYear'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('academic-years.read'), controller.getById);

  /**
   * @openapi
   * /academic-years:
   *   post:
   *     tags: [Academic Years]
   *     summary: Create a new academic year
   *     description: Create a new academic year for the current school.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, startDate, endDate]
   *             properties:
   *               name:
   *                 type: string
   *                 example: '2024-2025'
   *                 description: Academic year name
   *               startDate:
   *                 type: string
   *                 format: date
   *                 description: Start date of the academic year
   *               endDate:
   *                 type: string
   *                 format: date
   *                 description: End date of the academic year
   *     responses:
   *       201:
   *         description: Academic year created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AcademicYear'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Academic year with this name already exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('academic-years.create'), controller.create);

  /**
   * @openapi
   * /academic-years/{id}:
   *   patch:
   *     tags: [Academic Years]
   *     summary: Update an academic year
   *     description: Update academic year details such as name, dates, or status.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Academic year ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string, example: '2024-2025' }
   *               startDate: { type: string, format: date }
   *               endDate: { type: string, format: date }
   *               status: { type: string, enum: [draft, active, completed] }
   *     responses:
   *       200:
   *         description: Academic year updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AcademicYear'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('academic-years.update'), controller.update);

  /**
   * @openapi
   * /academic-years/{id}/activate:
   *   post:
   *     tags: [Academic Years]
   *     summary: Activate an academic year
   *     description: |
   *       Set an academic year as the active year for the school.
   *       This will deactivate any previously active academic year.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Academic year ID to activate
   *     responses:
   *       200:
   *         description: Academic year activated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AcademicYear'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.post('/:id/activate', requirePermission('academic-years.activate'), controller.activate);

  /**
   * @openapi
   * /academic-years/{id}:
   *   delete:
   *     tags: [Academic Years]
   *     summary: Delete an academic year
   *     description: |
   *       Delete an academic year. Cannot delete active academic years or years with associated data.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Academic year ID
   *     responses:
   *       204:
   *         description: Academic year deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete active academic year or year with associated data
   */
  router.delete('/:id', requirePermission('academic-years.delete'), controller.remove);

  return router;
}
