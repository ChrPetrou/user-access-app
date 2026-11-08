import { canAccessUserManagement, canViewContent } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';
import type { User } from '@/lib/types';
import { Container } from '@/components/generic';
import Sidebar, { type IconName } from './Sidebar';

// every sidebar link, with the policy check that decides who sees it
const LINKS: { href: string; label: string; icon: IconName; canSee: (user: User) => boolean }[] = [
  { href: '/content', label: 'Clients', icon: 'clients', canSee: canViewContent },
  { href: '/content/me', label: 'My profile', icon: 'profile', canSee: canViewContent },
  { href: '/manage-users', label: 'Manage users', icon: 'users', canSee: canAccessUserManagement }
];

const PrivateLayout = async ({ children }: { children: React.ReactNode }) => {
  // the sidebar is only display: every page still checks access itself
  const user = await requireCurrentUser();
  const links = LINKS.filter(link => link.canSee(user)).map(({ href, label, icon }) => ({ href, label, icon }));

  return (
    <div className="flex h-screen">
      <Sidebar links={links} fullName={user.fullName} role={user.role} />
      <main className="flex min-h-0 flex-1 flex-col bg-page py-6">
        <Container className="flex min-h-0 flex-1 flex-col">{children}</Container>
      </main>
    </div>
  );
};

export default PrivateLayout;
