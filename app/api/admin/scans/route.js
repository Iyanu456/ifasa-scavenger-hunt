import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import ScanLog from '@/models/ScanLog';

export async function GET(request) {
  try {
    if (!verifyToken(request))
      return NextResponse.json({ error: 'unauthorized', message: 'Invalid or missing token' }, { status: 401 });
    await connectDB();
    const scans = await ScanLog.find().sort({ scanned_at: -1 });
    return NextResponse.json(scans);
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
