import type { Page } from '@/lib/pagination';
import type { UserUpdate } from '@/lib/schemas';
import type { User } from '@/lib/types';

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

const request = async <T>(url: string, init?: RequestInit): Promise<ApiResult<T>> => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) return { ok: false, error: body?.error ?? `Request failed (${response.status})` };
  return { ok: true, data: body as T };
};

export const Agent = {
  getUsers: ({ page, limit }: { page: number; limit: number }) =>
    request<Page<User>>(`/api/users?page=${page}&limit=${limit}`),

  updateUser: (id: number, changes: UserUpdate) =>
    request<{ user: User }>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
};
