import { Router } from 'express';
import type { AuthController } from './auth.controller.ts';
import { authenticate } from '../../shared/middleware/auth.middleware.ts';
import { authRateLimit, refreshRateLimit } from '../../shared/middleware/rate-limit.middleware.ts';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Login with email and password
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email: { type: string, format: email }
   *               password: { type: string, minLength: 8 }
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken: { type: string }
   *                     refreshToken: { type: string }
   *                     user: { type: object }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   *       429:
   *         description: Rate limit exceeded
   */
  router.post('/login', authRateLimit, controller.login);

  /**
   * @openapi
   * /auth/refresh:
   *   post:
   *     tags: [Auth]
   *     summary: Refresh access token
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [refreshToken]
   *             properties:
   *               refreshToken: { type: string }
   *     responses:
   *       200:
   *         description: Token refreshed
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.post('/refresh', refreshRateLimit, controller.refresh);

  /**
   * @openapi
   * /auth/forgot-password:
   *   post:
   *     tags: [Auth]
   *     summary: Request password reset email
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email]
   *             properties:
   *               email: { type: string, format: email }
   *     responses:
   *       200:
   *         description: Reset email sent (always returns 200 for security)
   */
  router.post('/forgot-password', authRateLimit, controller.forgotPassword);

  /**
   * @openapi
   * /auth/reset-password:
   *   post:
   *     tags: [Auth]
   *     summary: Reset password with token
   *     security: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [token, password]
   *             properties:
   *               token: { type: string }
   *               password: { type: string, minLength: 8 }
   *     responses:
   *       200:
   *         description: Password reset successful
   *       400:
   *         description: Invalid or expired token
   */
  router.post('/reset-password', authRateLimit, controller.resetPassword);

  /**
   * @openapi
   * /auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Logout (invalidate refresh token)
   *     responses:
   *       204:
   *         description: Logged out
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.post('/logout', authenticate, controller.logout);

  /**
   * @openapi
   * /auth/me:
   *   get:
   *     tags: [Auth]
   *     summary: Get current user profile
   *     responses:
   *       200:
   *         description: Current user data
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *   patch:
   *     tags: [Auth]
   *     summary: Update current user profile
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fullName: { type: string }
   *               phone: { type: string }
   *     responses:
   *       200:
   *         description: Profile updated
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.get('/me', authenticate, controller.getMe);
  router.patch('/me', authenticate, controller.updateMe);

  return router;
}
