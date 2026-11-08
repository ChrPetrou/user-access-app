import { HttpStatus } from '@/lib/http';
import { Role } from '@/lib/roles';
import { getCurrentUser } from '@/lib/session';
import { UserStatus } from '@/lib/types';
import { userUpdateSchema } from '@/lib/schemas';
import { updateUser } from '@/lib/users';

export const PATCH = async (request: Request, { params }: RouteContext<'/api/users/[id]'>) => {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Not logged in' }, { status: HttpStatus.Unauthorized });
  }

  const { id } = await params;

  if (!id) {
    return Response.json({ error: 'User not Found' }, { status: HttpStatus.NotFound });
  }

  const body = (await request.json().catch(() => null)) as {
    fullName?: string;
    email?: string;
    role?: Role;
    status?: UserStatus;
  } | null;

  if (!body) {
    return Response.json({ error: 'Body must not be null' }, { status: HttpStatus.BadRequest });
  }
  //validation
  const input = await userUpdateSchema.validate(body).catch(() => null);
  if (!input) return Response.json({ error: 'Invalid request body' }, { status: HttpStatus.BadRequest });

  const result = updateUser({ actor: user, input: input, targetId: Number(id) });

  if (result.ok) {
    return Response.json(result, { status: HttpStatus.Ok });
  }

  return Response.json({ error: result.error }, { status: HttpStatus[result.status] });
};
