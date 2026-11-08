import Link from 'next/link';
import { Card, PageHeader } from '@/components/generic';

// rendered inside (private)/layout.tsx, so the sidebar stays visible
const PrivateNotFound = () => (
  <>
    <PageHeader title="Page not found" subtitle="The page or record you are looking for does not exist." />
    <Card>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Go to home
      </Link>
    </Card>
  </>
);

export default PrivateNotFound;
