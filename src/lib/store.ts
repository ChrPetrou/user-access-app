import { seed } from './seed';
import type { Client, User } from './types';

export type Session = { userId: number; expiresAt: Date };

export type Store = {
  users: Map<number, User>;
  clients: Map<number, Client>;
  credentials: Map<number, string>;
  sessions: Map<string, Session>;
};

const createStore = (): Store => {
  const store: Store = {
    users: new Map(),
    clients: new Map(),
    credentials: new Map(),
    sessions: new Map()
  };
  seed(store);
  return store;
};

//  survives hot reload
declare global {
  var __store: Store | undefined;
}

export const getStore = (): Store => {
  return (globalThis.__store ??= createStore());
};
