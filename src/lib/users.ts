import type { StatusName } from './http';
import { Page, paginate } from './pagination';
import { canChangeRole, canChangeStatus, canCreateUser, canEditProfile, canSeeInUserList } from './policy';
import { hasPermission } from './roles';
import type { UserCreate, UserUpdate } from './schemas';
import { hashPassword } from './password';
import { getStore } from './store';
import type { User } from './types';

type UpdateResult =
  { ok: true; user: User } | { ok: false; status: StatusName<'Forbidden' | 'NotFound' | 'Conflict'>; error: string };

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
    return { ok: false, status: 'NotFound', error: 'User not Found' };
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
    return { ok: false, status: 'Conflict', error: 'At least one active IT account is required' };
  }
  if ((input.fullName !== undefined || input.email !== undefined) && !canEditProfile(actor, target)) {
    return { ok: false, status: 'Forbidden', error: 'You cannot edit this user' };
  }
  if (input.role !== undefined && !canChangeRole(actor, target)) {
    return { ok: false, status: 'Forbidden', error: 'You cannot change this role' };
  }
  if (input.status !== undefined && !canChangeStatus(actor, target)) {
    return { ok: false, status: 'Forbidden', error: 'You cannot change this status' };
  }

  if (email != undefined && emailExist) return { ok: false, status: 'Conflict', error: 'Email already in use' };

  const updated = { ...target, ...input, email: email ?? target.email };

  store.users.set(targetId, updated);

  return { ok: true, user: updated };
};

type CreateResult =
  { ok: true; user: User } | { ok: false; status: StatusName<'BadRequest' | 'Forbidden' | 'Conflict'>; error: string };

export const createUser = ({ actor, input }: { actor: User; input: UserCreate }): CreateResult => {
  const store = getStore();

  const email = input.email.trim();
  if (!canCreateUser(actor)) return { ok: false, error: 'You cannot create users', status: 'Forbidden' };
  const emailExist = [...store.users.values()].some(user => user.email === email);
  if (emailExist) return { ok: false, status: 'Conflict', error: 'Email already in use' };

  // a manager is anyone whose role can have reports — asked by permission, not by role name
  if (input.managerId !== null) {
    const manager = store.users.get(input.managerId);
    if (!manager || !hasPermission(manager.role, 'edit name/email of own reports')) {
      return { ok: false, status: 'BadRequest', error: 'managerId must point to a manager' };
    }
  }

  const id = Math.max(0, ...store.users.keys()) + 1;
  // built field by field: the password never ends up on the user object
  const user: User = {
    id,
    fullName: input.fullName.trim(),
    email,
    role: input.role,
    status: 'active',
    managerId: input.managerId,
    createdAt: new Date().toISOString()
  };

  store.users.set(id, user);
  store.credentials.set(id, hashPassword(input.password));

  return { ok: true, user };
};
