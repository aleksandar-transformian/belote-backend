import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@infrastructure/config';
import { logger } from '@shared/utils/logger';
import { testConnection } from '@infrastructure/database/connection';
import { Container } from '@infrastructure/container/Container';
import { createAuthRoutes } from '@presentation/routes/authRoutes';
import { createUserRoutes } from '@presentation/routes/userRoutes';
import { GameSocketHandler } from '@presentation/socket-handlers/GameSocketHandler';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.socket.corsOrigin,
    credentials: true,
  },
  pingTimeout: config.socket.pingTimeout,
  pingInterval: config.socket.pingInterval,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize container
const container = Container.getInstance();

// API routes
const API_PREFIX = `/api/${config.apiVersion}`;

app.get(API_PREFIX, (req, res) => {
  res.json({ message: 'Belote API', version: config.apiVersion });
});

app.use(`${API_PREFIX}/auth`, createAuthRoutes(container.authController));
app.use(`${API_PREFIX}/users`, createUserRoutes(container.userController));

// Socket.io initialization
const gameSocketHandler = new GameSocketHandler(io);

io.on('connection', (socket) => {
  gameSocketHandler.handleConnection(socket as any);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.port;

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`, {
        environment: config.env,
        apiVersion: config.apiVersion,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

export { app, server, io };
