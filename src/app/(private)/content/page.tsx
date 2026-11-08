import { Badge, Card, PageHeader } from '@/components/generic';
import Pagination from '@/components/pagination';
import GridTable from '@/components/Table/GridTable';
import { listClients } from '@/lib/clients';
import { canViewContent } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';

const ContentPage = async ({ searchParams }: PageProps<'/content'>) => {
  await requireCurrentUser(canViewContent);
  const { page, limit } = await searchParams;
  const result = listClients(Number(page), Number(limit));

  return (
    <>
      <PageHeader title="Clients" subtitle="Browse client accounts" />

      <Card className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="min-h-0 flex-1 overflow-auto">
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
