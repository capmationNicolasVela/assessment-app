import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HostView } from './host-view';
import { KAHOOT_QUESTIONS } from '@/lib/kahoot-questions';

export default function HostPage() {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session')?.value;
  if (session !== process.env.ADMIN_PASSWORD) {
    redirect('/admin');
  }
  return <HostView totalQuestions={KAHOOT_QUESTIONS.length} />;
}
