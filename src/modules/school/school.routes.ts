import { Router } from 'express';
import type { SchoolController } from './school.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createPlatformSchoolRoutes(controller: SchoolController): Router {
  const router = Router();

  router.use(authenticate);
  router.use(requirePermission('platform.manage'));

  /**
   * @openapi
   * /platform/schools:
   *   post:
   *     tags: [Schools]
   *     summary: Create a new school (platform admin)
   *     description: Create a new school in the multi-tenant platform. Only platform administrators can perform this action.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, code, timezone, subscriptionPlan]
   *             properties:
   *               name: { type: string, minLength: 1, maxLength: 255, example: 'Springfield High School' }
   *               code: { type: string, minLength: 1, maxLength: 50, pattern: '^[a-z0-9-]+$', example: 'springfield-hs' }
   *               timezone: { type: string, example: 'America/New_York' }
   *               defaultLocale: { type: string, default: 'en', example: 'en' }
   *               currency: { type: string, length: 3, default: 'USD', example: 'USD' }
   *               country: { type: string, maxLength: 100 }
   *               city: { type: string, maxLength: 100 }
   *               address: { type: string }
   *               phone: { type: string, maxLength: 20 }
   *               email: { type: string, format: email, maxLength: 255 }
   *               website: { type: string, format: uri, maxLength: 255 }
   *               subscriptionPlan: { type: string, enum: ['free', 'basic', 'premium', 'enterprise'] }
   *     responses:
   *       201:
   *         description: School created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/School'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only platform administrators can create schools
   *       409:
   *         description: School code already exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', controller.create);

  /**
   * @openapi
   * /platform/schools:
   *   get:
   *     tags: [Schools]
   *     summary: List all schools (platform admin)
   *     description: Get a paginated list of all schools in the platform with filtering and sorting options.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - $ref: '#/components/parameters/SearchParam'
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, name, code]
   *           default: createdAt
   *         description: Field to sort by
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Sort order
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, suspended, archived]
   *         description: Filter by school status
   *       - in: query
   *         name: plan
   *         schema:
   *           type: string
   *           enum: [free, basic, premium, enterprise]
   *         description: Filter by subscription plan
   *     responses:
   *       200:
   *         description: Schools retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/School'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only platform administrators can list all schools
   */
  router.get('/', controller.list);

  /**
   * @openapi
   * /platform/schools/{id}:
   *   get:
   *     tags: [Schools]
   *     summary: Get a school by ID (platform admin)
   *     description: Retrieve detailed information about a specific school.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: School ID
   *     responses:
   *       200:
   *         description: School details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/School'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only platform administrators can view school details
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', controller.getById);

  /**
   * @openapi
   * /platform/schools/{id}:
   *   patch:
   *     tags: [Schools]
   *     summary: Update a school (platform admin)
   *     description: Update school details including subscription plan, status, and expiration date.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: School ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string, minLength: 1, maxLength: 255 }
   *               logoUrl: { type: string, format: uri }
   *               timezone: { type: string }
   *               defaultLocale: { type: string, maxLength: 10 }
   *               currency: { type: string, length: 3 }
   *               country: { type: string, maxLength: 100 }
   *               city: { type: string, maxLength: 100 }
   *               address: { type: string }
   *               phone: { type: string, maxLength: 20 }
   *               email: { type: string, format: email, maxLength: 255 }
   *               website: { type: string, format: uri, maxLength: 255 }
   *               subscriptionPlan: { type: string, enum: ['free', 'basic', 'premium', 'enterprise'] }
   *               subscriptionExpiresAt: { type: string, format: date-time }
   *               status: { type: string, enum: ['active', 'suspended', 'archived'] }
   *     responses:
   *       200:
   *         description: School updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/School'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only platform administrators can update schools
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', controller.update);

  /**
   * @openapi
   * /platform/schools/{id}/suspend:
   *   post:
   *     tags: [Schools]
   *     summary: Suspend a school (platform admin)
   *     description: |
   *       Suspend a school's access to the platform. When suspended:
   *       - School users cannot log in
   *       - School data remains intact
   *       - Can be reactivated later
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: School ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason: { type: string, maxLength: 500, description: 'Reason for suspension' }
   *     responses:
   *       200:
   *         description: School suspended successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/School'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only platform administrators can suspend schools
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: School is already suspended
   */
  router.post('/:id/suspend', controller.suspend);

  /**
   * @openapi
   * /platform/schools/{id}/reactivate:
   *   post:
   *     tags: [Schools]
   *     summary: Reactivate a suspended school (platform admin)
   *     description: Reactivate a previously suspended school, restoring full access to the platform.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: School ID
   *     responses:
   *       200:
   *         description: School reactivated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/School'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only platform administrators can reactivate schools
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: School is already active
   */
  router.post('/:id/reactivate', controller.reactivate);

  return router;
}

export function createSchoolProfileRoutes(controller: SchoolController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /school/profile:
   *   get:
   *     tags: [Schools]
   *     summary: Get current school profile
   *     description: |
   *       Get the profile of the current school (based on the authenticated user's school context).
   *       School administrators can view their own school's profile.
   *     responses:
   *       200:
   *         description: School profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/School'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('school.read'), controller.getProfile);

  /**
   * @openapi
   * /school/profile:
   *   patch:
   *     tags: [Schools]
   *     summary: Update current school profile
   *     description: |
   *       Update the current school's profile. School administrators can update:
   *       - School name, logo, contact information
   *       - Cannot update: subscription plan, status, expiration date (platform admin only)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string, minLength: 1, maxLength: 255 }
   *               logoUrl: { type: string, format: uri }
   *               address: { type: string }
   *               phone: { type: string, maxLength: 20 }
   *               email: { type: string, format: email, maxLength: 255 }
   *               website: { type: string, format: uri, maxLength: 255 }
   *     responses:
   *       200:
   *         description: School profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/School'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/', requirePermission('school.update'), controller.updateProfile);

  return router;
}
