import { NextResponse } from 'next/server';
import { getPlayerState } from '@/lib/game-state';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const playerId = cookieStore.get('player_id')?.value ?? '';
  return NextResponse.json(getPlayerState(playerId));
}
