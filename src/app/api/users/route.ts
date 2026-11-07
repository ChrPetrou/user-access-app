import { getCurrentUser } from '@/lib/session';

import { canAccessUserManagement } from '@/lib/policy';
import { listUsers } from '@/lib/users';

export const GET = async (request: Request) => {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }
  if (!canAccessUserManagement(user)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;

  return Response.json(listUsers(user, Number(params.get('page')), Number(params.get('limit'))));
};
