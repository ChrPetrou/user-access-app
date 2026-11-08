import { cookies } from 'next/headers';
import { HttpStatus } from '@/lib/http';
import { roleHome } from '@/lib/roles';
import { checkCredentials, createSession, deleteSession, SESSION_COOKIE } from '@/lib/session';

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;

  if (typeof body?.email !== 'string' || typeof body?.password !== 'string') {
    return Response.json({ error: 'email and password are required' }, { status: HttpStatus.BadRequest });
  }

  const user = checkCredentials(body.email, body.password);
  // same message for every failure, so nobody can find out which emails exist
  if (!user) {
    return Response.json({ error: 'Invalid email or password' }, { status: HttpStatus.Unauthorized });
  }

  // logging in again replaces the old session instead of leaving it behind
  const cookieStore = await cookies();
  const existingSessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (existingSessionId) deleteSession(existingSessionId);

  cookieStore.set(SESSION_COOKIE, createSession(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24
  });

  return Response.json({
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    home: roleHome[user.role]
  });
};
