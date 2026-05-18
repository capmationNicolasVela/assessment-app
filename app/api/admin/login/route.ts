import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }
  cookies().set('admin_session', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });
  return NextResponse.json({ ok: true });
}
