import type { Request, Response } from 'express';
import type { AuthService } from './auth.service.ts';
import {
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from './auth.schema.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class AuthController {
  private readonly authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  login = async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const result = await this.authService.login(input);
    res.json({ success: true, data: result });
  };

  refresh = async (req: Request, res: Response) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await this.authService.refresh(refreshToken);
    res.json({ success: true, data: result });
  };

  logout = async (_req: Request, res: Response) => {
    // Stateless JWT — client discards tokens. For stateful revocation, use a blocklist.
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    await this.authService.forgotPassword(email);
    res.json({ success: true, data: { message: 'If the email exists, a reset link has been sent' } });
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    await this.authService.resetPassword(token, newPassword);
    res.json({ success: true, data: { message: 'Password reset successfully' } });
  };

  getMe = async (req: Request, res: Response) => {
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const result = await this.authService.getMe(user.sub);
    res.json({ success: true, data: result });
  };

  updateMe = async (req: Request, res: Response) => {
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const input = updateProfileSchema.parse(req.body);
    const result = await this.authService.updateMe(user.sub, input);
    res.json({ success: true, data: result });
  };
}
