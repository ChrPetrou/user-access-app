import { roleHome } from '@/lib/roles';
import { HttpStatus } from '@/lib/http';
import { cookies } from 'next/headers';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, SESSION_COOKIE } from '@/lib/session';
import { getStore } from '@/lib/store';

// used when the email doesn't exist, so the response takes the same time as a wrong password
const DUMMY_HASH = hashPassword('dummy');

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;

  if (typeof body?.email !== 'string' || typeof body?.password !== 'string') {
    return Response.json({ error: 'email and password are required' }, { status: HttpStatus.BadRequest });
  }

  const store = getStore();
  const email = body.email.trim().toLowerCase();
  const user = [...store.users.values()].find(u => u.email === email);
  const hash = user ? store.credentials.get(user.id) : undefined;
  const passwordOk = verifyPassword(body.password, hash ?? DUMMY_HASH);

  // same message for every failure, so nobody can find out which emails exist
  if (!user || !hash || !passwordOk || user.status !== 'active') {
    return Response.json({ error: 'Invalid email or password' }, { status: HttpStatus.Unauthorized });
  }

  const cookieStore = await cookies();
  const sessionId = createSession(user.id);
  const existingSessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (existingSessionId) {
    getStore().sessions.delete(existingSessionId);
  }

  cookieStore.set(SESSION_COOKIE, sessionId, {
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
