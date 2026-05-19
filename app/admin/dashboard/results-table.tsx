'use client';

import { useState } from 'react';
import type { Submission } from '@/lib/db';

type Props = {
  rows: Submission[];
  openQuestions: string[];
  kahootScores: { name: string; score: number }[];
};

export function ResultsTable({ rows, openQuestions, kahootScores }: Props) {
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
            <th style={{ textAlign: 'center' }}>Open answers</th>
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
            const kahootScore = kahootScores.find(
              k => k.name.toLowerCase() === row.name.toLowerCase()
            );

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
                      {isOpen ? '▲ Hide' : '▼ Read'}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`${row.email}-open`} className="open-answer-row">
                    <td colSpan={5} style={{ padding: '12px 20px' }}>
                      {openQuestions.map((q, i) => (
                        <div key={i} className="open-answer-block">
                          <div className="oa-q">Q{i + 7}: {q.slice(0, 80)}…</div>
                          <div className="oa-a">
                            {row.openAnswers[i] || <em style={{ color: 'var(--muted)' }}>No answer</em>}
                          </div>
                        </div>
                      ))}
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
