import Link from 'next/link';

export default function DonePage({ searchParams }: { searchParams: { status?: string } }) {
  const already  = searchParams.status === 'already';
  const success  = searchParams.status === 'success';

  return (
    <>
      <div className="page-header">
        <h1>API Foundations for PMO</h1>
        <p>Capmation · April 22, 2026</p>
      </div>
      <div className="container">
        <div className="card" style={{ textAlign: 'center', marginTop: 32 }}>
          {already ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
              <h2 style={{ color: 'var(--brand)', marginBottom: 8 }}>Already submitted</h2>
              <p style={{ color: 'var(--muted)', maxWidth: 400, margin: '0 auto' }}>
                This email has already completed the assessment.
                Each participant has one attempt. Contact your coordinator if you think this is an error.
              </p>
            </>
          ) : success ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
              <h2 style={{ color: 'var(--green)', marginBottom: 8 }}>Assessment submitted!</h2>
              <p style={{ color: 'var(--muted)', maxWidth: 400, margin: '0 auto 24px' }}>
                Your answers have been recorded. The course coordinator will review your results.
                Thank you for completing the API Foundations workshop.
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                You can close this window.
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>👋</div>
              <h2 style={{ color: 'var(--brand)', marginBottom: 8 }}>Nothing to see here</h2>
              <p style={{ color: 'var(--muted)' }}>
                <Link href="/" style={{ color: 'var(--brand)' }}>Go back to the assessment →</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
