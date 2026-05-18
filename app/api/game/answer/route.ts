import { NextResponse } from 'next/server';
import { submitAnswer } from '@/lib/game-state';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const cookieStore = cookies();
  const playerId = cookieStore.get('player_id')?.value;
  if (!playerId) {
    return NextResponse.json({ error: 'Not joined' }, { status: 401 });
  }

  const { choice } = await req.json();
  if (typeof choice !== 'number' || choice < 0 || choice > 3) {
    return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
  }

  const ok = submitAnswer(playerId, choice);
  return NextResponse.json({ ok });
}
