import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import Participant from '@/models/Participant';
import ScanLog from '@/models/ScanLog';
import CodeConfig from '@/models/CodeConfig';

export async function GET(request) {
  try {
    if (!verifyToken(request))
      return NextResponse.json({ error: 'unauthorized', message: 'Invalid or missing token' }, { status: 401 });
    await connectDB();

    const [totalParticipants, totalScans, codes, topParticipants, lastScan] = await Promise.all([
      Participant.countDocuments(),
      ScanLog.countDocuments(),
      CodeConfig.find(),
      Participant.find().sort({ total_points: -1 }).limit(10),
      ScanLog.findOne().sort({ scanned_at: -1 }),
    ]);

    const scansPerCode = await Promise.all(
      codes.map(async (c) => ({
        slug: c.slug,
        location: c.location,
        count: await ScanLog.countDocuments({ code_slug: c.slug }),
      }))
    );

    scansPerCode.sort((a, b) => b.count - a.count);

    return NextResponse.json({ totalParticipants, totalScans, scansPerCode, topParticipants, lastScan });
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
