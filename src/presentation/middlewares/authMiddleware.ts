import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@infrastructure/auth/JwtService';
import { logger } from '@shared/utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = JwtService.verifyAccessToken(token);

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    logger.warn('Authentication failed', { error: error.message });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
