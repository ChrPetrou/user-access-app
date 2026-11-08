export const ROLES = ['IT', 'manager', 'user'] as const;
export type Role = (typeof ROLES)[number];

export const isRole = (role: string): role is Role => {
  return ROLES.includes(role as Role);
};

// Edit is split by scope, mirroring the brief's "✅ all" vs "✅ own reports only".
// roles.ts only says WHICH scope a role has; policy.ts implements what
// "own reports" means (target.managerId === actor.id, not self).
export const permissions = [
  'create user',
  'edit name/email',
  'edit name/email of own reports',
  'change role',
  'activate / deactivate',
  'view content pages'
] as const;

export type Permission = (typeof permissions)[number];

export const isPermission = (permission: string): permission is Permission => {
  return permissions.includes(permission as Permission);
};

export const rolePermissions: Record<Role, readonly Permission[]> = Object.freeze({
  IT: ['create user', 'edit name/email', 'change role', 'activate / deactivate'],
  manager: ['edit name/email of own reports', 'view content pages'],
  user: ['view content pages']
});

export const hasPermission = (role: Role, permission: Permission): boolean => {
  const rolePerms = rolePermissions[role];
  return rolePerms.includes(permission);
};

// where each role lands after login (scenario 10). Record<Role, …> makes a new role without a home a compile error.
export const roleHome: Record<Role, string> = {
  IT: '/manage-users',
  manager: '/content',
  user: '/content'
};

// Rule 4 ("never zero active IT") is the one rule about a role's identity rather than a permission.
export const IT_ROLE: Role = 'IT';

// preselected role in the "Add user" form
export const DEFAULT_ROLE: Role = 'user';
