import { HttpStatus } from '@/lib/http';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/lib/session';
import { getStore } from '@/lib/store';

export const POST = async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    getStore().sessions.delete(sessionId);
  }
  cookieStore.delete(SESSION_COOKIE);

  return Response.json({ message: 'Logged out' }, { status: HttpStatus.Ok });
};
