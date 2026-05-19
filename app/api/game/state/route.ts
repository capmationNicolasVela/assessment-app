import { NextResponse } from 'next/server';
import { getHostState, getState } from '@/lib/game-state';
import { KAHOOT_QUESTIONS } from '@/lib/kahoot-questions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const total = KAHOOT_QUESTIONS.length;
  const S = await getState();
  const q = KAHOOT_QUESTIONS[S.currentQuestion];

  return NextResponse.json({
    ...await getHostState(total),
    question: {
      type: q.type,
      label: q.label,
      prompt: q.prompt,
      context: q.context ?? null,
      options: q.options,
      correct: S.phase === 'reveal' ? q.correct : null,
      explanation: S.phase === 'reveal' ? q.explanation : null,
      timeLimit: q.timeLimit ?? 45,
    },
  });
}
