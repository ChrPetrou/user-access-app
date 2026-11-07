import { canViewContent } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';

// /content/me — the logged-in user's own information (manager, user)
const MePage = async () => {
  await requireCurrentUser(canViewContent);

  return <div>my profile</div>;
};

export default MePage;
