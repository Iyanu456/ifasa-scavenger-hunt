// Standalone seed script — run with: node scripts/seed.js
// Reads from .env.local automatically via dotenv

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Manually load .env.local (dotenv not installed, parse it ourselves)
const envPath = resolve(process.cwd(), '.env.local');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

const CodeConfigSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  location: String,
  points: Number,
  active: { type: Boolean, default: false },
  activated_at: { type: String, default: null },
});

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password_hash: String,
  created_at: String,
});

const CodeConfig = mongoose.models.CodeConfig || mongoose.model('CodeConfig', CodeConfigSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

function watNow() {
  const now = new Date();
  const wat = new Date(now.getTime() + 60 * 60 * 1000);
  return wat.toISOString().replace('T', ' ').substring(0, 19) + ' WAT';
}

const CODES = [
  { slug: 'code-01', location: 'Amphitheatre', points: 10, active: true },
  { slug: 'code-02', location: 'Spider Building', points: 10, active: true },
  { slug: 'code-03', location: 'Department of Architecture', points: 15, active: true },
  { slug: 'code-04', location: 'College of Medicine', points: 15, active: true },
  { slug: 'code-05', location: 'Faculty of Law / Admin / Social Sciences', points: 20, active: true },
  { slug: 'code-06', location: 'Summit Venue', points: 100, active: false },
];

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected.');

  // Codes
  const codeCount = await CodeConfig.countDocuments();
  if (codeCount === 0) {
    await CodeConfig.insertMany(CODES);
    console.log(`✓ Inserted ${CODES.length} codes`);
  } else {
    console.log(`  Codes already exist (${codeCount} found) — skipping`);
  }

  // Admins
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    let adminSeed = [];
    try { adminSeed = JSON.parse(process.env.ADMIN_SEED || '[]'); }
    catch { console.error('Failed to parse ADMIN_SEED'); process.exit(1); }

    const admins = await Promise.all(
      adminSeed.map(async (a) => ({
        name: a.name,
        email: a.email,
        password_hash: await bcrypt.hash(a.password, 10),
        created_at: watNow(),
      }))
    );
    await Admin.insertMany(admins);
    console.log(`✓ Inserted ${admins.length} admin(s): ${admins.map(a => a.email).join(', ')}`);
  } else {
    console.log(`  Admins already exist (${adminCount} found) — skipping`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch((err) => { console.error(err); process.exit(1); });
