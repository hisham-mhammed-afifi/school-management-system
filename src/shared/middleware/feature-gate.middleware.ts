import type { Request, Response, NextFunction } from 'express';
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { SubscriptionPlan } from '../../generated/prisma/enums.ts';
import { AppError } from '../errors/app-error.ts';
import { extractSchoolId } from './auth.middleware.ts';

const PLAN_HIERARCHY: readonly SubscriptionPlan[] = ['free', 'basic', 'premium', 'enterprise'] as const;

const FEATURE_PLAN_MAP = {
  auto_scheduling: 'premium',
  per_lesson_attendance: 'premium',
  report_cards: 'basic',
  fee_management: 'basic',
  online_payment: 'premium',
  sms_notifications: 'premium',
  custom_roles: 'premium',
  api_access: 'enterprise',
  audit_logs: 'premium',
} as const;

export type Feature = keyof typeof FEATURE_PLAN_MAP;

function planMeetsMinimum(current: SubscriptionPlan, required: SubscriptionPlan): boolean {
  const currentIndex = PLAN_HIERARCHY.indexOf(current);
  const requiredIndex = PLAN_HIERARCHY.indexOf(required);
  return currentIndex >= requiredIndex;
}

/**
 * Middleware factory that gates routes behind a subscription feature.
 * Fetches the school's current plan and checks if it meets the minimum tier.
 */
export function requireFeature(feature: Feature, prisma: PrismaClient) {
  const requiredPlan = FEATURE_PLAN_MAP[feature];

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const schoolId = extractSchoolId(req);

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { subscriptionPlan: true },
    });

    if (!school) {
      throw new AppError('School not found', 404, 'SCHOOL_NOT_FOUND');
    }

    if (!planMeetsMinimum(school.subscriptionPlan, requiredPlan)) {
      throw new AppError(
        `Feature "${feature}" requires "${requiredPlan}" plan or higher. Current plan: "${school.subscriptionPlan}"`,
        403,
        'FEATURE_NOT_AVAILABLE',
      );
    }

    next();
  };
}
