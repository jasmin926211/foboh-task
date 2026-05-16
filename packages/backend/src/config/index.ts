import dotenv from 'dotenv';
import { DEFAULT_PORT } from '../constants';
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required but not set');
}

const config = {
  port: parseInt(process.env.PORT || String(DEFAULT_PORT), 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
};

export default config;
