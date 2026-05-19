import { NextResponse } from 'next/server';
import { getPlayerState } from '@/lib/game-state';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const playerId = cookieStore.get('player_id')?.value ?? '';
  return NextResponse.json(await getPlayerState(playerId));
}
