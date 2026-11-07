'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Role } from '@/lib/roles';

export type IconName = 'home' | 'clients' | 'profile' | 'users';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round">
    {children}
  </svg>
);

const ICONS: Record<IconName, ReactNode> = {
  home: <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  clients: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 20a7 7 0 0 0-2.5-5.4" />
    </>
  )
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
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm ${
              link.href === active ? 'bg-primary-light font-medium text-primary' : 'text-text hover:bg-page'
            }`}>
            <Icon>{ICONS[link.icon]}</Icon>
            {link.label}
          </Link>
        ))}
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
          <Icon>
            <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11" />
          </Icon>
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
