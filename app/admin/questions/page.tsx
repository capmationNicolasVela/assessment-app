'use client';

import { useState, useEffect } from 'react';
import type { Question } from '@/lib/questions';
import type { KahootQuestion } from '@/lib/kahoot-questions';

type Tab = 'assessment' | 'kahoot';

export default function QuestionsPage() {
  const [tab, setTab] = useState<Tab>('assessment');
  const [assessmentQs, setAssessmentQs] = useState<Question[]>([]);
  const [kahootQs, setKahootQs] = useState<KahootQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [aRes, kRes] = await Promise.all([
          fetch('/api/admin/questions?type=assessment'),
          fetch('/api/admin/questions?type=kahoot'),
        ]);
        if (aRes.ok) setAssessmentQs(await aRes.json());
        if (kRes.ok) setKahootQs(await kRes.json());
      } catch {
        setFeedback({ type: 'err', msg: 'Failed to load questions.' });
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      const questions = tab === 'assessment' ? assessmentQs : kahootQs;
      const res = await fetch(`/api/admin/questions?type=${tab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions),
      });
      if (res.ok) {
        setFeedback({ type: 'ok', msg: 'Saved successfully.' });
      } else {
        setFeedback({ type: 'err', msg: 'Save failed.' });
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Network error.' });
    } finally {
      setSaving(false);
    }
  }

  async function resetDefaults() {
    if (!confirm('Reset to default questions? Unsaved changes will be lost.')) return;
    setSaving(true);
    setFeedback(null);
    try {
      // Fetch defaults by deleting from Redis (no-op if not configured) — simplest approach:
      // just reload from the API which falls back to defaults when Redis is empty
      // For true reset, we call PUT with empty to signal reset — not ideal.
      // Instead, tell user to redeploy. Show a message.
      setFeedback({ type: 'err', msg: 'Reset to defaults requires a redeploy. Edit the source files in lib/questions.ts or lib/kahoot-questions.ts.' });
    } finally {
      setSaving(false);
    }
  }

  function updateAssessmentQ(index: number, patch: Partial<Question>) {
    setAssessmentQs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch } as Question;
      return next;
    });
  }

  function updateKahootQ(index: number, patch: Partial<KahootQuestion>) {
    setKahootQs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function deleteAssessmentQ(index: number) {
    setAssessmentQs(prev => prev.filter((_, i) => i !== index));
  }

  function deleteKahootQ(index: number) {
    setKahootQs(prev => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return <div style={s.loading}>Loading questions…</div>;
  }

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <a href="/admin/dashboard" style={s.backLink}>← Back to Dashboard</a>
          <h1 style={s.title}>Edit Questions</h1>
        </div>
        <div style={s.actions}>
          <button style={s.resetBtn} onClick={resetDefaults} disabled={saving}>
            Reset to defaults
          </button>
          <button style={s.saveBtn} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{ ...s.feedback, background: feedback.type === 'ok' ? '#d1fae5' : '#fee2e2', color: feedback.type === 'ok' ? '#065f46' : '#991b1b' }}>
          {feedback.msg}
        </div>
      )}

      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab === 'assessment' ? s.tabActive : {}) }} onClick={() => setTab('assessment')}>
          Assessment ({assessmentQs.length})
        </button>
        <button style={{ ...s.tab, ...(tab === 'kahoot' ? s.tabActive : {}) }} onClick={() => setTab('kahoot')}>
          Kahoot ({kahootQs.length})
        </button>
      </div>

      {tab === 'assessment' && (
        <div style={s.list}>
          {assessmentQs.map((q, i) => (
            <AssessmentQEditor key={i} q={q} index={i} onChange={patch => updateAssessmentQ(i, patch)} onDelete={() => deleteAssessmentQ(i)} />
          ))}
        </div>
      )}

      {tab === 'kahoot' && (
        <div style={s.list}>
          {kahootQs.map((q, i) => (
            <KahootQEditor key={i} q={q} index={i} onChange={patch => updateKahootQ(i, patch)} onDelete={() => deleteKahootQ(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentQEditor({ q, index, onChange, onDelete }: {
  q: Question;
  index: number;
  onChange: (patch: Partial<Question>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={s.qBlock}>
      <div style={s.qHeader} onClick={() => setOpen(v => !v)}>
        <span style={s.qNum}>Q{index + 1}</span>
        <span style={s.qType}>{q.type.toUpperCase()}</span>
        <span style={s.qSummary}>{q.text.slice(0, 80)}{q.text.length > 80 ? '…' : ''}</span>
        <button style={s.deleteBtn} onClick={e => { e.stopPropagation(); onDelete(); }}>✕</button>
        <span style={s.chevron}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={s.qBody}>
          <label style={s.label}>Question text</label>
          <textarea
            style={s.textarea}
            value={q.text}
            rows={3}
            onChange={e => onChange({ text: e.target.value } as Partial<Question>)}
          />
          {q.type === 'mc' && (
            <>
              {q.context !== undefined && (
                <>
                  <label style={s.label}>Context (optional)</label>
                  <textarea
                    style={s.textarea}
                    value={q.context ?? ''}
                    rows={2}
                    onChange={e => onChange({ context: e.target.value } as Partial<Question>)}
                  />
                </>
              )}
              <label style={s.label}>Options</label>
              {q.options.map((opt, oi) => (
                <div key={oi} style={s.optRow}>
                  <span style={{ ...s.optIdx, background: oi === q.correct ? '#26890c' : '#94a3b8' }}>{oi}</span>
                  <input
                    style={s.optInput}
                    value={opt}
                    onChange={e => {
                      const opts = [...q.options];
                      opts[oi] = e.target.value;
                      onChange({ options: opts } as Partial<Question>);
                    }}
                  />
                  <button
                    style={{ ...s.correctBtn, background: oi === q.correct ? '#26890c' : '#e2e8f0', color: oi === q.correct ? '#fff' : '#333' }}
                    onClick={() => onChange({ correct: oi } as Partial<Question>)}
                  >
                    {oi === q.correct ? '✓ Correct' : 'Set correct'}
                  </button>
                </div>
              ))}
            </>
          )}
          {q.type === 'open' && (
            <>
              <label style={s.label}>Hint</label>
              <input style={s.input} value={q.hint} onChange={e => onChange({ hint: e.target.value } as Partial<Question>)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function KahootQEditor({ q, index, onChange, onDelete }: {
  q: KahootQuestion;
  index: number;
  onChange: (patch: Partial<KahootQuestion>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={s.qBlock}>
      <div style={s.qHeader} onClick={() => setOpen(v => !v)}>
        <span style={s.qNum}>K{index + 1}</span>
        <span style={s.qType}>{q.type}</span>
        <span style={s.qSummary}>{q.prompt.slice(0, 80)}{q.prompt.length > 80 ? '…' : ''}</span>
        <button style={s.deleteBtn} onClick={e => { e.stopPropagation(); onDelete(); }}>✕</button>
        <span style={s.chevron}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={s.qBody}>
          <label style={s.label}>Label (category tag)</label>
          <input style={s.input} value={q.label} onChange={e => onChange({ label: e.target.value })} />

          <label style={s.label}>Prompt</label>
          <textarea style={s.textarea} value={q.prompt} rows={3} onChange={e => onChange({ prompt: e.target.value })} />

          <label style={s.label}>Context (optional code block)</label>
          <textarea style={s.textarea} value={q.context ?? ''} rows={3} onChange={e => onChange({ context: e.target.value || undefined })} />

          <label style={s.label}>Options</label>
          {q.options.map((opt, oi) => (
            <div key={oi} style={s.optRow}>
              <span style={{ ...s.optIdx, background: oi === q.correct ? '#26890c' : '#94a3b8' }}>{oi}</span>
              <input
                style={s.optInput}
                value={opt}
                onChange={e => {
                  const opts = [...q.options] as [string, string, string, string];
                  opts[oi] = e.target.value;
                  onChange({ options: opts });
                }}
              />
              <button
                style={{ ...s.correctBtn, background: oi === q.correct ? '#26890c' : '#e2e8f0', color: oi === q.correct ? '#fff' : '#333' }}
                onClick={() => onChange({ correct: oi })}
              >
                {oi === q.correct ? '✓ Correct' : 'Set correct'}
              </button>
            </div>
          ))}

          <label style={s.label}>Explanation (shown after reveal)</label>
          <textarea style={s.textarea} value={q.explanation} rows={2} onChange={e => onChange({ explanation: e.target.value })} />

          <label style={s.label}>Time limit (seconds, default 45)</label>
          <input
            style={{ ...s.input, width: 100 }}
            type="number"
            min={10}
            max={120}
            value={q.timeLimit ?? 45}
            onChange={e => onChange({ timeLimit: parseInt(e.target.value, 10) || 45 })}
          />
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 24px 60px', fontFamily: 'system-ui, sans-serif' },
  loading: { padding: 48, textAlign: 'center', color: '#64748b' },
  topBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  backLink: { fontSize: '0.85rem', color: 'var(--brand)', textDecoration: 'none', display: 'block', marginBottom: 4 },
  title: { fontSize: '1.4rem', fontWeight: 800, margin: 0 },
  actions: { display: 'flex', gap: 8, alignItems: 'center' },
  saveBtn: { background: 'var(--brand, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
  resetBtn: { background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem' },
  feedback: { borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: '0.9rem', fontWeight: 600 },
  tabs: { display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e2e8f0' },
  tab: { background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: '#64748b', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: 'var(--brand, #6366f1)', borderBottom: '2px solid var(--brand, #6366f1)' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  qBlock: { border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  qHeader: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer', background: '#f8fafc', userSelect: 'none' },
  qNum: { fontWeight: 800, fontSize: '0.85rem', color: '#475569', minWidth: 28 },
  qType: { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#fff', background: '#64748b', borderRadius: 4, padding: '2px 7px', flexShrink: 0 },
  qSummary: { flex: 1, fontSize: '0.9rem', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.95rem', padding: '2px 6px', borderRadius: 4 },
  chevron: { fontSize: '0.75rem', color: '#94a3b8' },
  qBody: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8, background: '#fff' },
  label: { fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 },
  textarea: { width: '100%', border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
  input: { width: '100%', border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' },
  optRow: { display: 'flex', alignItems: 'center', gap: 8 },
  optIdx: { flexShrink: 0, width: 24, height: 24, borderRadius: 4, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' },
  optInput: { flex: 1, border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 10px', fontSize: '0.9rem', fontFamily: 'inherit' },
  correctBtn: { flexShrink: 0, border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 },
};
