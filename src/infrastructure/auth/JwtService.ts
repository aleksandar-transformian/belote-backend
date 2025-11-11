import jwt from 'jsonwebtoken';
import { config } from '@infrastructure/config';
import { UserId } from '@domain/value-objects/UserId';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export class JwtService {
  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  public static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  public static verifyAccessToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, config.jwt.secret) as DecodedToken;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  public static verifyRefreshToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as DecodedToken;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  public static decodeToken(token: string): DecodedToken | null {
    try {
      return jwt.decode(token) as DecodedToken;
    } catch {
      return null;
    }
  }
}
