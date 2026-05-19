import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAssessmentQuestions, getKahootQuestionsStore, saveAssessmentQuestions, saveKahootQuestions } from '@/lib/questions-store';

export const dynamic = 'force-dynamic';

function isAdmin() {
  const admin = cookies().get('admin_session')?.value;
  return admin === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const type = req.nextUrl.searchParams.get('type');
  if (type === 'kahoot') return NextResponse.json(await getKahootQuestionsStore());
  return NextResponse.json(await getAssessmentQuestions());
}

export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const type = req.nextUrl.searchParams.get('type');
  const questions = await req.json();
  if (type === 'kahoot') {
    await saveKahootQuestions(questions);
  } else {
    await saveAssessmentQuestions(questions);
  }
  return NextResponse.json({ ok: true });
}
