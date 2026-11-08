import { cookies } from 'next/headers';
import { HttpStatus } from '@/lib/http';
import { deleteSession, SESSION_COOKIE } from '@/lib/session';

export const POST = async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) deleteSession(sessionId);
  cookieStore.delete(SESSION_COOKIE);

  return Response.json({ message: 'Logged out' }, { status: HttpStatus.Ok });
};
