import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL must be set in production");
  }
}

// sql is a tagged template literal — escapes params automatically
export const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : null;

// For migrations (DDL), use unpooled connection
export const sqlUnpooled = process.env.DATABASE_URL_UNPOOLED
  ? neon(process.env.DATABASE_URL_UNPOOLED)
  : null;
