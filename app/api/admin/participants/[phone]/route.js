import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Participant from '@/models/Participant';
import ScanLog from '@/models/ScanLog';
import { verifyToken } from '@/lib/auth';
import { watNow } from '@/lib/time';

export async function DELETE(request, { params: rawParams }) {
  const admin = verifyToken(request);
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { phone } = await rawParams;

    const participant = await Participant.findOne({ phone });
    if (!participant)
      return NextResponse.json({ error: 'not_found', message: 'Participant not found' }, { status: 404 });

    await Participant.deleteOne({ phone });
    await ScanLog.deleteMany({ phone });

    return NextResponse.json({ success: true, message: 'Participant deleted' });
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(request, { params: rawParams }) {
  const admin = verifyToken(request);
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { phone } = await rawParams;
    const { disqualified } = await request.json();

    const participant = await Participant.findOne({ phone });
    if (!participant)
      return NextResponse.json({ error: 'not_found', message: 'Participant not found' }, { status: 404 });

    if (disqualified) {
      participant.disqualified = true;
      participant.disqualified_at = watNow();
      participant.disqualified_by = admin.email;
    } else {
      participant.disqualified = false;
      participant.disqualified_at = null;
      participant.disqualified_by = null;
    }

    await participant.save();
    return NextResponse.json({ success: true, participant });
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
