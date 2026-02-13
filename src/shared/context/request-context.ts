import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  userId: string | null;
  schoolId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
  return requestContext.getStore() ?? { userId: null, schoolId: null, ipAddress: null, userAgent: null };
}

export function updateRequestContext(updates: Partial<RequestContext>): void {
  const ctx = requestContext.getStore();
  if (ctx) {
    if (updates.userId !== undefined) ctx.userId = updates.userId;
    if (updates.schoolId !== undefined) ctx.schoolId = updates.schoolId;
  }
}
