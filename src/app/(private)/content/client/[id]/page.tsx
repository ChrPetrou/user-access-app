import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import { Badge, Card, PageHeader } from '@/components/generic';
import { getClient } from '@/lib/clients';
import { canViewContent } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';

const Detail = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <dt className="text-xs font-medium tracking-wide text-muted uppercase">{label}</dt>
    <dd className="text-sm text-text">{children}</dd>
  </div>
);

const ClientPage = async ({ params }: PageProps<'/content/client/[id]'>) => {
  await requireCurrentUser(canViewContent);
  const { id } = await params;

  const client = getClient({ id: Number(id) });
  if (!client) notFound();

  return (
    <>
      <Link href="/content" className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-primary">
        <LuArrowLeft size={14} /> Back to clients
      </Link>

      <PageHeader title={client.name} subtitle={client.company} />

      <Card>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Detail label="Email">{client.email}</Detail>
          <Detail label="Country">{client.country}</Detail>
          <Detail label="Status">
            <Badge tone={client.status === 'active' ? 'success' : 'neutral'}>{client.status}</Badge>
          </Detail>
          <Detail label="Client since">{new Date(client.createdAt).toLocaleDateString('en-GB')}</Detail>
          <Detail label="Client ID">{client.id}</Detail>
        </dl>
      </Card>
    </>
  );
};

export default ClientPage;
