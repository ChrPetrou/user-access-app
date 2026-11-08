import type { UserCreate, UserUpdate } from '@/lib/schemas';
import type { User } from '@/lib/types';

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

const request = async <T>(url: string, init?: RequestInit): Promise<ApiResult<T>> => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) return { ok: false, error: body?.error ?? `Request failed (${response.status})` };
  return { ok: true, data: body as T };
};

export const Agent = {
  updateUser: (id: number, changes: UserUpdate) =>
    request<{ user: User }>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),

  createUser: (input: UserCreate) => request<User>('/api/users', { method: 'POST', body: JSON.stringify(input) })
};
