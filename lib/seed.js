import bcrypt from 'bcryptjs';
import CodeConfig from '@/models/CodeConfig';
import Admin from '@/models/Admin';
import { watNow } from '@/lib/time';

const CODES = [
  { slug: 'code-01', location: 'Amphitheatre', points: 10, active: true, lat: 7.5195, lng: 4.5228 },
  { slug: 'code-02', location: 'Spider Building', points: 10, active: true, lat: 7.5176, lng: 4.5207 },
  { slug: 'code-03', location: 'Department of Architecture', points: 15, active: true, lat: 7.5183, lng: 4.5219 },
  { slug: 'code-04', location: 'College of Medicine', points: 15, active: true, lat: 7.5220, lng: 4.5241 },
  { slug: 'code-05', location: 'Faculty of Law / Admin / Social Sciences', points: 20, active: true, lat: 7.5201, lng: 4.5198 },
  { slug: 'code-06', location: 'Summit Venue', points: 100, active: false, lat: 7.5190, lng: 4.5215 },
];

let seeded = false;

export async function seed() {
  if (seeded) return;
  seeded = true;

  const codeCount = await CodeConfig.countDocuments();
  if (codeCount === 0) {
    await CodeConfig.insertMany(CODES);
    console.log('Codes seeded');
  } else {
    // Migrate existing docs that are missing lat/lng
    for (const c of CODES) {
      await CodeConfig.updateOne(
        { slug: c.slug, lat: null },
        { $set: { lat: c.lat, lng: c.lng } }
      );
    }
  }

  let adminSeed = [];
  try {
    adminSeed = JSON.parse(process.env.ADMIN_SEED || '[]');
  } catch {
    console.error('Failed to parse ADMIN_SEED env var');
    return;
  }
  for (const a of adminSeed) {
    const exists = await Admin.findOne({ email: a.email });
    if (!exists) {
      await Admin.create({
        name: a.name,
        email: a.email,
        password_hash: await bcrypt.hash(a.password, 10),
        created_at: watNow(),
      });
      console.log(`Admin seeded: ${a.email}`);
    }
  }
}
