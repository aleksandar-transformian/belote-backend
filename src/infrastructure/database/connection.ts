import { Pool, PoolConfig } from 'pg';
import { config } from '@infrastructure/config';
import { logger } from '@shared/utils/logger';

const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  min: config.database.poolMin,
  max: config.database.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err.message });
  process.exit(-1);
});

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection successful', { timestamp: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error });
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  await pool.end();
  logger.info('Database connection pool closed');
}
