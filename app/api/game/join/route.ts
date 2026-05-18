import { NextResponse } from 'next/server';
import { addPlayer, getState } from '@/lib/game-state';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { name, pin } = await req.json();
  const S = getState();

  if (pin !== S.pin) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 400 });
  }
  if (S.phase !== 'lobby') {
    return NextResponse.json({ error: 'Game already started' }, { status: 400 });
  }

  const cookieStore = cookies();
  let playerId = cookieStore.get('player_id')?.value;
  if (!playerId) {
    playerId = crypto.randomUUID();
  }

  const trimmed = (name || '').trim().slice(0, 24);
  if (!trimmed) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  addPlayer(playerId, trimmed);

  const res = NextResponse.json({ ok: true, playerId, name: trimmed });
  res.cookies.set('player_id', playerId, { httpOnly: true, sameSite: 'lax', maxAge: 3600 });
  return res;
}
