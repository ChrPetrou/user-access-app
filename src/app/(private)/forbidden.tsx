import Link from 'next/link';
import { Card, PageHeader } from '@/components/generic';

// rendered inside (private)/layout.tsx when a page calls forbidden(), so the sidebar stays visible
const PrivateForbidden = () => (
  <>
    <PageHeader
      title="403 — Access denied"
      subtitle="You are signed in, but your role is not allowed to view this page."
    />
    <Card>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Go to your start page
      </Link>
    </Card>
  </>
);

export default PrivateForbidden;
