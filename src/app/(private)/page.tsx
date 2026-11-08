import { redirect } from 'next/navigation';
import { roleHome } from '@/lib/roles';
import { requireCurrentUser } from '@/lib/session';

// "/" has no page of its own: send each role to its landing page (logged out → /login via requireCurrentUser)
const Home = async () => {
  const user = await requireCurrentUser();
  redirect(roleHome[user.role]);
};

export default Home;
