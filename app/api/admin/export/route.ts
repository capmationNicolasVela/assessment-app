import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllSubmissions } from '@/lib/db';
import { getKahootAnswerHistory } from '@/lib/game-state';
import { getAssessmentQuestions, getKahootQuestionsStore } from '@/lib/questions-store';

const LETTER = ['A', 'B', 'C', 'D'];

function esc(val: string) {
  return `"${(val || '').replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const admin = cookies().get('admin_session')?.value;
  if (admin !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [rows, answerHistory, assessmentQs, kahootQs] = await Promise.all([
    getAllSubmissions(),
    getKahootAnswerHistory(),
    getAssessmentQuestions(),
    getKahootQuestionsStore(),
  ]);

  const mcQs = assessmentQs.filter(q => q.type === 'mc');
  const openQs = assessmentQs.filter(q => q.type === 'open');

  // Group Kahoot history by player name (lowercase)
  const kahootHistoryByName: Record<string, { questionIndex: number; choice: number; correct: boolean }[]> = {};
  for (const ans of answerHistory) {
    const key = ans.playerName.toLowerCase();
    if (!kahootHistoryByName[key]) kahootHistoryByName[key] = [];
    kahootHistoryByName[key].push({ questionIndex: ans.questionIndex, choice: ans.choice, correct: ans.correct });
  }

  // Build header
  const mcHeaders = mcQs.flatMap((_, i) => [`MC_Q${i + 1}_resp`, `MC_Q${i + 1}_ok`]);
  const openHeaders = openQs.map((_, i) => `Open_Q${i + 7}`);
  const kahootHeaders = ['Kahoot_total', ...kahootQs.flatMap((_, i) => [`Kahoot_K${i + 1}_resp`, `Kahoot_K${i + 1}_ok`])];

  const header = [
    'Nombre', 'Email', 'Enviado_en', 'MC_score', 'MC_total',
    ...mcHeaders,
    ...openHeaders,
    ...kahootHeaders,
  ].join(',');

  const lines = rows.map(row => {
    // MC per question
    const mcCols = mcQs.flatMap((q, i) => {
      const chosen = row.mcAnswers[i];
      if (chosen === null || chosen === undefined) return ['-', '-'];
      return [LETTER[chosen], chosen === q.correct ? 'SI' : 'NO'];
    });

    // Open answers
    const openCols = row.openAnswers.map(a => esc(a));

    // Kahoot
    const playerHistory = kahootHistoryByName[row.name.toLowerCase()] ?? [];
    const kahootScoreForPlayer = playerHistory.reduce((sum, a) => {
      // approximate: not stored separately, derive from correct answers
      return sum;
    }, 0);
    // Total score comes from __kahoot_scores, not history — so we just track per-question
    const kahootQCols = kahootQs.flatMap((_, i) => {
      const ans = playerHistory.find(a => a.questionIndex === i);
      if (!ans) return ['-', '-'];
      return [LETTER[ans.choice], ans.correct ? 'SI' : 'NO'];
    });

    // Kahoot total correct count (as a score indicator since pts aren't stored here)
    const kahootCorrectCount = playerHistory.filter(a => a.correct).length;
    const kahootTotalPlayed = playerHistory.length;
    const kahootSummary = kahootTotalPlayed > 0
      ? `${kahootCorrectCount}/${kahootTotalPlayed}`
      : '-';

    return [
      esc(row.name),
      esc(row.email),
      esc(row.submittedAt),
      row.mcScore,
      row.mcTotal,
      ...mcCols,
      ...openCols,
      kahootSummary,
      ...kahootQCols,
    ].join(',');
  });

  const csv = [header, ...lines].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="assessment-results.csv"',
    },
  });
}
