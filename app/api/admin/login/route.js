import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongoose';
import Admin from '@/models/Admin';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const admin = await Admin.findOne({ email });
    if (!admin)
      return NextResponse.json({ error: 'invalid_credentials', message: 'Invalid email or password' }, { status: 401 });

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match)
      return NextResponse.json({ error: 'invalid_credentials', message: 'Invalid email or password' }, { status: 401 });

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '50d' }
    );

    return NextResponse.json({ token, admin: { name: admin.name, email: admin.email } });
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
