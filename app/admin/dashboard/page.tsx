import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllSubmissions, type Submission } from '@/lib/db';
import { QUESTIONS } from '@/lib/questions';
import { ResultsTable } from './results-table';

export default async function DashboardPage() {
  const admin = cookies().get('admin_session')?.value;
  if (admin !== process.env.ADMIN_PASSWORD) redirect('/admin');

  const rows = await getAllSubmissions();
  const openQs = QUESTIONS.filter(q => q.type === 'open');

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        <div>
          <h1 style={{ textAlign: 'left', fontSize: '1.1rem' }}>Results Dashboard</h1>
          <p style={{ textAlign: 'left' }}>API Foundations for PMO · Day 5</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
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
            ['Open answers', 'Pending review'],
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
          <ResultsTable rows={rows} openQuestions={openQs.map(q => q.text)} />
        )}
      </div>
    </>
  );
}
