'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const VISIBLE_PAGES = 5;
const PAGE_SIZES = [10, 20, 50, 100];

type Props = { page: number; totalPages: number; totalItems: number; limit: number };

const itemClass = (active: boolean) =>
  `block min-w-8 rounded border px-2 py-1 text-center text-sm ${active ? 'border-primary text-primary' : 'border-transparent text-text hover:bg-page'}`;

const Pagination = ({ page, totalPages, totalItems, limit }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // keeps the other query params (e.g. limit) when changing page
  const urlWith = (changes: Record<string, number>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) params.set(key, String(value));
    return `${pathname}?${params.toString()}`;
  };

  // sliding window: current page in the middle, clamped to the first and last page
  const count = Math.min(VISIBLE_PAGES, totalPages);
  const start = Math.max(1, Math.min(page - Math.floor(VISIBLE_PAGES / 2), totalPages - count + 1));
  const pages = Array.from({ length: count }, (_, i) => start + i);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-end gap-4">
      <p className="text-sm text-text">{totalItems} total</p>

      <ul className="flex items-center gap-1">
        <li>
          {page > 1 ? (
            <Link href={urlWith({ page: page - 1 })} className={itemClass(false)} aria-label="Previous page">
              ‹
            </Link>
          ) : (
            <span className={`${itemClass(false)} opacity-50`}>‹</span>
          )}
        </li>
        {pages.map(n => (
          <li key={n}>
            <Link
              href={urlWith({ page: n })}
              className={itemClass(n === page)}
              aria-current={n === page ? 'page' : undefined}>
              {n}
            </Link>
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link href={urlWith({ page: page + 1 })} className={itemClass(false)} aria-label="Next page">
              ›
            </Link>
          ) : (
            <span className={`${itemClass(false)} opacity-50`}>›</span>
          )}
        </li>
      </ul>

      <div className="flex items-center gap-1 text-sm text-muted">
        <span className="mr-1">Per page:</span>
        {PAGE_SIZES.map(size => (
          <Link
            key={size}
            href={urlWith({ limit: size, page: 1 })}
            className={itemClass(size === limit)}
            aria-current={size === limit ? 'true' : undefined}>
            {size}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Pagination;
