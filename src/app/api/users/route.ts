import { HttpStatus } from '@/lib/http';
import { canAccessUserManagement } from '@/lib/policy';
import { userCreateSchema } from '@/lib/schemas';
import { getCurrentUser } from '@/lib/session';
import { createUser, listUsers } from '@/lib/users';

export const GET = async (request: Request) => {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: HttpStatus.Unauthorized });
  }
  if (!canAccessUserManagement(user)) {
    return Response.json({ error: 'Forbidden' }, { status: HttpStatus.Forbidden });
  }

  const params = new URL(request.url).searchParams;

  return Response.json(listUsers(user, Number(params.get('page')), Number(params.get('limit'))));
};

export const POST = async (request: Request) => {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: HttpStatus.Unauthorized });
  }

  const body = await request.json().catch(() => null);
  const input = await userCreateSchema.validate(body).catch(() => null);
  if (!input) {
    return Response.json({ error: 'Invalid request body' }, { status: HttpStatus.BadRequest });
  }

  const result = createUser({ actor: user, input });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: HttpStatus[result.status] });
  }

  return Response.json(result.user, { status: HttpStatus.Created });
};
