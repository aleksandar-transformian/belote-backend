import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@infrastructure/config';
import { logger } from '@shared/utils/logger';

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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes will be added here
app.get(`/api/${config.apiVersion}`, (req, res) => {
  res.json({ message: 'Belote API', version: config.apiVersion });
});

// Socket.io connection
io.on('connection', socket => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, {
    environment: config.env,
    apiVersion: config.apiVersion,
  });
});

export { app, server, io };
