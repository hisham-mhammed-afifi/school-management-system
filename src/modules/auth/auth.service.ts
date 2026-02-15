import * as jose from 'jose';
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { LoginInput, UpdateProfileInput } from './auth.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import { hashPassword, verifyPassword } from '../../shared/utils/password.ts';
import { env } from '../../config/env.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export class AuthService {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async login(input: LoginInput) {
    const user = await this.db.user.findUnique({
      where: { email: input.email },
      include: {
        school: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
            school: true,
          },
        },
      },
    });

    if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

    const validPassword = await verifyPassword(user.passwordHash, input.password);
    if (!validPassword) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

    if (!user.isActive) throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED');

    // Check school status (for non-super-admin users)
    if (user.school) {
      if (user.school.status === 'suspended') {
        throw new AppError('School is suspended', 403, 'SCHOOL_SUSPENDED');
      }
      if (user.school.status === 'archived') {
        throw new AppError('School is archived', 403, 'SCHOOL_ARCHIVED');
      }
      if (
        user.school.subscriptionExpiresAt &&
        user.school.subscriptionExpiresAt < new Date()
      ) {
        throw new AppError('School subscription has expired', 403, 'SUBSCRIPTION_EXPIRED');
      }
    }

    // Collect roles and permissions
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissionSet = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        permissionSet.add(rp.permission.name);
      }
    }
    const permissions = [...permissionSet];

    // Build user roles context for response
    const userRolesContext = user.userRoles.map((ur) => ({
      roleId: ur.role.id,
      roleName: ur.role.name,
      schoolId: ur.school?.id ?? null,
      schoolName: ur.school?.name ?? null,
    }));

    const jwtPayload: JwtPayload = {
      sub: user.id,
      schoolId: user.schoolId,
      roles,
      permissions,
    };

    const accessToken = await new jose.SignJWT(jwtPayload as unknown as jose.JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN)
      .sign(JWT_SECRET);

    const refreshToken = await new jose.SignJWT({ sub: user.id, type: 'refresh' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
      .sign(JWT_SECRET);

    // Update last login
    await this.db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: parseExpiry(env.JWT_EXPIRES_IN),
      user: {
        id: user.id,
        email: user.email,
        roles: userRolesContext,
      },
    };
  }

  async refresh(refreshTokenStr: string) {
    try {
      const { payload } = await jose.jwtVerify(refreshTokenStr, JWT_SECRET);
      if (payload['type'] !== 'refresh') {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      const userId = payload.sub as string;
      const user = await this.db.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: { rolePermissions: { include: { permission: true } } },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      const roles = user.userRoles.map((ur) => ur.role.name);
      const permissionSet = new Set<string>();
      for (const ur of user.userRoles) {
        for (const rp of ur.role.rolePermissions) {
          permissionSet.add(rp.permission.name);
        }
      }

      const jwtPayload: JwtPayload = {
        sub: user.id,
        schoolId: user.schoolId,
        roles,
        permissions: [...permissionSet],
      };

      const accessToken = await new jose.SignJWT(jwtPayload as unknown as jose.JWTPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRES_IN)
        .sign(JWT_SECRET);

      return { accessToken, expiresIn: parseExpiry(env.JWT_EXPIRES_IN) };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return;

    const resetToken = await new jose.SignJWT({ sub: user.id, type: 'reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(JWT_SECRET);

    // TODO: Send email with reset token/link
    // For now, log the token in development
    if (env.NODE_ENV === 'development') {
      const { logger } = await import('../../shared/utils/logger.ts');
      logger.info({ resetToken, email }, 'Password reset token generated');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      if (payload['type'] !== 'reset') {
        throw new AppError('Invalid reset token', 401, 'INVALID_RESET_TOKEN');
      }

      const userId = payload.sub as string;
      const passwordHash = await hashPassword(newPassword);

      await this.db.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Invalid or expired reset token', 401, 'INVALID_RESET_TOKEN');
    }
  }

  async getMe(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
            school: true,
          },
        },
        teacher: true,
        student: true,
        guardian: true,
      },
    });

    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    let linkedEntity: { type: string; id: string } | null = null;
    if (user.teacher) linkedEntity = { type: 'teacher', id: user.teacher.id };
    else if (user.student) linkedEntity = { type: 'student', id: user.student.id };
    else if (user.guardian) linkedEntity = { type: 'guardian', id: user.guardian.id };

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      roles: user.userRoles.map((ur) => ({
        roleId: ur.role.id,
        roleName: ur.role.name,
        schoolId: ur.school?.id ?? null,
        schoolName: ur.school?.name ?? null,
      })),
      linkedEntity,
    };
  }

  async updateMe(userId: string, input: UpdateProfileInput) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    const data: Record<string, unknown> = {};

    if (input.phone !== undefined) data['phone'] = input.phone;

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new AppError('Current password is required', 400, 'CURRENT_PASSWORD_REQUIRED');
      }
      const valid = await verifyPassword(user.passwordHash, input.currentPassword);
      if (!valid) throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS');
      data['passwordHash'] = await hashPassword(input.newPassword);
    }

    if (Object.keys(data).length === 0) {
      return this.getMe(userId);
    }

    await this.db.user.update({ where: { id: userId }, data });
    return this.getMe(userId);
  }
}

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match || !match[1] || !match[2]) return 3600;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (multipliers[unit] ?? 3600);
}
