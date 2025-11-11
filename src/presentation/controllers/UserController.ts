import { Response } from 'express';
import { AuthenticatedRequest } from '@presentation/middlewares/authMiddleware';
import { GetUserProfileUseCase } from '@application/use-cases/user/GetUserProfileUseCase';
import { logger } from '@shared/utils/logger';

export class UserController {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const profile = await this.getUserProfileUseCase.execute(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      logger.error('Get profile error', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  };

  getPublicProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const profile = await this.getUserProfileUseCase.execute(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      logger.error('Get public profile error', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  };
}
