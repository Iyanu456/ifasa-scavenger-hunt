import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import CodeConfig from '@/models/CodeConfig';
import ScanLog from '@/models/ScanLog';

export async function GET(request) {
  try {
    if (!verifyToken(request))
      return NextResponse.json({ error: 'unauthorized', message: 'Invalid or missing token' }, { status: 401 });
    await connectDB();
    const codes = await CodeConfig.find();
    const withCounts = await Promise.all(
      codes.map(async (c) => {
        const scan_count = await ScanLog.countDocuments({ code_slug: c.slug });
        return { ...c.toObject(), scan_count };
      })
    );
    return NextResponse.json(withCounts);
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
