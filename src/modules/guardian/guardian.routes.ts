import { Router } from 'express';
import type { GuardianController } from './guardian.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createGuardianRoutes(controller: GuardianController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /guardians:
   *   get:
   *     tags: [Guardians]
   *     summary: List guardians
   *     description: Get a paginated list of guardians for the current school.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *     responses:
   *       200:
   *         description: Guardians retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Guardian'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('guardians.list'), controller.list);

  /**
   * @openapi
   * /guardians/{id}:
   *   get:
   *     tags: [Guardians]
   *     summary: Get a guardian by ID
   *     description: Retrieve detailed information about a specific guardian.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Guardian ID
   *     responses:
   *       200:
   *         description: Guardian retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Guardian'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('guardians.read'), controller.getById);

  /**
   * @openapi
   * /guardians:
   *   post:
   *     tags: [Guardians]
   *     summary: Create a new guardian
   *     description: Create a new guardian/parent record for the current school.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [firstName, lastName, phone]
   *             properties:
   *               firstName:
   *                 type: string
   *                 example: 'John'
   *               lastName:
   *                 type: string
   *                 example: 'Doe'
   *               phone:
   *                 type: string
   *                 example: '+1234567890'
   *               email:
   *                 type: string
   *                 format: email
   *                 example: 'john.doe@example.com'
   *               occupation:
   *                 type: string
   *                 example: 'Engineer'
   *               address:
   *                 type: string
   *                 maxLength: 500
   *     responses:
   *       201:
   *         description: Guardian created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Guardian'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('guardians.create'), controller.create);

  /**
   * @openapi
   * /guardians/{id}:
   *   patch:
   *     tags: [Guardians]
   *     summary: Update a guardian
   *     description: Update guardian details such as contact information or occupation.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Guardian ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName: { type: string }
   *               lastName: { type: string }
   *               phone: { type: string }
   *               email: { type: string, format: email }
   *               occupation: { type: string }
   *               address: { type: string, maxLength: 500 }
   *     responses:
   *       200:
   *         description: Guardian updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Guardian'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('guardians.update'), controller.update);

  /**
   * @openapi
   * /guardians/{id}:
   *   delete:
   *     tags: [Guardians]
   *     summary: Delete a guardian
   *     description: Delete a guardian. Cannot delete guardians with associated students.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Guardian ID
   *     responses:
   *       204:
   *         description: Guardian deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete guardian with associated students
   */
  router.delete('/:id', requirePermission('guardians.delete'), controller.remove);

  return router;
}
