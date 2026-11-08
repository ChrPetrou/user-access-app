'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { IconType } from 'react-icons';
import { LuBriefcase, LuHouse, LuLogOut, LuUser, LuUsers } from 'react-icons/lu';
import type { Role } from '@/lib/roles';

export type IconName = 'home' | 'clients' | 'profile' | 'users';

// the layout (server) passes a name; the component lives here because components can't be sent from server to client
const ICONS: Record<IconName, IconType> = {
  home: LuHouse,
  clients: LuBriefcase,
  profile: LuUser,
  users: LuUsers
};

type Props = {
  links: { href: string; label: string; icon: IconName }[];
  fullName: string;
  role: Role;
};

const Sidebar = ({ links, fullName, role }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  // the most specific link that matches the current URL is the active one
  const active = links
    .filter(l => pathname === l.href || (l.href !== '/' && pathname.startsWith(`${l.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="text-lg font-bold tracking-wide text-primary">USER ACCESS</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(link => {
          const Icon = ICONS[link.icon];
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm ${
                link.href === active ? 'bg-primary-light font-medium text-primary' : 'text-text hover:bg-page'
              }`}>
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="px-3 py-2">
          <p className="truncate text-sm font-medium text-text">{fullName}</p>
          <p className="text-xs text-muted">{role}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full cursor-pointer items-center gap-3 rounded px-3 py-2.5 text-sm text-danger hover:bg-page">
          <LuLogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
