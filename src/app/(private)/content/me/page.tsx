import { Badge, Card, Detail, PageHeader } from '@/components/generic';
import { canViewContent } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';
import { getUserById } from '@/lib/users';

// /content/me — the logged-in user's own information (manager, user)
const MePage = async () => {
  const user = await requireCurrentUser(canViewContent);
  const manager = user.managerId === null ? null : getUserById(user.managerId);

  return (
    <>
      <PageHeader title={user.fullName} subtitle="Your account" />

      <Card>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Detail label="Email">{user.email}</Detail>
          <Detail label="Role">{user.role}</Detail>
          <Detail label="Status">
            <Badge tone={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge>
          </Detail>
          <Detail label="Manager">
            {manager ? (
              <>
                {manager.fullName}
                {manager.status === 'deactivated' && <span className="ml-2 text-xs text-muted">(deactivated)</span>}
              </>
            ) : (
              <span className="text-muted">None</span>
            )}
          </Detail>
          <Detail label="Member since">{new Date(user.createdAt).toLocaleDateString('en-GB')}</Detail>
          <Detail label="User ID">{user.id}</Detail>
        </dl>
      </Card>
    </>
  );
};

export default MePage;
