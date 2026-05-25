import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Participant from '@/models/Participant';
import ScanLog from '@/models/ScanLog';
import CodeConfig from '@/models/CodeConfig';
import { watNow } from '@/lib/time';
import { haversineDistance } from '@/lib/geo';
import { MAX_DISTANCE_METRES } from '@/lib/geoConfig';

export async function POST(request) {
  try {
    await connectDB();
    const { phone, codeSlug, lat, lng } = await request.json();

    if (!phone || !codeSlug)
      return NextResponse.json({ error: 'validation', message: 'phone and codeSlug are required' }, { status: 400 });

    const participant = await Participant.findOne({ phone });
    if (!participant)
      return NextResponse.json({ error: 'not_registered', message: 'Phone not registered' }, { status: 404 });

    if (participant.disqualified)
      return NextResponse.json({ error: 'disqualified', message: 'This account has been disqualified' }, { status: 403 });

    const code = await CodeConfig.findOne({ slug: codeSlug });
    if (!code)
      return NextResponse.json({ error: 'not_found', message: 'Code does not exist' }, { status: 404 });

    if (!code.active)
      return NextResponse.json({ error: 'code_inactive', message: 'This code is not yet active' }, { status: 403 });

    if (participant.codes_scanned.includes(codeSlug))
      return NextResponse.json({ error: 'already_scanned', message: 'You have already scanned this code' }, { status: 409 });

    // GPS validation — only enforce when code has coordinates
    let distanceMetres = null;
    if (code.lat != null && code.lng != null) {
      if (lat == null || lng == null)
        return NextResponse.json({ error: 'gps_required', message: 'Location permission is required to scan this code' }, { status: 403 });

      distanceMetres = Math.round(haversineDistance(lat, lng, code.lat, code.lng));
      if (distanceMetres > MAX_DISTANCE_METRES)
        return NextResponse.json({ error: 'too_far', message: 'You are too far from this code', distance: distanceMetres, max: MAX_DISTANCE_METRES }, { status: 403 });
    }

    participant.total_points += code.points;
    participant.codes_scanned.push(codeSlug);
    await participant.save();

    await ScanLog.create({ phone, code_slug: codeSlug, points_awarded: code.points, scanned_at: watNow(), distance_metres: distanceMetres });

    const rank = (await Participant.countDocuments({ total_points: { $gt: participant.total_points } })) + 1;
    return NextResponse.json({ pointsEarned: code.points, totalPoints: participant.total_points, rank });
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
