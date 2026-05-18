import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AssessmentForm } from './assessment-form';

export default function AssessmentPage() {
  const store = cookies();
  const email = store.get('p_email')?.value;
  const name  = store.get('p_name')?.value;
  if (!email || !name) redirect('/');
  return <AssessmentForm participantName={name} />;
}
