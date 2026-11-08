import { listClients } from '@/lib/clients';
import { HttpStatus } from '@/lib/http';
import { canViewContent } from '@/lib/policy';
import { getCurrentUser } from '@/lib/session';

export const GET = async (request: Request) => {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: HttpStatus.Unauthorized });
  }
  if (!canViewContent(user)) {
    return Response.json({ error: 'Forbidden' }, { status: HttpStatus.Forbidden });
  }

  const params = new URL(request.url).searchParams;

  const filters = {
    search: params.get('search') ?? undefined,
    status: params.get('status') ?? undefined,
    country: params.get('country') ?? undefined
  };

  return Response.json(listClients(filters, Number(params.get('page')), Number(params.get('limit'))));
};
