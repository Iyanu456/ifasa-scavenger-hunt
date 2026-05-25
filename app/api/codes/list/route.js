import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import CodeConfig from '@/models/CodeConfig';

export async function GET() {
  try {
    await connectDB();
    const codes = await CodeConfig.find({ active: true });
    return NextResponse.json(codes.map((c) => ({ slug: c.slug, location: c.location, points: c.points })));
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
