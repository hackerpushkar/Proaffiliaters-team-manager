/**
 * ============================================================================
 * HEADER BLOCK: lib/mongodb.ts — Master MongoDB Connection Layer
 * ============================================================================
 * WHAT THIS FILE DOES:
 * Establishes a cached, resilient connection to MongoDB using Mongoose.
 * Prevents multiple active connections in Next.js hot-reload development environments.
 *
 * WHY THIS FILE EXISTS:
 * Enables real multi-user persistence for Proaffiliaters Team & Task Manager
 * on self-hosted VPS servers (alongside the Proaffiliaters web application).
 *
 * HOW IT FITS INTO THE OVERALL WORKFLOW:
 * Imported by all /app/api/* route handlers to query and write to the database.
 * ============================================================================
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/proaffiliaters_tasks";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.warn("MongoDB connection deferred (offline or local fallback):", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

/**
 * ============================================================================
 * FOOTER BLOCK: lib/mongodb.ts Implementation Notes
 * ============================================================================
 * - Workflow: Uses global caching to prevent connection exhaustion in serverless runtimes.
 * - Caveat: Timeout configured to 5000ms so API routes gracefully handle disconnected databases.
 * ============================================================================
 */
