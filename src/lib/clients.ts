import { paginate, type Page } from './pagination';
import { getStore } from './store';
import type { Client } from './types';

export const listClients = (page: number, limit: number): Page<Client> =>
  paginate([...getStore().clients.values()], page, limit);

export const getClient = ({ id }: { id: number }): Client | null => getStore().clients.get(id) ?? null;
