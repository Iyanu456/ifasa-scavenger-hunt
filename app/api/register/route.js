import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Participant from '@/models/Participant';
import ScanLog from '@/models/ScanLog';
import CodeConfig from '@/models/CodeConfig';
import { watNow } from '@/lib/time';
import { haversineDistance } from '@/lib/geo';
import { MAX_DISTANCE_METRES } from '@/lib/geoConfig';

const PHONE_REGEX = /^(070|080|081|090)\d{8}$/;
const VALID_LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L', 'Postgraduate'];

export async function POST(request) {
  try {
    await connectDB();
    const { phone, name, department, level, codeSlug, lat, lng } = await request.json();

    if (!PHONE_REGEX.test(phone))
      return NextResponse.json({ error: 'validation', message: 'Invalid phone number' }, { status: 400 });
    if (!name || typeof name !== 'string' || !name.trim())
      return NextResponse.json({ error: 'validation', message: 'Name is required' }, { status: 400 });
    if (!department || typeof department !== 'string' || !department.trim())
      return NextResponse.json({ error: 'validation', message: 'Department is required' }, { status: 400 });
    if (!VALID_LEVELS.includes(level))
      return NextResponse.json({ error: 'validation', message: 'Invalid level' }, { status: 400 });

    const existing = await Participant.findOne({ phone });

    if (existing) {
      if (existing.disqualified)
        return NextResponse.json({ error: 'disqualified', message: 'This account has been disqualified' }, { status: 403 });

      // Returning user — silent login
      if (!codeSlug) {
        return NextResponse.json({ registered: true, name: existing.name, alreadyExisted: true });
      }

      // Returning user with a code to scan — skip creation, go straight to scan logic
      const code = await CodeConfig.findOne({ slug: codeSlug });
      if (!code)
        return NextResponse.json({ error: 'validation', message: 'Invalid code' }, { status: 400 });
      if (!code.active)
        return NextResponse.json({ error: 'code_inactive', message: 'This code is not yet active' }, { status: 403 });

      if (existing.codes_scanned.includes(codeSlug))
        return NextResponse.json({ error: 'already_scanned', message: 'You have already scanned this code' }, { status: 409 });

      let distanceMetres = null;
      if (code.lat != null && code.lng != null) {
        if (lat == null || lng == null)
          return NextResponse.json({ error: 'gps_required', message: 'Location permission is required to scan this code' }, { status: 403 });
        distanceMetres = Math.round(haversineDistance(lat, lng, code.lat, code.lng));
        if (distanceMetres > MAX_DISTANCE_METRES)
          return NextResponse.json({ error: 'too_far', message: 'You are too far from this code', distance: distanceMetres, max: MAX_DISTANCE_METRES }, { status: 403 });
      }

      existing.total_points += code.points;
      existing.codes_scanned.push(codeSlug);
      await existing.save();

      await ScanLog.create({ phone, code_slug: codeSlug, points_awarded: code.points, scanned_at: watNow(), distance_metres: distanceMetres });

      const rank = (await Participant.countDocuments({ total_points: { $gt: existing.total_points } })) + 1;
      return NextResponse.json({ pointsEarned: code.points, totalPoints: existing.total_points, rank });
    }

    if (!codeSlug) {
      await Participant.create({
        phone,
        name: name.trim(),
        department: department.trim(),
        level,
        total_points: 0,
        codes_scanned: [],
        registered_at: watNow(),
      });
      return NextResponse.json({ registered: true, name: name.trim() }, { status: 201 });
    }

    const code = await CodeConfig.findOne({ slug: codeSlug });
    if (!code)
      return NextResponse.json({ error: 'validation', message: 'Invalid code' }, { status: 400 });
    if (!code.active)
      return NextResponse.json({ error: 'code_inactive', message: 'This code is not yet active' }, { status: 403 });

    // GPS validation — only enforce when code has coordinates
    let distanceMetres = null;
    if (code.lat != null && code.lng != null) {
      if (lat == null || lng == null)
        return NextResponse.json({ error: 'gps_required', message: 'Location permission is required to scan this code' }, { status: 403 });

      distanceMetres = Math.round(haversineDistance(lat, lng, code.lat, code.lng));
      if (distanceMetres > MAX_DISTANCE_METRES)
        return NextResponse.json({ error: 'too_far', message: 'You are too far from this code', distance: distanceMetres, max: MAX_DISTANCE_METRES }, { status: 403 });
    }

    const participant = await Participant.create({
      phone,
      name: name.trim(),
      department: department.trim(),
      level,
      total_points: code.points,
      codes_scanned: [codeSlug],
      registered_at: watNow(),
    });

    await ScanLog.create({ phone, code_slug: codeSlug, points_awarded: code.points, scanned_at: watNow(), distance_metres: distanceMetres });

    const rank = (await Participant.countDocuments({ total_points: { $gt: participant.total_points } })) + 1;
    return NextResponse.json({ pointsEarned: code.points, totalPoints: participant.total_points, rank }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong' }, { status: 500 });
  }
}
