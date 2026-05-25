import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import CodeConfig from '@/models/CodeConfig';
import { watNow } from '@/lib/time';

export async function PATCH(request, { params: rawParams }) {
  try {
    if (!verifyToken(request))
      return NextResponse.json({ error: 'unauthorized', message: 'Invalid or missing token' }, { status: 401 });
    await connectDB();
    const [body, { slug }] = await Promise.all([request.json(), rawParams]);
    const code = await CodeConfig.findOne({ slug });
    if (!code)
      return NextResponse.json({ error: 'not_found', message: 'Code not found' }, { status: 404 });

    if (typeof body.active === 'boolean') {
      code.active = body.active;
      if (body.active && !code.activated_at) code.activated_at = watNow();
    }

    if (body.lat != null) code.lat = body.lat;
    if (body.lng != null) code.lng = body.lng;

    await code.save();
    return NextResponse.json(code);
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
