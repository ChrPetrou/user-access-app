import Link from 'next/link';
import { inputClass } from '@/components/form';
import type { ClientParams } from '@/lib/clients';
import { clientStatuses } from '@/lib/types';

// a plain GET form: Apply puts ?search=&status=&country= in the URL and the page reloads with them (back to page 1)
const ClientFilters = ({ params, countries }: { params: ClientParams; countries: string[] }) => (
  <form action="/content" className="flex flex-wrap items-center gap-2">
    <input
      name="search"
      defaultValue={params.search}
      placeholder="Search name, company or email…"
      className={`${inputClass} max-w-xs`}
    />
    <select name="status" defaultValue={params.status ?? ''} className={`${inputClass} w-auto max-w-50`}>
      <option value="">All statuses</option>
      {clientStatuses.map(s => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
    <select name="country" defaultValue={params.country ?? ''} className={`${inputClass} w-auto max-w-50`}>
      <option value="">All countries</option>
      {countries.map(c => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
    <button
      type="submit"
      className="cursor-pointer rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
      Apply
    </button>
    <Link href="/content" className="px-2 py-2 text-sm text-muted hover:text-primary">
      Reset
    </Link>
  </form>
);

export default ClientFilters;
