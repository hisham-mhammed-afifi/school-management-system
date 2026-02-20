import { Router } from 'express';
import type { SubstitutionController } from './substitution.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createSubstitutionRoutes(controller: SubstitutionController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /substitutions:
   *   get:
   *     tags: [Substitutions]
   *     summary: List teacher substitutions
   *     description: Get a paginated list of teacher substitutions with filtering options.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by substitution date
   *       - in: query
   *         name: originalTeacherId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by original teacher
   *       - in: query
   *         name: substituteTeacherId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by substitute teacher
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
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('substitutions.list'), controller.list);

  /**
   * @openapi
   * /substitutions/{id}:
   *   get:
   *     tags: [Substitutions]
   *     summary: Get a substitution by ID
   *     description: Retrieve detailed information about a specific teacher substitution.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Substitution ID
   *     responses:
   *       200:
   *         description: Substitution details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Substitution'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('substitutions.read'), controller.getById);

  /**
   * @openapi
   * /substitutions:
   *   post:
   *     tags: [Substitutions]
   *     summary: Create a substitution
   *     description: |
   *       Create a teacher substitution for a specific lesson and date.
   *       Used when a teacher is absent and needs to be replaced.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [lessonId, date, originalTeacherId, substituteTeacherId]
   *             properties:
   *               lessonId:
   *                 type: string
   *                 format: uuid
   *                 description: Lesson to be substituted
   *               date:
   *                 type: string
   *                 format: date
   *                 description: Date of substitution
   *               originalTeacherId:
   *                 type: string
   *                 format: uuid
   *                 description: Teacher who is absent
   *               substituteTeacherId:
   *                 type: string
   *                 format: uuid
   *                 description: Teacher covering the lesson
   *               reason:
   *                 type: string
   *                 maxLength: 500
   *                 description: Reason for substitution (e.g., sick leave, training)
   *     responses:
   *       201:
   *         description: Substitution created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Substitution'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Lesson or teacher not found
   *       409:
   *         description: Substitute teacher has a conflict at this time
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('substitutions.create'), controller.create);

  /**
   * @openapi
   * /substitutions/{id}:
   *   patch:
   *     tags: [Substitutions]
   *     summary: Update a substitution
   *     description: Update substitution details such as status or substitute teacher.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Substitution ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               substituteTeacherId:
   *                 type: string
   *                 format: uuid
   *                 description: Change the substitute teacher
   *               status:
   *                 type: string
   *                 enum: [pending, confirmed, completed, cancelled]
   *                 description: Update substitution status
   *               reason:
   *                 type: string
   *                 maxLength: 500
   *     responses:
   *       200:
   *         description: Substitution updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Substitution'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: New substitute teacher has a conflict
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('substitutions.update'), controller.update);

  /**
   * @openapi
   * /substitutions/{id}:
   *   delete:
   *     tags: [Substitutions]
   *     summary: Delete a substitution
   *     description: Cancel and delete a substitution record.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Substitution ID
   *     responses:
   *       204:
   *         description: Substitution deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete completed substitutions
   */
  router.delete('/:id', requirePermission('substitutions.delete'), controller.remove);

  return router;
}
