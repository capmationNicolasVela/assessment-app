'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/lib/questions';

type Answers = (number | string | null)[];

export function AssessmentForm({ participantName }: { participantName: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>(new Array(QUESTIONS.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Anti-paste ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const showToast = (msg: string) => {
      const t = toastRef.current;
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => t.classList.remove('show'), 2800);
    };
    const isInTextarea = () => document.activeElement?.tagName === 'TEXTAREA';

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      showToast('⛔ Paste is not allowed in this assessment.');
    };
    const onCopy = (e: ClipboardEvent) => {
      if (!isInTextarea()) {
        e.preventDefault();
        showToast('⛔ Copying is not allowed in this assessment.');
      }
    };
    const onCut = (e: ClipboardEvent) => {
      if (!isInTextarea()) e.preventDefault();
    };
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (mod && key === 'v') {
        e.preventDefault();
        showToast('⛔ Paste is not allowed in this assessment.');
      }
      if (mod && key === 'c' && !isInTextarea()) {
        e.preventDefault();
        showToast('⛔ Copying is not allowed in this assessment.');
      }
      if (mod && key === 'a' && !isInTextarea()) {
        e.preventDefault();
      }
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
        showToast('⛔ Drag and drop is not allowed.');
      }
    };
    document.addEventListener('paste', onPaste);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('drop', onDrop);
    return () => {
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('drop', onDrop);
    };
  }, []);

  const q = QUESTIONS[current];
  const pct = (current / QUESTIONS.length) * 100;
  const isLast = current === QUESTIONS.length - 1;

  function selectMC(val: number) {
    const next = [...answers];
    next[current] = val;
    setAnswers(next);
  }

  function setOpen(val: string) {
    const next = [...answers];
    next[current] = val;
    setAnswers(next);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (res.ok) {
      router.push('/done?status=success');
    } else {
      const { error } = await res.json();
      alert(error || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>API Knowledge Check</h1>
        <p>{participantName}</p>
      </div>

      <div className="progress-wrap">
        <div className="progress-inner">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-label">Question {current + 1} of {QUESTIONS.length}</div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div className="q-number">
            <span>{current + 1}</span>{q.section}
          </div>
          <p className="q-text">{q.text}</p>

          {q.type === 'mc' && q.context && (
            <div className="q-context">{q.context}</div>
          )}

          {q.type === 'mc' ? (
            <div className="options">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`option ${answers[current] === oi ? 'selected' : ''}`}
                  onClick={() => selectMC(oi)}
                >
                  <input
                    type="radio"
                    name={`q${current}`}
                    value={oi}
                    checked={answers[current] === oi}
                    onChange={() => selectMC(oi)}
                  />
                  <label>{opt}</label>
                </label>
              ))}
            </div>
          ) : (
            <>
              <p className="open-hint">{q.hint}</p>
              <textarea
                value={(answers[current] as string) || ''}
                onChange={e => setOpen(e.target.value)}
                placeholder="Write your answer here…"
              />
            </>
          )}
        </div>

        <div className="nav">
          <button
            className="btn btn-ghost"
            onClick={() => (current === 0 ? router.push('/') : setCurrent(c => c - 1))}
          >
            {current === 0 ? '← Cover' : '← Back'}
          </button>

          {isLast ? (
            <button
              className="btn btn-accent"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ padding: '12px 32px', fontSize: '1rem' }}
            >
              {submitting ? 'Submitting…' : 'Submit Assessment →'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>
              Next →
            </button>
          )}
        </div>
      </div>

      <div className="toast" ref={toastRef} />
    </>
  );
}
