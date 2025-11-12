import { Server, Socket } from 'socket.io';
import { BaseSocketHandler, AuthenticatedSocket } from './BaseSocketHandler';
import { GameStateManager } from '@application/services/GameStateManager';
import { RedisService } from '@infrastructure/redis/RedisService';
import { ClientEvents, ServerEvents } from '@shared/types/SocketEvents';
import { logger } from '@shared/utils/logger';
import { TrickService } from '@domain/services/TrickService';
import { BiddingService } from '@domain/services/BiddingService';
import { Card } from '@domain/entities/Card';
import { Suit } from '@domain/value-objects/Suit';

export class GameSocketHandler extends BaseSocketHandler {
  constructor(private io: Server) {
    super();
  }

  public handleConnection(socket: AuthenticatedSocket): void {
    logger.info('Game socket connected', {
      socketId: socket.id,
      userId: socket.userId,
    });

    // Authentication
    socket.on(ClientEvents.AUTHENTICATE, (data) => this.handleAuthenticate(socket, data));

    // Game Events
    socket.on(ClientEvents.JOIN_GAME, (data) => this.handleJoinGame(socket, data));
    socket.on(ClientEvents.READY, (data) => this.handleReady(socket, data));
    socket.on(ClientEvents.PLACE_BID, (data) => this.handlePlaceBid(socket, data));
    socket.on(ClientEvents.PLAY_CARD, (data) => this.handlePlayCard(socket, data));
    socket.on(ClientEvents.DECLARE, (data) => this.handleDeclare(socket, data));

    // Disconnection
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  private async handleAuthenticate(socket: AuthenticatedSocket, data: { token: string }): Promise<void> {
    const authenticated = await this.authenticateSocket(socket, data.token);

    if (authenticated) {
      // Join user room for private messages
      socket.join(`user:${socket.userId}`);

      // Save socket session
      await RedisService.setSocketSession(socket.userId!, socket.id);

      socket.emit(ServerEvents.AUTHENTICATED, {
        userId: socket.userId,
        username: socket.username,
      });

      logger.info('Socket authenticated', {
        userId: socket.userId,
        socketId: socket.id,
      });
    } else {
      socket.emit(ServerEvents.AUTH_ERROR, { message: 'Authentication failed' });
      socket.disconnect();
    }
  }

  private async handleJoinGame(socket: AuthenticatedSocket, data: { gameId: string }): Promise<void> {
    if (!socket.userId) {
      return this.emitError(socket, 'Not authenticated');
    }

    const { gameId } = data;

    try {
      // Join game room
      socket.join(`game:${gameId}`);

      // Get game state
      const gameState = await GameStateManager.getGameState(gameId);

      // Notify others
      this.broadcastToGame(this.io, gameId, ServerEvents.PLAYER_JOINED, {
        playerId: socket.userId,
        username: socket.username,
      });

      // Send current state to joining player
      socket.emit(ServerEvents.GAME_STARTED, gameState);

      logger.info('Player joined game', {
        userId: socket.userId,
        gameId,
      });
    } catch (error: any) {
      this.emitError(socket, 'Failed to join game', error.message);
    }
  }

  private async handleReady(socket: AuthenticatedSocket, data: { gameId: string }): Promise<void> {
    if (!socket.userId) {
      return this.emitError(socket, 'Not authenticated');
    }

    const { gameId } = data;

    this.broadcastToGame(this.io, gameId, ServerEvents.PLAYER_READY, {
      playerId: socket.userId,
    });
  }

  private async handlePlaceBid(socket: AuthenticatedSocket, data: any): Promise<void> {
    if (!socket.userId) {
      return this.emitError(socket, 'Not authenticated');
    }

    const { gameId, bidType, contract } = data;

    try {
      const gameState = await GameStateManager.getGameState(gameId);
      if (!gameState) {
        return this.emitError(socket, 'Game not found');
      }

      // Validate it's player's turn
      const players = ['player1', 'player2', 'player3', 'player4']; // Get from game
      const currentPlayer = players[gameState.currentPlayerIndex];

      if (currentPlayer !== socket.userId) {
        return this.emitError(socket, 'Not your turn');
      }

      // Validate bid
      const bid = {
        playerId: socket.userId,
        type: bidType,
        contract: contract,
        timestamp: new Date(),
      };

      // Add bid to game state
      gameState.bids.push(bid);
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % 4;

      // Check if bidding is complete
      const biddingComplete = BiddingService.isBiddingComplete(gameState.bids);

      if (biddingComplete) {
        const finalContract = BiddingService.getFinalContract(gameState.bids);
        gameState.contract = finalContract.contract;
        gameState.trumpSuit = finalContract.contract;
        gameState.phase = 'DECLARING';

        this.broadcastToGame(this.io, gameId, ServerEvents.BIDDING_COMPLETE, {
          contract: finalContract,
        });
      } else {
        this.broadcastToGame(this.io, gameId, ServerEvents.BID_PLACED, { bid });
      }

      // Save updated state
      await GameStateManager.saveGameState(gameId, gameState);

      // Notify next player
      const nextPlayerId = players[gameState.currentPlayerIndex];
      this.emitToPlayer(this.io, nextPlayerId, ServerEvents.YOUR_TURN, {
        action: 'bid',
      });
    } catch (error: any) {
      this.emitError(socket, 'Failed to place bid', error.message);
    }
  }

  private async handlePlayCard(socket: AuthenticatedSocket, data: any): Promise<void> {
    if (!socket.userId) {
      return this.emitError(socket, 'Not authenticated');
    }

    const { gameId, card } = data;

    try {
      const gameState = await GameStateManager.getGameState(gameId);
      if (!gameState) {
        return this.emitError(socket, 'Game not found');
      }

      // Get player's hand
      const hand = await GameStateManager.getPlayerHand(gameId, socket.userId);
      if (!hand) {
        return this.emitError(socket, 'Hand not found');
      }

      // Validate card is in hand
      const playedCard = Card.create(card);
      const cardInHand = hand.find((c) => c.equals(playedCard));
      if (!cardInHand) {
        return this.emitError(socket, 'Card not in hand');
      }

      // Validate play is legal
      const trumpSuit = gameState.trumpSuit ? Suit.create(gameState.trumpSuit as any) : null;
      const isValid = TrickService.isValidPlay(
        playedCard,
        hand,
        gameState.currentTrick,
        trumpSuit,
        0, // partner index
        gameState.currentPlayerIndex
      );

      if (!isValid) {
        return this.emitError(socket, 'Invalid card play');
      }

      // Add card to current trick
      gameState.currentTrick.push({
        playerId: socket.userId,
        card: card,
      });

      // Remove card from hand
      await GameStateManager.removeCard(gameId, socket.userId, playedCard);

      // Broadcast card played
      this.broadcastToGame(this.io, gameId, ServerEvents.CARD_PLAYED, {
        playerId: socket.userId,
        card: card,
      });

      // Check if trick is complete (4 cards)
      if (gameState.currentTrick.length === 4) {
        const winner = TrickService.getTrickWinner(
          gameState.currentTrick.map((p) => ({
            playerId: p.playerId,
            card: Card.create(p.card),
          })),
          trumpSuit
        );

        const trickPoints = TrickService.calculateTrickPoints(
          gameState.currentTrick.map((p) => ({
            playerId: p.playerId,
            card: Card.create(p.card),
          })),
          trumpSuit
        );

        this.broadcastToGame(this.io, gameId, ServerEvents.TRICK_COMPLETE, {
          winner: winner?.playerId,
          points: trickPoints,
        });

        // Reset trick
        gameState.currentTrick = [];

        // Winner starts next trick
        // gameState.currentPlayerIndex = winner index
      }

      // Update game state
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % 4;
      await GameStateManager.saveGameState(gameId, gameState);
    } catch (error: any) {
      this.emitError(socket, 'Failed to play card', error.message);
    }
  }

  private async handleDeclare(socket: AuthenticatedSocket, data: any): Promise<void> {
    if (!socket.userId) {
      return this.emitError(socket, 'Not authenticated');
    }

    const { gameId, declaration } = data;

    // Add declaration to game state
    // Broadcast to all players
    this.broadcastToGame(this.io, gameId, ServerEvents.DECLARATION_MADE, {
      playerId: socket.userId,
      declaration,
    });
  }

  private async handleDisconnect(socket: AuthenticatedSocket): Promise<void> {
    logger.info('Socket disconnected', {
      socketId: socket.id,
      userId: socket.userId,
    });

    if (socket.userId) {
      await RedisService.deleteSocketSession(socket.id);

      // Notify game about disconnection
      // Start reconnection timer
      // If timer expires, activate bot
    }
  }
}
