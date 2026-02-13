import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const updateProfileSchema = z
  .object({
    phone: z.string().max(20).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8).max(128).optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword) return !!data.currentPassword;
      return true;
    },
    { message: 'currentPassword is required when changing password', path: ['currentPassword'] },
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
