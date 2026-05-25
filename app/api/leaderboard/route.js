import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Participant from '@/models/Participant';

export async function GET() {
  try {
    await connectDB();
    const participants = await Participant.find({ disqualified: { $ne: true } }).sort({ total_points: -1 });
    return NextResponse.json({
      total: participants.length,
      participants: participants.map((p, i) => ({
        rank: i + 1,
        name: p.name,
        department: p.department,
        total_points: p.total_points,
        codes_scanned_count: p.codes_scanned.length,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
