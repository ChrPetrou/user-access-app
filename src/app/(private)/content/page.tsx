import { Badge, Card, PageHeader } from '@/components/generic';
import Pagination from '@/components/pagination';
import GridTable from '@/components/Table/GridTable';
import { listClients, listCountries } from '@/lib/clients';
import { canViewContent } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';
import ClientFilters from './ClientFilters';

const ContentPage = async ({ searchParams }: PageProps<'/content'>) => {
  await requireCurrentUser(canViewContent);
  const { page, limit, search, status, country } = await searchParams;
  // a URL value can be a string or (for ?a=1&a=2) an array — only plain strings are used as filters
  const text = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined);
  const params = { search: text(search), status: text(status), country: text(country) };
  const result = listClients(params, Number(page), Number(limit));

  return (
    <>
      <PageHeader title="Clients" subtitle="Browse client accounts" />

      <Card className="flex min-h-0 flex-1 flex-col gap-4">
        <ClientFilters params={params} countries={listCountries()} />

        <div className="min-h-0 flex-1 overflow-auto">
          {result.totalItems === 0 && <p className="text-sm text-muted">No clients match these filters.</p>}
          <GridTable headers={['Name', 'Company', 'Email', 'Country', 'Status']}>
            {({ LRow, Field }) =>
              result.items.map(c => (
                <LRow key={c.id} href={`/content/client/${c.id}`}>
                  <Field>{c.name}</Field>
                  <Field>{c.company}</Field>
                  <Field>{c.email}</Field>
                  <Field>{c.country}</Field>
                  <Field>
                    <Badge tone={c.status === 'active' ? 'success' : 'neutral'}>{c.status}</Badge>
                  </Field>
                </LRow>
              ))
            }
          </GridTable>
        </div>
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          totalItems={result.totalItems}
          limit={result.limit}
        />
      </Card>
    </>
  );
};

export default ContentPage;
