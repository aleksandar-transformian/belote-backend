import { Request, Response } from 'express';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { logger } from '@shared/utils/logger';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  register = async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      const result = await this.registerUserUseCase.execute({
        username,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Registration error', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await this.loginUserUseCase.execute({
        email,
        password,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Login error', { error: error.message });
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Token refresh error', { error: error.message });
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  };
}
