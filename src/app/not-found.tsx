import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

async function NotFound() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <div>not-found</div>;
}

export default NotFound;
