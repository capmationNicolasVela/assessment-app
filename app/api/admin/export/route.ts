import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllSubmissions } from '@/lib/db';
import { QUESTIONS } from '@/lib/questions';

export async function GET(req: NextRequest) {
  const admin = cookies().get('admin_session')?.value;
  if (admin !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await getAllSubmissions();
  const openQs = QUESTIONS.filter(q => q.type === 'open').map(q => q.text);

  const header = [
    'Name', 'Email', 'Submitted At', 'MC Score', 'MC Total',
    ...openQs.map((_, i) => `Open Q${i + 7}`),
  ].join(',');

  const lines = rows.map(row => {
    const opens = row.openAnswers.map(a => `"${(a || '').replace(/"/g, '""')}"`);
    return [
      `"${row.name}"`,
      `"${row.email}"`,
      `"${row.submittedAt.toISOString()}"`,
      row.mcScore,
      row.mcTotal,
      ...opens,
    ].join(',');
  });

  const csv = [header, ...lines].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="assessment-results.csv"',
    },
  });
}
