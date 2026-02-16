import { Router } from 'express';
import type { PeriodSetController } from './period-set.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createPeriodSetRoutes(controller: PeriodSetController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /period-sets:
   *   get:
   *     tags: [Timetable]
   *     summary: List period sets
   *     description: |
   *       Get a list of period sets (schedule templates) for the current school.
   *       A period set defines the weekly schedule structure with working days and time periods.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *     responses:
   *       200:
   *         description: Period sets retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/PeriodSet'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('scheduling.view'), controller.list);

  /**
   * @openapi
   * /period-sets/{id}:
   *   get:
   *     tags: [Timetable]
   *     summary: Get a period set by ID
   *     description: Retrieve detailed information about a specific period set including working days and periods.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Period set ID
   *     responses:
   *       200:
   *         description: Period set retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/PeriodSet'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('scheduling.view'), controller.getById);

  /**
   * @openapi
   * /period-sets:
   *   post:
   *     tags: [Timetable]
   *     summary: Create a new period set
   *     description: |
   *       Create a new schedule template for the school.
   *       Period sets define the weekly structure of classes.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 'Regular Schedule'
   *               description:
   *                 type: string
   *                 example: 'Standard 5-day week schedule'
   *               isActive:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       201:
   *         description: Period set created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/PeriodSet'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('scheduling.manage'), controller.create);

  /**
   * @openapi
   * /period-sets/{id}:
   *   patch:
   *     tags: [Timetable]
   *     summary: Update a period set
   *     description: Update period set details such as name, description, or active status.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Period set ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               description: { type: string }
   *               isActive: { type: boolean }
   *     responses:
   *       200:
   *         description: Period set updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/PeriodSet'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('scheduling.manage'), controller.update);

  /**
   * @openapi
   * /period-sets/{id}:
   *   delete:
   *     tags: [Timetable]
   *     summary: Delete a period set
   *     description: Delete a period set. Cannot delete period sets that are in use by working days or lessons.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Period set ID
   *     responses:
   *       204:
   *         description: Period set deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete period set with associated working days or lessons
   */
  router.delete('/:id', requirePermission('scheduling.manage'), controller.remove);

  return router;
}
