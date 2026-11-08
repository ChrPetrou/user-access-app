import { getCurrentUser } from '@/lib/session';
import { roleHome } from '@/lib/roles';
import LoginForm from './LoginForm';
import { redirect } from 'next/navigation';

async function Login() {
  const user = await getCurrentUser();
  if (user) redirect(roleHome[user.role]);
  return <LoginForm />;
}

export default Login;
