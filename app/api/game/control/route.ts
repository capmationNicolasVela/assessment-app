import { NextResponse } from 'next/server';
import { getState, startQuestion, revealAnswers, nextQuestion, resetGame, getHostState } from '@/lib/game-state';
import { KAHOOT_QUESTIONS } from '@/lib/kahoot-questions';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { action } = await req.json();
  const total = KAHOOT_QUESTIONS.length;
  const S = await getState();

  if (action === 'start') {
    const q = KAHOOT_QUESTIONS[S.currentQuestion];
    await startQuestion((q.timeLimit ?? 45) * 1000);
  } else if (action === 'reveal') {
    const q = KAHOOT_QUESTIONS[S.currentQuestion];
    await revealAnswers(q.correct);
  } else if (action === 'next') {
    await nextQuestion(total);
  } else if (action === 'reset') {
    await resetGame();
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  return NextResponse.json(await getHostState(total));
}
