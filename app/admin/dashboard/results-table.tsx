'use client';

import { useState } from 'react';
import type { Submission } from '@/lib/db';

type MCQuestion = { text: string; options: string[]; correct: number };
type KahootQuestion = { prompt: string; options: string[]; correct: number };
type KahootPlayerAnswer = { questionIndex: number; choice: number; correct: boolean };

type Props = {
  rows: Submission[];
  openQuestions: string[];
  kahootScores: { name: string; score: number }[];
  mcQuestions: MCQuestion[];
  kahootQuestions: KahootQuestion[];
  kahootHistoryByName: Record<string, KahootPlayerAnswer[]>;
};

const LETTER = ['A', 'B', 'C', 'D'];

export function ResultsTable({ rows, openQuestions, kahootScores, mcQuestions, kahootQuestions, kahootHistoryByName }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(email: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  }

  return (
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, border: '1px solid var(--border)' }}>
      <table className="results-table">
        <thead>
          <tr>
            <th>Participant</th>
            <th>Submitted</th>
            <th style={{ textAlign: 'center' }}>MC Score</th>
            <th style={{ textAlign: 'center' }}>Kahoot Score</th>
            <th style={{ textAlign: 'center' }}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const date = new Date(row.submittedAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            const isOpen = expanded.has(row.email);
            const pct = Math.round((row.mcScore / row.mcTotal) * 100);
            const scoreColor = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--accent)' : 'var(--red)';
            const kahootScore = kahootScores.find(k => k.name.toLowerCase() === row.name.toLowerCase());
            const kahootHistory = kahootHistoryByName[row.name.toLowerCase()] ?? [];

            return (
              <>
                <tr key={row.email}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{date}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: scoreColor }}>
                      {row.mcScore} / {row.mcTotal}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: 4 }}>({pct}%)</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {kahootScore
                      ? <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{kahootScore.score.toLocaleString()} pts</span>
                      : <span style={{ color: 'var(--muted)' }}>—</span>
                    }
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="expand-btn" onClick={() => toggle(row.email)}>
                      {isOpen ? '▲ Cerrar' : '▼ Ver detalle'}
                    </button>
                  </td>
                </tr>

                {isOpen && (
                  <tr key={`${row.email}-detail`} className="open-answer-row">
                    <td colSpan={5} style={{ padding: '16px 20px' }}>

                      {/* ── MC per question ── */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--muted)', marginBottom: 8 }}>
                          Assessment — Preguntas MC
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {mcQuestions.map((q, qi) => {
                            const chosen = row.mcAnswers[qi];
                            const isCorrect = chosen === q.correct;
                            const noAnswer = chosen === null || chosen === undefined;
                            return (
                              <div key={qi} style={{
                                display: 'grid',
                                gridTemplateColumns: '24px 1fr auto',
                                gap: 8,
                                alignItems: 'start',
                                padding: '6px 10px',
                                borderRadius: 6,
                                background: noAnswer ? 'rgba(0,0,0,.03)' : isCorrect ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.06)',
                                border: `1px solid ${noAnswer ? 'var(--border)' : isCorrect ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
                              }}>
                                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--muted)', paddingTop: 1 }}>Q{qi + 1}</span>
                                <div>
                                  <div style={{ fontSize: '0.82rem', marginBottom: 3 }}>
                                    {q.text.length > 100 ? q.text.slice(0, 100) + '…' : q.text}
                                  </div>
                                  {noAnswer ? (
                                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Sin respuesta</span>
                                  ) : (
                                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                                      Respondió: <strong>{LETTER[chosen]}</strong> — {q.options[chosen]}
                                      {!isCorrect && (
                                        <span style={{ marginLeft: 6 }}>
                                          · Correcta: <strong>{LETTER[q.correct]}</strong> — {q.options[q.correct]}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '1rem', paddingTop: 1 }}>
                                  {noAnswer ? '—' : isCorrect ? '✅' : '❌'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── Kahoot per question ── */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--muted)', marginBottom: 8 }}>
                          Kahoot — Preguntas
                        </div>
                        {kahootHistory.length === 0 ? (
                          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', padding: '8px 0' }}>
                            Este participante no jugó Kahoot (o el nombre no coincide exactamente).
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {kahootQuestions.map((q, qi) => {
                              const ans = kahootHistory.find(a => a.questionIndex === qi);
                              const noAnswer = !ans;
                              return (
                                <div key={qi} style={{
                                  display: 'grid',
                                  gridTemplateColumns: '24px 1fr auto',
                                  gap: 8,
                                  alignItems: 'start',
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  background: noAnswer ? 'rgba(0,0,0,.03)' : ans.correct ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.06)',
                                  border: `1px solid ${noAnswer ? 'var(--border)' : ans.correct ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
                                }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--muted)', paddingTop: 1 }}>K{qi + 1}</span>
                                  <div>
                                    <div style={{ fontSize: '0.82rem', marginBottom: 3 }}>
                                      {q.prompt.length > 100 ? q.prompt.slice(0, 100) + '…' : q.prompt}
                                    </div>
                                    {noAnswer ? (
                                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>No respondió / pregunta no jugada aún</span>
                                    ) : (
                                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                                        Respondió: <strong>{LETTER[ans.choice]}</strong> — {q.options[ans.choice]}
                                        {!ans.correct && (
                                          <span style={{ marginLeft: 6 }}>
                                            · Correcta: <strong>{LETTER[q.correct]}</strong> — {q.options[q.correct]}
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '1rem', paddingTop: 1 }}>
                                    {noAnswer ? '—' : ans.correct ? '✅' : '❌'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* ── Open answers ── */}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--muted)', marginBottom: 8 }}>
                          Respuestas abiertas
                        </div>
                        {openQuestions.map((q, i) => (
                          <div key={i} className="open-answer-block">
                            <div className="oa-q">Q{i + 7}: {q.slice(0, 80)}…</div>
                            <div className="oa-a">
                              {row.openAnswers[i] || <em style={{ color: 'var(--muted)' }}>Sin respuesta</em>}
                            </div>
                          </div>
                        ))}
                      </div>

                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
