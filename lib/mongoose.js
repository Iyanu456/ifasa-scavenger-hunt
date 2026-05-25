import mongoose from 'mongoose';
import { seed } from '@/lib/seed';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Don't throw at module load time — throw only when connectDB() is called
  // so that Next.js can still build without env vars
}

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI env var is not set');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  await seed();
  return cached.conn;
}
