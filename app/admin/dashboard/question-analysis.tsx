'use client';

export type QuestionStat = {
  questionText: string;
  pctCorrect: number;
  choiceCounts: number[];
  correctIndex: number;
  totalAnswered: number;
  options: string[];
};

type Props = {
  mcStats: QuestionStat[];
  kahootStats: QuestionStat[];
};

function statusBadge(pct: number, totalAnswered: number) {
  if (totalAnswered === 0) return null;
  if (pct < 50) return { label: 'Reforzar', bg: 'rgba(239,68,68,.1)', color: 'var(--red)' };
  if (pct < 70) return { label: 'Revisar', bg: 'rgba(249,115,22,.1)', color: 'var(--accent)' };
  return { label: 'Claro', bg: 'rgba(34,197,94,.1)', color: 'var(--green)' };
}

function AnalysisSection({ title, stats, emptyLabel }: { title: string; stats: QuestionStat[]; emptyLabel: string }) {
  const hasData = stats.some(s => s.totalAnswered > 0);

  if (!hasData) {
    return (
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>{title}</h2>
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
          {emptyLabel}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>{title}</h2>
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, border: '1px solid var(--border)' }}>
        <table className="results-table">
          <thead>
            <tr>
              <th style={{ width: 32, textAlign: 'center' }}>#</th>
              <th>Pregunta</th>
              <th style={{ textAlign: 'center', width: 90 }}>Resp.</th>
              <th style={{ textAlign: 'center', width: 130 }}>% Correcto</th>
              <th style={{ width: 220 }}>Distribución</th>
              <th style={{ textAlign: 'center', width: 130 }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => {
              const pctColor =
                s.pctCorrect >= 70 ? 'var(--green)' :
                s.pctCorrect >= 50 ? 'var(--accent)' :
                'var(--red)';
              const badge = statusBadge(s.pctCorrect, s.totalAnswered);
              const maxCount = Math.max(...s.choiceCounts, 1);

              return (
                <tr key={i}>
                  <td style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>{i + 1}</td>
                  <td style={{ maxWidth: 360 }}>
                    <span title={s.questionText} style={{ fontSize: '0.85rem' }}>
                      {s.questionText.length > 90 ? s.questionText.slice(0, 90) + '…' : s.questionText}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {s.totalAnswered === 0 ? '—' : s.totalAnswered}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {s.totalAnswered === 0 ? (
                      <span style={{ color: 'var(--muted)' }}>—</span>
                    ) : (
                      <>
                        <span style={{ fontWeight: 700, color: pctColor }}>{s.pctCorrect}%</span>
                        <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', marginTop: 5, width: 80, margin: '5px auto 0' }}>
                          <div style={{ height: '100%', width: `${s.pctCorrect}%`, borderRadius: 3, background: pctColor }} />
                        </div>
                      </>
                    )}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    {s.totalAnswered === 0 ? (
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {s.choiceCounts.map((count, ci) => {
                          const isCorrect = ci === s.correctIndex;
                          const barPct = Math.round((count / maxCount) * 100);
                          const optLabel = s.options[ci] ? s.options[ci].slice(0, 30) + (s.options[ci].length > 30 ? '…' : '') : `Opción ${ci + 1}`;
                          return (
                            <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={s.options[ci]}>
                              <span style={{
                                fontSize: '0.7rem',
                                width: 14,
                                textAlign: 'center',
                                fontWeight: isCorrect ? 700 : 400,
                                color: isCorrect ? 'var(--green)' : 'var(--muted)',
                              }}>
                                {String.fromCharCode(65 + ci)}
                              </span>
                              <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  width: `${barPct}%`,
                                  background: isCorrect ? 'var(--green)' : 'var(--red)',
                                  borderRadius: 4,
                                }} />
                              </div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--muted)', width: 14, textAlign: 'right' }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {badge ? (
                      <span style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}>
                        {badge.label}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Sin datos</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QuestionAnalysis({ mcStats, kahootStats }: Props) {
  return (
    <>
      <AnalysisSection
        title="Assessment — Análisis por pregunta MC"
        stats={mcStats}
        emptyLabel="Sin submissions aún. Comparte el link del assessment con los participantes."
      />
      <AnalysisSection
        title="Kahoot — Análisis por pregunta"
        stats={kahootStats}
        emptyLabel="Sin respuestas de Kahoot registradas. Las respuestas se guardan una vez que el host revela cada pregunta."
      />
    </>
  );
}
