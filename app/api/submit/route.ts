import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { emailExists, saveSubmission } from '@/lib/db';
import { QUESTIONS } from '@/lib/questions';

export async function POST(req: NextRequest) {
  const store = cookies();
  const email = store.get('p_email')?.value;
  const name  = store.get('p_name')?.value;

  if (!email || !name) {
    return NextResponse.json({ error: 'Session expired. Please start over.' }, { status: 401 });
  }

  const already = await emailExists(email);
  if (already) {
    return NextResponse.json({ error: 'Already submitted.' }, { status: 409 });
  }

  const { answers } = await req.json() as { answers: (number | string | null)[] };

  const mcAnswers   = answers.slice(0, 6) as (number | null)[];
  const openAnswers = (answers.slice(6) as (string | null)[]).map(a => (a ?? '').trim());

  // Score MC
  const mcScore = QUESTIONS
    .filter(q => q.type === 'mc')
    .reduce((score, q, i) => {
      if (q.type === 'mc' && mcAnswers[i] === q.correct) return score + 1;
      return score;
    }, 0);

  await saveSubmission({ email, name, mcAnswers, openAnswers, mcScore });

  // Clear session cookies
  store.delete('p_email');
  store.delete('p_name');

  return NextResponse.json({ ok: true });
}
