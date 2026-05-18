'use client';

import { useState, useEffect, useCallback } from 'react';

const COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
const SHAPES = ['▲', '◆', '●', '■'];
const LABELS = ['A', 'B', 'C', 'D'];

type HostData = {
  phase: string;
  pin: string;
  currentQuestion: number;
  totalQuestions: number;
  playerCount: number;
  answeredCount: number;
  tally: number[];
  leaderboard: { name: string; score: number }[];
  question: {
    type: string;
    label: string;
    prompt: string;
    context: string | null;
    options: [string, string, string, string];
    correct: number | null;
    explanation: string | null;
  };
};

export function HostView({ totalQuestions }: { totalQuestions: number }) {
  const [data, setData] = useState<HostData | null>(null);
  const [controlling, setControlling] = useState(false);

  const poll = useCallback(async () => {
    const r = await fetch('/api/game/state');
    if (r.ok) setData(await r.json());
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 800);
    return () => clearInterval(id);
  }, [poll]);

  async function control(action: string) {
    setControlling(true);
    await fetch('/api/game/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    await poll();
    setControlling(false);
  }

  if (!data) {
    return <div style={styles.loading}>Loading…</div>;
  }

  const { phase, pin, currentQuestion, playerCount, answeredCount, tally, leaderboard, question } = data;
  const maxTally = Math.max(...tally, 1);

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.pinBox}>PIN: {pin}</span>
          <span style={styles.meta}>👥 {playerCount} players</span>
        </div>
        <div style={styles.headerCenter}>
          {phase !== 'lobby' && phase !== 'finished' && (
            <span style={styles.qCounter}>Q {currentQuestion + 1} / {totalQuestions}</span>
          )}
        </div>
        <div style={styles.headerRight}>
          <button style={styles.resetBtn} onClick={() => control('reset')} disabled={controlling}>
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Lobby */}
      {phase === 'lobby' && (
        <div style={styles.center}>
          <div style={styles.bigPin}>{pin}</div>
          <p style={styles.joinHint}>Participants: go to <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/play</strong> and enter this PIN</p>
          <p style={styles.playerCount}>{playerCount} joined</p>
          <button style={styles.bigBtn} onClick={() => control('start')} disabled={controlling || playerCount === 0}>
            ▶ Start Game
          </button>
        </div>
      )}

      {/* Question phase */}
      {(phase === 'question' || phase === 'reveal') && (
        <div style={styles.gameArea}>
          {/* Question card */}
          <div style={styles.qCard}>
            <div style={styles.qLabel}>{question.label}</div>
            <p style={styles.qPrompt}>{question.prompt}</p>
            {question.context && (
              <pre style={styles.qContext}>{question.context}</pre>
            )}
          </div>

          {/* Answer bars (always visible) */}
          <div style={styles.barsRow}>
            {tally.map((count, i) => (
              <div key={i} style={styles.barWrap}>
                <div
                  style={{
                    ...styles.barFill,
                    background: COLORS[i],
                    height: `${(count / maxTally) * 140}px`,
                    opacity: phase === 'reveal' && question.correct !== null && i !== question.correct ? 0.35 : 1,
                    outline: phase === 'reveal' && i === question.correct ? '4px solid #fff' : 'none',
                  }}
                />
                <div style={styles.barLabel}>
                  <span style={{ fontSize: '1.4rem' }}>{SHAPES[i]}</span>
                  <span style={{ fontSize: '0.85rem', marginLeft: 4 }}>{count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Options grid */}
          <div style={styles.optionsGrid}>
            {question.options.map((opt, i) => (
              <div
                key={i}
                style={{
                  ...styles.optionBox,
                  background: COLORS[i],
                  opacity: phase === 'reveal' && question.correct !== null && i !== question.correct ? 0.4 : 1,
                  border: phase === 'reveal' && i === question.correct ? '4px solid #fff' : '4px solid transparent',
                }}
              >
                <span style={styles.optShape}>{SHAPES[i]}</span>
                <span style={styles.optText}>{opt}</span>
                {phase === 'reveal' && i === question.correct && (
                  <span style={styles.checkmark}>✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Explanation on reveal */}
          {phase === 'reveal' && question.explanation && (
            <div style={styles.explanation}>
              💡 {question.explanation}
            </div>
          )}

          {/* Answer counter */}
          <div style={styles.answerBar}>
            <span>{answeredCount} / {playerCount} answered</span>
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            {phase === 'question' && (
              <button style={styles.ctrlBtn} onClick={() => control('reveal')} disabled={controlling}>
                Reveal Answer →
              </button>
            )}
            {phase === 'reveal' && currentQuestion + 1 < totalQuestions && (
              <button style={styles.ctrlBtn} onClick={() => control('next')} disabled={controlling}>
                Next Question →
              </button>
            )}
            {phase === 'reveal' && currentQuestion + 1 >= totalQuestions && (
              <button style={styles.ctrlBtn} onClick={() => control('next')} disabled={controlling}>
                Finish Game →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Finished */}
      {phase === 'finished' && (
        <div style={styles.center}>
          <h2 style={styles.finishedTitle}>🏆 Final Leaderboard</h2>
          <div style={styles.leaderboard}>
            {leaderboard.map((p, i) => (
              <div key={i} style={{ ...styles.lbRow, background: i === 0 ? '#f0a500' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#1e293b' }}>
                <span style={styles.lbRank}>{i + 1}</span>
                <span style={styles.lbName}>{p.name}</span>
                <span style={styles.lbScore}>{p.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <button style={{ ...styles.bigBtn, marginTop: 32 }} onClick={() => control('reset')} disabled={controlling}>
            ↺ Play Again
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#1a1a2e', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' },
  loading: { color: '#fff', padding: 40, textAlign: 'center', background: '#1a1a2e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { background: '#0d0d1a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  headerCenter: { flex: 1, textAlign: 'center' },
  headerRight: {},
  pinBox: { background: '#f0a500', color: '#000', fontWeight: 800, fontSize: '1.1rem', padding: '4px 14px', borderRadius: 6 },
  meta: { fontSize: '0.9rem', color: '#94a3b8' },
  qCounter: { fontSize: '1rem', fontWeight: 700, color: '#94a3b8' },
  resetBtn: { background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem' },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  bigPin: { fontSize: '5rem', fontWeight: 900, letterSpacing: 8, color: '#f0a500' },
  joinHint: { fontSize: '1.1rem', color: '#94a3b8', textAlign: 'center' },
  playerCount: { fontSize: '1.4rem', fontWeight: 700 },
  bigBtn: { background: '#f0a500', color: '#000', border: 'none', borderRadius: 10, padding: '16px 40px', fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer' },
  gameArea: { flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: 12 },
  qCard: { background: '#16213e', borderRadius: 12, padding: '20px 24px' },
  qLabel: { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#f0a500', marginBottom: 8 },
  qPrompt: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, margin: 0 },
  qContext: { background: '#0d0d1a', border: '1px solid #333', borderRadius: 8, padding: '12px 16px', fontSize: '0.85rem', color: '#94a3b8', marginTop: 12, overflowX: 'auto', whiteSpace: 'pre-wrap' },
  barsRow: { display: 'flex', gap: 8, height: 160, alignItems: 'flex-end', justifyContent: 'center' },
  barWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barFill: { width: '100%', borderRadius: '4px 4px 0 0', transition: 'height 0.4s', minHeight: 4 },
  barLabel: { display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 700 },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  optionBox: { borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', transition: 'opacity 0.3s' },
  optShape: { fontSize: '1.5rem', flexShrink: 0 },
  optText: { fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3 },
  checkmark: { marginLeft: 'auto', fontSize: '1.5rem', fontWeight: 900 },
  explanation: { background: '#16213e', border: '1px solid #f0a500', borderRadius: 10, padding: '14px 18px', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 },
  answerBar: { textAlign: 'center', fontSize: '0.85rem', color: '#64748b' },
  controls: { display: 'flex', justifyContent: 'center', paddingBottom: 8 },
  ctrlBtn: { background: '#f0a500', color: '#000', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' },
  finishedTitle: { fontSize: '2rem', fontWeight: 900, marginBottom: 16 },
  leaderboard: { width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 8 },
  lbRow: { display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderRadius: 10 },
  lbRank: { fontSize: '1.3rem', fontWeight: 900, width: 32 },
  lbName: { flex: 1, fontSize: '1.1rem', fontWeight: 700 },
  lbScore: { fontSize: '1rem', fontWeight: 700 },
};
