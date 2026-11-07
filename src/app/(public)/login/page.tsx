import { getCurrentUser } from '@/lib/session';
import LoginForm from './LoginForm';
import { redirect } from 'next/navigation';

async function Login() {
  const user = await getCurrentUser();
  if (user) redirect('/');
  return <LoginForm />;
}

export default Login;
