import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema-sqlite.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Extract file path from DATABASE_URL (remove file:// prefix)
const dbPath = process.env.DATABASE_URL.replace('file:', '');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export * from './schema-sqlite.js';