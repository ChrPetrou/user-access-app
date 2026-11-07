import { canViewContent } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';

// /content/client/{id} — read-only detail view of one client (manager, user)
const ClientPage = async () => {
  await requireCurrentUser(canViewContent);

  return <div>client</div>;
};

export default ClientPage;
