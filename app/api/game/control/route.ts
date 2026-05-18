import { NextResponse } from 'next/server';
import { getState, startQuestion, revealAnswers, nextQuestion, resetGame, getHostState } from '@/lib/game-state';
import { KAHOOT_QUESTIONS } from '@/lib/kahoot-questions';

export async function POST(req: Request) {
  const { action } = await req.json();
  const total = KAHOOT_QUESTIONS.length;
  const S = getState();

  if (action === 'start') {
    startQuestion();
  } else if (action === 'reveal') {
    const q = KAHOOT_QUESTIONS[S.currentQuestion];
    revealAnswers(q.correct);
  } else if (action === 'next') {
    nextQuestion(total);
  } else if (action === 'reset') {
    resetGame();
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  return NextResponse.json(getHostState(total));
}
