import { NextResponse } from 'next/server';
import { getKahootScores } from '@/lib/game-state';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = cookies().get('admin_session')?.value;
  if (admin !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const scores = await getKahootScores();
  return NextResponse.json(scores);
}
