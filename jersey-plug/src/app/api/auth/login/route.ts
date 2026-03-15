import { NextRequest, NextResponse } from 'next/server';
import { signToken, comparePassword } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`auth:${ip}`, 5, 300)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 5 minutes.' }, { status: 429 });
  }

  try {
    const { username, password } = await req.json();
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD_HASH;

    if (!validUsername || !validPassword) {
      return NextResponse.json({ error: 'Server not configured. Add env variables in Vercel.' }, { status: 500 });
    }

    if (username !== validUsername || !comparePassword(password, validPassword)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken({ username });
    return NextResponse.json({ success: true, data: { token, username } });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
