import { cookies } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import { hashPassword, verifyPassword } from './password';
import { getStore } from './store';
import type { User } from './types';

// One name for the cookie, used by login, logout and getCurrentUser.
export const SESSION_COOKIE = 'session';

// used when the email doesn't exist, so the check takes the same time as a wrong password
const DUMMY_HASH = hashPassword('dummy');

// the user for these credentials, or null — unknown email, wrong password and deactivated all look the same
export const checkCredentials = (email: string, password: string): User | null => {
  const store = getStore();
  const normalized = email.trim().toLowerCase();
  const user = [...store.users.values()].find(u => u.email === normalized);
  const hash = user ? store.credentials.get(user.id) : undefined;
  const passwordOk = verifyPassword(password, hash ?? DUMMY_HASH);

  if (!user || !hash || !passwordOk || user.status !== 'active') return null;
  return user;
};

export const deleteSession = (sessionId: string): void => {
  getStore().sessions.delete(sessionId);
};

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
