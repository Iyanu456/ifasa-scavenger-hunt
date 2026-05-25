import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import CodeConfig from '@/models/CodeConfig';

export async function GET(request, { params: rawParams }) {
  try {
    await connectDB();
    const { slug } = await rawParams;
    const code = await CodeConfig.findOne({ slug });
    if (!code) return NextResponse.json({ error: 'not_found', message: 'Code does not exist' }, { status: 404 });
    return NextResponse.json({ slug: code.slug, location: code.location, points: code.points, active: code.active });
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
