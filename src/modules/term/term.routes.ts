import { Router } from 'express';
import type { TermController } from './term.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTermNestedRoutes(controller: TermController): Router {
  // Mounted at /academic-years/:yearId/terms
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  /**
   * @openapi
   * /academic-years/{yearId}/terms:
   *   get:
   *     tags: [Terms]
   *     summary: List terms for an academic year
   *     description: Get all terms for a specific academic year, ordered by term number.
   *     parameters:
   *       - in: path
   *         name: yearId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Academic year ID
   *     responses:
   *       200:
   *         description: Terms retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Term'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Academic year not found
   */
  router.get('/', requirePermission('terms.view'), controller.listByYear);

  /**
   * @openapi
   * /academic-years/{yearId}/terms:
   *   post:
   *     tags: [Terms]
   *     summary: Create a new term
   *     description: Create a new term for a specific academic year.
   *     parameters:
   *       - in: path
   *         name: yearId
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
   *             required: [name, number, startDate, endDate]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 'First Term'
   *                 description: Term name
   *               number:
   *                 type: integer
   *                 example: 1
   *                 description: Term number/sequence
   *               startDate:
   *                 type: string
   *                 format: date
   *                 description: Start date of the term
   *               endDate:
   *                 type: string
   *                 format: date
   *                 description: End date of the term
   *     responses:
   *       201:
   *         description: Term created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Term'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Academic year not found
   *       409:
   *         description: Term number already exists for this academic year
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('terms.create'), controller.create);

  return router;
}

export function createTermRoutes(controller: TermController): Router {
  // Mounted at /terms
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /terms/{id}:
   *   patch:
   *     tags: [Terms]
   *     summary: Update a term
   *     description: Update term details such as name, number, or dates.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Term ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string, example: 'First Term' }
   *               number: { type: integer, example: 1 }
   *               startDate: { type: string, format: date }
   *               endDate: { type: string, format: date }
   *     responses:
   *       200:
   *         description: Term updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Term'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('terms.update'), controller.update);

  /**
   * @openapi
   * /terms/{id}:
   *   delete:
   *     tags: [Terms]
   *     summary: Delete a term
   *     description: Delete a term. Cannot delete terms with associated exams or enrollments.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Term ID
   *     responses:
   *       204:
   *         description: Term deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete term with associated data
   */
  router.delete('/:id', requirePermission('terms.delete'), controller.remove);

  return router;
}
