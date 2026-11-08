import { Page, paginate } from './pagination';
import { canChangeRole, canChangeStatus, canEditProfile, canSeeInUserList } from './policy';
import { hasPermission } from './roles';
import type { UserUpdate } from './schemas';
import { getStore } from './store';
import type { User } from './types';

type UpdateResult = { ok: true; user: User } | { ok: false; status: 403 | 404 | 409; error: string };

export const listUsers = (actor: User, page: number, limit: number): Page<User> => {
  const store = getStore();
  const users = [...store.users.values()].filter(user => canSeeInUserList(actor, user));
  return paginate(users, page, limit);
};

export const updateUser = ({
  actor,
  targetId,
  input
}: {
  actor: User;
  targetId: number;
  input: UserUpdate;
}): UpdateResult => {
  const store = getStore();
  const target = store.users.get(targetId);
  const email = input.email?.trim();
  if (!target) {
    return { ok: false, status: 404, error: 'User not Found' };
  }

  const lastIT = [...store.users.values()].filter(user => user.role === 'IT' && user.status === 'active').length <= 1;
  const emailExist = [...store.users.values()].some(user => user.email === email && user.id !== target.id);

  //check for last it
  if (
    target.role === 'IT' &&
    target.status === 'active' &&
    (input.status === 'deactivated' || (input.role !== undefined && input.role !== 'IT')) &&
    lastIT &&
    hasPermission(actor.role, 'activate / deactivate')
  ) {
    return { ok: false, status: 409, error: 'At least one active IT account is required' };
  }
  if ((input.fullName !== undefined || input.email !== undefined) && !canEditProfile(actor, target)) {
    return { ok: false, status: 403, error: 'You cannot edit this user' };
  }
  if (input.role !== undefined && !canChangeRole(actor, target)) {
    return { ok: false, status: 403, error: 'You cannot change this role' };
  }
  if (input.status !== undefined && !canChangeStatus(actor, target)) {
    return { ok: false, status: 403, error: 'You cannot change this status' };
  }

  if (email != undefined && emailExist) return { ok: false, status: 409, error: 'Email already in use' };

  const updated = { ...target, ...input, email: email ?? target.email };

  store.users.set(targetId, updated);

  return { ok: true, user: updated };
};
