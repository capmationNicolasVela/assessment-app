import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllSubmissions } from '@/lib/db';
import { getKahootScores, getKahootAnswerHistory, type KahootScore } from '@/lib/game-state';
import { QUESTIONS } from '@/lib/questions';
import { getAssessmentQuestions, getKahootQuestionsStore } from '@/lib/questions-store';
import { ResultsTable } from './results-table';
import { QuestionAnalysis, type QuestionStat } from './question-analysis';

export default async function DashboardPage() {
  const admin = cookies().get('admin_session')?.value;
  if (admin !== process.env.ADMIN_PASSWORD) redirect('/admin');

  const [rows, kahootScores, answerHistory, assessmentQs, kahootQs] = await Promise.all([
    getAllSubmissions(),
    getKahootScores(),
    getKahootAnswerHistory(),
    getAssessmentQuestions(),
    getKahootQuestionsStore(),
  ]);
  const openQs = QUESTIONS.filter(q => q.type === 'open');

  const mcQs = assessmentQs.filter(q => q.type === 'mc');
  const mcStats: QuestionStat[] = mcQs.map((q, i) => {
    const choiceCounts = [0, 0, 0, 0];
    let correctCount = 0;
    let totalAnswered = 0;
    for (const row of rows) {
      const answer = row.mcAnswers[i];
      if (answer !== null && answer !== undefined) {
        totalAnswered++;
        choiceCounts[answer] = (choiceCounts[answer] ?? 0) + 1;
        if (answer === q.correct) correctCount++;
      }
    }
    return {
      questionText: q.text,
      pctCorrect: totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0,
      choiceCounts,
      correctIndex: q.correct,
      totalAnswered,
      options: q.options,
    };
  });

  const kahootStats: QuestionStat[] = kahootQs.map((q, i) => {
    const choiceCounts = [0, 0, 0, 0];
    let correctCount = 0;
    let totalAnswered = 0;
    for (const ans of answerHistory.filter(a => a.questionIndex === i)) {
      totalAnswered++;
      choiceCounts[ans.choice] = (choiceCounts[ans.choice] ?? 0) + 1;
      if (ans.correct) correctCount++;
    }
    return {
      questionText: q.prompt,
      pctCorrect: totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0,
      choiceCounts,
      correctIndex: q.correct,
      totalAnswered,
      options: [...q.options],
    };
  });

  // Group Kahoot history by player name (lowercase) for per-user detail
  const kahootHistoryByName: Record<string, { questionIndex: number; choice: number; correct: boolean }[]> = {};
  for (const ans of answerHistory) {
    const key = ans.playerName.toLowerCase();
    if (!kahootHistoryByName[key]) kahootHistoryByName[key] = [];
    kahootHistoryByName[key].push({ questionIndex: ans.questionIndex, choice: ans.choice, correct: ans.correct });
  }

  const mcQsForTable = mcQs.map(q => ({ text: q.text, options: q.options, correct: q.correct }));
  const kahootQsForTable = kahootQs.map(q => ({ prompt: q.prompt, options: [...q.options], correct: q.correct }));

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        <div>
          <h1 style={{ textAlign: 'left', fontSize: '1.1rem' }}>Results Dashboard</h1>
          <p style={{ textAlign: 'left' }}>API Foundations for PMO · Day 5</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href="/admin/questions"
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem', padding: '8px 16px', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
          >
            ✏️ Edit Questions
          </a>
          <a
            href="/host"
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem', padding: '8px 16px', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
          >
            🎮 Host Kahoot
          </a>
          <a
            href="/jeopardy.html"
            target="_blank"
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem', padding: '8px 16px', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
          >
            ⚡ Jeopardy
          </a>
          <a
            href="/api/admin/export"
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem', padding: '8px 16px', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
          >
            ↓ Export CSV
          </a>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '8px 16px', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            ['Submissions', rows.length.toString()],
            ['Avg MC Score', rows.length ? `${(rows.reduce((s, r) => s + r.mcScore, 0) / rows.length).toFixed(1)} / 6` : '—'],
            ['Kahoot Players', kahootScores.length.toString()],
          ].map(([lbl, val]) => (
            <div key={lbl} className="card" style={{ textAlign: 'center', padding: '20px 16px', margin: 0 }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand)' }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 48 }}>
            No submissions yet. Share the assessment URL with participants.
          </div>
        ) : (
          <ResultsTable
            rows={rows}
            openQuestions={openQs.map(q => q.text)}
            kahootScores={kahootScores}
            mcQuestions={mcQsForTable}
            kahootQuestions={kahootQsForTable}
            kahootHistoryByName={kahootHistoryByName}
          />
        )}

        <QuestionAnalysis mcStats={mcStats} kahootStats={kahootStats} />
      </div>
    </>
  );
}
