import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  return NextResponse.json({ success: true, data: payload });
}
