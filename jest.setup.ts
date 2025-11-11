// Jest setup file to configure test environment
// This file runs before all tests to set up necessary environment variables

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.API_VERSION = 'v1';

// Database configuration for tests
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5433';
process.env.DATABASE_NAME = 'belote_test_db';
process.env.DATABASE_USER = 'belote_user';
process.env.DATABASE_PASSWORD = 'belote_password_test';
process.env.DATABASE_POOL_MIN = '2';
process.env.DATABASE_POOL_MAX = '5';

// Redis configuration for tests
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.REDIS_DB = '1';

// JWT configuration for tests
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Security configuration for tests
process.env.BCRYPT_ROUNDS = '4'; // Lower rounds for faster tests
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';

// Socket.io configuration for tests
process.env.SOCKET_CORS_ORIGIN = 'http://localhost:3001';
process.env.SOCKET_PING_TIMEOUT = '30000';
process.env.SOCKET_PING_INTERVAL = '25000';

// Logging configuration for tests
process.env.LOG_LEVEL = 'error'; // Only log errors during tests
process.env.LOG_FORMAT = 'json';

// Game configuration for tests
process.env.MAX_RECONNECTION_TIME = '60000';
process.env.MATCHMAKING_TIMEOUT = '120000';
process.env.GAME_TURN_TIMEOUT = '60000';
