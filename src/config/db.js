// src/config/db.js
import pg from 'pg';
import logger from './logger.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

// SSL configuration based on environment
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } 
  : false;

  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER|| 'postgres', // try default 'postgres' user first
    password: process.env.POSTGRES_PASSWORD || 'admin@123',
    database: process.env.POSTGRES_DB || 'welltrackify_db', // try default 'postgres' db first
    ssl: false, // force disable SSL for local testing
    connectionTimeoutMillis: 10000, // increase timeout to 10 seconds
  });

// Enhanced connection test
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT NOW()');
    logger.info('✅ Database connected successfully');
  } catch (err) {
    logger.error('❌ Database connection failed:', err.message);
    logger.error('Connection details:', {
      host: pool.options.host,
      port: pool.options.port,
      user: pool.options.user,
      database: pool.options.database
    });
    process.exit(1);
  } finally {
    if (client) client.release();
  }
};

// Immediately test the connection
testConnection();

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err.message);
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('remove', () => {
  logger.debug('Database connection closed');
});

export const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query in ${duration}ms`, { text });
    return res;
  } catch (err) {
    logger.error('Query error:', { 
      query: text, 
      params, 
      error: err.message,
      stack: err.stack 
    });
    throw err;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;
  
  const timeout = setTimeout(() => {
    logger.warn('Client has been checked out for more than 5 seconds!');
  }, 5000);
  
  client.query = async (...args) => {
    try {
      const start = Date.now();
      const result = await originalQuery.apply(client, args);
      const duration = Date.now() - start;
      logger.debug(`Client query executed in ${duration}ms`);
      return result;
    } catch (err) {
      logger.error('Client query error:', err.message);
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };
  
  client.release = (err) => {
    clearTimeout(timeout);
    if (err) {
      logger.error('Client release with error:', err.message);
    }
    client.release = originalRelease;
    return client.release();
  };
  
  logger.debug('Acquired new client from pool');
  return client;
};

export const shutdown = async () => {
  try {
    await pool.end();
    logger.info('Database pool has ended');
  } catch (err) {
    logger.error('Error shutting down database pool:', err.message);
  }
};