// src/db/client.ts
import 'dotenv/config'; // <— добавь эту строку
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const url = process.env.DATABASE_URL!;
export const db = drizzle(
  postgres(url, {
    max: 10,
    prepare: true,
    // для Supabase/pooler нужен TLS
    ssl: 'require', // эквивалентно ?sslmode=require
  }),
);
