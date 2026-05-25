import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import Participant from '@/models/Participant';

export async function GET(request) {
  try {
    if (!verifyToken(request))
      return NextResponse.json({ error: 'unauthorized', message: 'Invalid or missing token' }, { status: 401 });
    await connectDB();
    const participants = await Participant.find().sort({ total_points: -1 });
    return NextResponse.json(participants);
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
