import { cookies } from 'next/headers';
import { getStore } from './store';
import type { User } from './types';
import { forbidden, redirect } from 'next/navigation';

// One name for the cookie, used by login, logout and getCurrentUser.
export const SESSION_COOKIE = 'session';

export const createSession = (userId: number): string => {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const sessionId = crypto.randomUUID();

  getStore().sessions.set(sessionId, {
    userId,
    expiresAt
  });

  return sessionId;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) return null; // not logged in

  const store = getStore();
  const session = store.sessions.get(sessionId);
  if (!session) return null; // logged out, server restarted, or a forged id

  if (session.expiresAt.getTime() <= Date.now()) {
    store.sessions.delete(sessionId); // clean up so expired sessions don't pile up
    return null;
  }

  const user = store.users.get(session.userId);
  if (!user) return null;
  if (user.status !== 'active') return null; // deactivated → next request fails

  return user;
};

export const requireCurrentUser = async (canAccess?: (user: User) => boolean): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?error=login-required');
  }
  if (canAccess && !canAccess(user)) forbidden();
  return user;
};
