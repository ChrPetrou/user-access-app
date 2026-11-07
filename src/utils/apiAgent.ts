import { Page } from '@/lib/pagination';
import { User } from '@/lib/types';

export const Agent = {
  getUsers: async ({ page, limit }: { page: number; limit: number }): Promise<Page<User>> => {
    const response = await fetch(`/api/users?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return response.json() as Promise<Page<User>>;
  }
};
