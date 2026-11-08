import { paginate, type Page } from './pagination';
import { getStore } from './store';
import type { Client } from './types'; // ?search=&status=&country= from the URL
export type ClientParams = { search?: string; status?: string; country?: string };

const filterClients = (clients: Client[], { search, status, country }: ClientParams): Client[] => {
  const text = search?.trim().toLowerCase();
  return clients.filter(
    c =>
      (!text || [c.name, c.company, c.email].some(field => field.toLowerCase().includes(text))) &&
      (!status || c.status === status) &&
      (!country || c.country === country)
  );
};

// filter first, then paginate: the total counts the filtered clients, and the browser only gets one page
export const listClients = (params: ClientParams, page: number, limit: number): Page<Client> =>
  paginate(filterClients([...getStore().clients.values()], params), page, limit);

export const listCountries = (): string[] =>
  [...new Set([...getStore().clients.values()].map(c => c.country))].sort((a, b) => a.localeCompare(b));

export const getClient = ({ id }: { id: number }): Client | null => getStore().clients.get(id) ?? null;
