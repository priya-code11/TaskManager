import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// 1. Set up the native pg connection pool with strict search_path configuration
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  // 💡 THIS IS THE CRITICAL FIX FOR DRIVER ADAPTERS:
  // It forces the underlying native connection to pool directly into your schema.
  search_path: 'taskDB' 
});

// 2. Instantiate the Prisma PostgreSQL Driver Adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter instance directly into PrismaClient
export const prisma = new PrismaClient({ adapter });