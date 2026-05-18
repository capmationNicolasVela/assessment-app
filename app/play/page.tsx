'use client';

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
const SHAPES = ['▲', '◆', '●', '■'];

type PlayerState = {
  phase: string;
  currentQuestion: number;
  answered: boolean;
  score: number;
  pin: string;
  playerCount: number;
};

type ViewMode = 'join' | 'waiting' | 'playing';

export default function PlayPage() {
  const [view, setView] = useState<ViewMode>('join');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [state, setState] = useState<PlayerState | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const poll = useCallback(async () => {
    const r = await fetch('/api/game/player-state');
    if (r.ok) {
      const s: PlayerState = await r.json();
      setState(s);
      if (s.phase === 'question' || s.phase === 'reveal' || s.phase === 'finished') {
        setView('playing');
      }
      // reset choice on new question
      if (s.phase === 'question' && !s.answered) {
        // keep chosen so they see it highlighted; reset happens below on phase change
      }
    }
  }, []);

  // reset choice when phase goes back to question (new question)
  const prevPhase = useRef<string>('');
  useEffect(() => {
    if (state && state.phase === 'question' && prevPhase.current === 'reveal') {
      setChosen(null);
    }
    if (state) prevPhase.current = state.phase;
  }, [state]);

  useEffect(() => {
    if (view !== 'playing' && view !== 'waiting') return;
    poll();
    const id = setInterval(poll, 800);
    return () => clearInterval(id);
  }, [view, poll]);

  async function join() {
    setJoining(true);
    setError('');
    const r = await fetch('/api/game/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), pin: pin.trim() }),
    });
    const data = await r.json();
    if (!r.ok) {
      setError(data.error || 'Could not join');
      setJoining(false);
      return;
    }
    setPlayerName(data.name);
    setView('waiting');
    setJoining(false);
  }

  async function answer(choice: number) {
    if (submitting || chosen !== null) return;
    setChosen(choice);
    setSubmitting(true);
    await fetch('/api/game/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice }),
    });
    setSubmitting(false);
  }

  // ── Join screen ─────────────────────────────────────────────────────────
  if (view === 'join') {
    return (
      <div style={s.root}>
        <div style={s.joinCard}>
          <h1 style={s.logo}>API Kahoot!</h1>
          <input
            style={s.input}
            placeholder="Game PIN"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
          />
          <input
            style={s.input}
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 24))}
            maxLength={24}
          />
          {error && <p style={s.error}>{error}</p>}
          <button
            style={s.joinBtn}
            onClick={join}
            disabled={joining || !pin || !name.trim()}
          >
            {joining ? 'Joining…' : 'Join →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Waiting lobby ───────────────────────────────────────────────────────
  if (view === 'waiting') {
    return (
      <div style={s.root}>
        <div style={s.waitCard}>
          <div style={s.avatar}>{playerName[0]?.toUpperCase()}</div>
          <h2 style={s.waitName}>{playerName}</h2>
          <p style={s.waitSub}>You're in! Waiting for the host to start…</p>
          <p style={s.waitCount}>{state?.playerCount ?? '…'} players joined</p>
        </div>
      </div>
    );
  }

  // ── Playing ─────────────────────────────────────────────────────────────
  if (!state) return <div style={s.root}><p style={{ color: '#fff', padding: 40 }}>Loading…</p></div>;

  if (state.phase === 'lobby') {
    return (
      <div style={s.root}>
        <div style={s.waitCard}>
          <p style={s.waitSub}>Waiting for host…</p>
        </div>
      </div>
    );
  }

  if (state.phase === 'finished') {
    return (
      <div style={s.root}>
        <div style={s.waitCard}>
          <div style={{ fontSize: '3rem' }}>🏆</div>
          <h2 style={s.waitName}>Game Over!</h2>
          <p style={s.waitSub}>Your final score</p>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: '#f0a500' }}>{state.score.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  // question or reveal
  return (
    <div style={s.playRoot}>
      {/* Score */}
      <div style={s.scoreBar}>
        <span style={s.scoreName}>{playerName}</span>
        <span style={s.scoreNum}>{state.score.toLocaleString()} pts</span>
      </div>

      {/* Status */}
      <div style={s.statusRow}>
        {state.phase === 'question' && !state.answered && <p style={s.pickMsg}>Pick your answer!</p>}
        {state.phase === 'question' && state.answered && <p style={s.waitMsg}>✓ Answer locked in…</p>}
        {state.phase === 'reveal' && <p style={s.revealMsg}>Waiting for next question…</p>}
      </div>

      {/* 4 big buttons */}
      <div style={s.btnGrid}>
        {SHAPES.map((shape, i) => (
          <button
            key={i}
            style={{
              ...s.answerBtn,
              background: COLORS[i],
              opacity: state.answered && chosen !== i ? 0.4 : 1,
              border: chosen === i ? '5px solid #fff' : '5px solid transparent',
              transform: chosen === i ? 'scale(0.96)' : 'scale(1)',
            }}
            onClick={() => answer(i)}
            disabled={state.answered || state.phase === 'reveal'}
          >
            <span style={s.btnShape}>{shape}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: 16 },
  joinCard: { background: '#16213e', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 },
  logo: { color: '#f0a500', textAlign: 'center', fontSize: '1.8rem', fontWeight: 900, margin: 0 },
  input: { background: '#0d0d1a', border: '2px solid #333', borderRadius: 10, padding: '14px 16px', fontSize: '1.1rem', color: '#fff', outline: 'none', fontFamily: 'inherit', textAlign: 'center', letterSpacing: 2 },
  error: { color: '#e21b3c', textAlign: 'center', fontSize: '0.9rem', margin: 0 },
  joinBtn: { background: '#f0a500', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer' },
  waitCard: { background: '#16213e', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: '#f0a500', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900 },
  waitName: { color: '#fff', fontSize: '1.5rem', fontWeight: 900, margin: 0 },
  waitSub: { color: '#94a3b8', textAlign: 'center' },
  waitCount: { color: '#f0a500', fontWeight: 700, fontSize: '1.1rem' },
  playRoot: { minHeight: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' },
  scoreBar: { background: '#0d0d1a', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scoreName: { color: '#94a3b8', fontSize: '0.9rem' },
  scoreNum: { color: '#f0a500', fontWeight: 800, fontSize: '1rem' },
  statusRow: { padding: '20px 20px 0', textAlign: 'center' },
  pickMsg: { color: '#fff', fontSize: '1.1rem', fontWeight: 700 },
  waitMsg: { color: '#4ade80', fontSize: '1.1rem', fontWeight: 700 },
  revealMsg: { color: '#94a3b8', fontSize: '1rem' },
  btnGrid: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 },
  answerBtn: { borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', minHeight: 120 },
  btnShape: { fontSize: '3.5rem', userSelect: 'none' },
};
