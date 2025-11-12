import { Socket } from 'socket.io';
import { logger } from '@shared/utils/logger';
import { JwtService } from '@infrastructure/auth/JwtService';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export class BaseSocketHandler {
  protected async authenticateSocket(socket: Socket, token: string): Promise<boolean> {
    try {
      const decoded = JwtService.verifyAccessToken(token);
      (socket as AuthenticatedSocket).userId = decoded.userId;
      (socket as AuthenticatedSocket).username = decoded.username;
      return true;
    } catch (error) {
      logger.warn('Socket authentication failed', { socketId: socket.id });
      return false;
    }
  }

  protected emitError(socket: Socket, message: string, details?: any): void {
    socket.emit('error', { message, details, timestamp: new Date().toISOString() });
    logger.warn('Socket error emitted', { socketId: socket.id, message });
  }

  protected broadcastToGame(io: any, gameId: string, event: string, data: any): void {
    io.to(`game:${gameId}`).emit(event, data);
  }

  protected emitToPlayer(io: any, userId: string, event: string, data: any): void {
    io.to(`user:${userId}`).emit(event, data);
  }
}
