import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { emailExists } from '@/lib/db';

async function startAssessment(formData: FormData) {
  'use server';
  const email = (formData.get('email') as string).trim().toLowerCase();
  const name  = (formData.get('name')  as string).trim();
  if (!email || !name) return;

  const exists = await emailExists(email);
  if (exists) {
    redirect('/done?status=already');
  }

  const store = cookies();
  store.set('p_email', email, { httpOnly: true, maxAge: 7200, path: '/' });
  store.set('p_name',  name,  { httpOnly: true, maxAge: 7200, path: '/' });
  redirect('/assessment');
}

export default function Home() {
  return (
    <>
      <div className="page-header">
        <h1>API Foundations for PMO</h1>
        <p>Capmation · April 22, 2026</p>
      </div>
      <div className="container">
        <div className="card" style={{ textAlign: 'center', marginTop: 32 }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brand)', marginBottom: 8 }}>
            API Knowledge Check
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28, maxWidth: 460, margin: '0 auto 28px' }}>
            An individual assessment to reflect on what you've learned this week.
            Take your time — there's no timer.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 28 }}>
            {[['10', 'Questions'], ['6', 'Multiple choice'], ['4', 'Open answers']].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand)' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{lbl}</div>
              </div>
            ))}
          </div>

          <form action={startAssessment} style={{ maxWidth: 340, margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label" htmlFor="name">Your full name</label>
              <input id="name" name="name" type="text" placeholder="e.g. Laura Martínez" required autoComplete="off" />
            </div>
            <div>
              <label className="field-label" htmlFor="email">Your work email</label>
              <input id="email" name="email" type="email" placeholder="you@company.com" required autoComplete="off" />
            </div>
            <ul style={{ background: '#f1f5f9', borderRadius: 8, padding: '14px 14px 14px 30px', margin: '4px 0', listStyle: 'disc' }}>
              {[
                'Answer individually — no AI tools or internet.',
                'You have one attempt. Your results go to the coordinator.',
                'You can navigate between questions before submitting.',
              ].map(r => (
                <li key={r} style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 3 }}>{r}</li>
              ))}
            </ul>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>
              Begin Assessment →
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
