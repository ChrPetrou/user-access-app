import { hasPermission } from './roles';
import type { User } from './types';

const isActive = (u: User): boolean => u.status === 'active';
const isSelf = (actor: User, target: User): boolean => actor.id === target.id;
const isDirectReport = (actor: User, target: User): boolean => target.managerId === actor.id;

export const canCreateUser = (actor: User): boolean => isActive(actor) && hasPermission(actor.role, 'create user');

export const canEditProfile = (actor: User, target: User): boolean => {
  if (!isActive(actor)) return false;
  if (hasPermission(actor.role, 'edit name/email')) return true;
  return (
    hasPermission(actor.role, 'edit name/email of own reports') &&
    !isSelf(actor, target) &&
    isDirectReport(actor, target)
  );
};

export const canChangeRole = (actor: User, target: User): boolean =>
  isActive(actor) && hasPermission(actor.role, 'change role') && !isSelf(actor, target);

export const canChangeStatus = (actor: User, target: User): boolean =>
  isActive(actor) && hasPermission(actor.role, 'activate / deactivate') && !isSelf(actor, target);

export const canViewContent = (actor: User): boolean =>
  isActive(actor) && hasPermission(actor.role, 'view content pages');

export const canSeeInUserList = (actor: User, target: User): boolean => canEditProfile(actor, target);

export const canAccessUserManagement = (actor: User): boolean =>
  isActive(actor) &&
  (hasPermission(actor.role, 'edit name/email') || hasPermission(actor.role, 'edit name/email of own reports'));

// who may be set as someone's managerId — any role that can manage its own reports
export const canHaveReports = (user: User): boolean => hasPermission(user.role, 'edit name/email of own reports');
