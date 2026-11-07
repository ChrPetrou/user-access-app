import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

const Row = ({ className = '', ...props }: ComponentProps<'div'>) => (
  <div className={`group contents ${className}`} {...props} />
);

const LRow = ({ className = '', ...props }: ComponentProps<typeof Link>) => (
  <Link className={`group contents cursor-pointer ${className}`} {...props} />
);

const Field = ({ className = '', ...props }: ComponentProps<'div'>) => (
  <div
    className={`flex items-center gap-2 border-b border-border px-3 py-3 text-sm text-text group-hover:bg-page ${className}`}
    {...props}
  />
);

type Props = {
  headers: (string | false)[];
  children?: (parts: { Row: typeof Row; LRow: typeof LRow; Field: typeof Field }) => ReactNode;
};

const GridTable = ({ headers, children }: Props) => (
  <div className="grid" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(min-content, auto))` }}>
    {headers.map((header, index) => (
      <div
        key={index}
        className="sticky top-0 border-b border-border bg-page px-3 py-3 text-sm font-semibold whitespace-nowrap text-text">
        {header}
      </div>
    ))}
    {children?.({ Row, LRow, Field })}
  </div>
);

export default GridTable;
