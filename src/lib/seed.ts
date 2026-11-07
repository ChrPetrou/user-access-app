import { hashPassword } from './password';
import type { Store } from './store';
import type { Client, ClientStatus, User } from './types';

export const SEED_PASSWORD = 'Password123!';

const SEED_USERS: readonly User[] = [
  // IT
  {
    id: 1,
    fullName: 'Ivan Petrenko',
    email: 'ivan.it@example.com',
    role: 'IT',
    status: 'active',
    managerId: null,
    createdAt: '2024-01-08T09:00:00.000Z'
  },
  {
    id: 2,
    fullName: 'Iryna Koval',
    email: 'iryna.it@example.com',
    role: 'IT',
    status: 'active',
    managerId: null,
    createdAt: '2024-01-09T09:00:00.000Z'
  },

  // managers: Anna has 4 reports, Bohdan manages Dmytro, Maksym has none, Dana is deactivated
  {
    id: 3,
    fullName: 'Anna Shevchenko',
    email: 'anna.manager@example.com',
    role: 'manager',
    status: 'active',
    managerId: null,
    createdAt: '2024-02-01T09:00:00.000Z'
  },
  {
    id: 4,
    fullName: 'Bohdan Melnyk',
    email: 'bohdan.manager@example.com',
    role: 'manager',
    status: 'active',
    managerId: null,
    createdAt: '2024-02-02T09:00:00.000Z'
  },
  {
    id: 5,
    fullName: 'Maksym Bondar',
    email: 'maksym.manager@example.com',
    role: 'manager',
    status: 'active',
    managerId: null,
    createdAt: '2024-02-03T09:00:00.000Z'
  },
  {
    id: 6,
    fullName: 'Dana Kravets',
    email: 'dana.manager@example.com',
    role: 'manager',
    status: 'deactivated',
    managerId: null,
    createdAt: '2024-02-04T09:00:00.000Z'
  },

  // Anna's 4 direct reports
  {
    id: 7,
    fullName: 'Olena Tkachenko',
    email: 'olena.user@example.com',
    role: 'user',
    status: 'active',
    managerId: 3,
    createdAt: '2024-03-01T09:00:00.000Z'
  },
  {
    id: 8,
    fullName: 'Petro Lysenko',
    email: 'petro.user@example.com',
    role: 'user',
    status: 'active',
    managerId: 3,
    createdAt: '2024-03-02T09:00:00.000Z'
  },
  {
    id: 9,
    fullName: 'Sofia Moroz',
    email: 'sofia.user@example.com',
    role: 'user',
    status: 'active',
    managerId: 3,
    createdAt: '2024-03-03T09:00:00.000Z'
  },
  {
    id: 10,
    fullName: 'Yurii Savchenko',
    email: 'yurii.user@example.com',
    role: 'user',
    status: 'active',
    managerId: 3,
    createdAt: '2024-03-04T09:00:00.000Z'
  },

  // other users
  {
    id: 11,
    fullName: 'Dmytro Boyko',
    email: 'dmytro.user@example.com',
    role: 'user',
    status: 'active',
    managerId: 4,
    createdAt: '2024-03-05T09:00:00.000Z'
  },
  {
    id: 12,
    fullName: 'Halyna Rudenko',
    email: 'halyna.user@example.com',
    role: 'user',
    status: 'deactivated',
    managerId: 4,
    createdAt: '2024-03-06T09:00:00.000Z'
  },
  {
    id: 13,
    fullName: 'Taras Marchenko',
    email: 'taras.user@example.com',
    role: 'user',
    status: 'active',
    managerId: 6,
    createdAt: '2024-03-07T09:00:00.000Z'
  },
  {
    id: 14,
    fullName: 'Kateryna Polishchuk',
    email: 'kateryna.user@example.com',
    role: 'user',
    status: 'active',
    managerId: null,
    createdAt: '2024-03-08T09:00:00.000Z'
  }
];

const CLIENT_COUNT = 1200;
const CHURN_RATE = 0.25;
const PRNG_SEED = 20261106;
const CLIENTS_FROM = Date.parse('2021-01-01T00:00:00.000Z');
const CLIENTS_TO = Date.parse('2026-10-31T00:00:00.000Z');

// seeded random numbers, so client 42 is the same record after every restart
const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type NonEmpty<T> = readonly [T, ...T[]];

const pick = <T>(rand: () => number, arr: NonEmpty<T>): T => arr[Math.floor(rand() * arr.length)] ?? arr[0];

const FIRST_NAMES = [
  'Alice',
  'Ben',
  'Chloe',
  'Daniel',
  'Elena',
  'Farid',
  'Grace',
  'Hugo',
  'Ines',
  'Jonas',
  'Kira',
  'Liam',
  'Mei',
  'Nikos',
  'Olivia',
  'Pavel',
  'Rosa',
  'Sami',
  'Tara',
  'Yusuf'
] as const;
const LAST_NAMES = [
  'Anders',
  'Becker',
  'Costa',
  'Dimitriou',
  'Evans',
  'Fischer',
  'Garcia',
  'Hansen',
  'Ivanova',
  'Jensen',
  'Kowalski',
  'Larsen',
  'Moreau',
  'Nakamura',
  'Okafor',
  'Papadopoulos',
  'Rossi',
  'Silva',
  'Tanaka',
  'Weber'
] as const;
const COMPANY_PREFIXES = [
  'Blue',
  'North',
  'Bright',
  'Iron',
  'Silver',
  'Green',
  'Swift',
  'Prime',
  'Atlas',
  'Nova'
] as const;
const COMPANY_SUFFIXES = [
  'Logistics',
  'Labs',
  'Holdings',
  'Media',
  'Foods',
  'Systems',
  'Partners',
  'Energy',
  'Retail',
  'Studios'
] as const;
const COUNTRIES = [
  'Greece',
  'Cyprus',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Poland',
  'Portugal',
  'Ireland'
] as const;

const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

const generateClients = (count: number): Client[] => {
  const rand = mulberry32(PRNG_SEED);
  const clients: Client[] = [];

  for (let id = 1; id <= count; id++) {
    const first = pick(rand, FIRST_NAMES);
    const last = pick(rand, LAST_NAMES);
    const company = `${pick(rand, COMPANY_PREFIXES)} ${pick(rand, COMPANY_SUFFIXES)}`;
    const status: ClientStatus = rand() < CHURN_RATE ? 'churned' : 'active';
    const createdAt = new Date(CLIENTS_FROM + Math.floor(rand() * (CLIENTS_TO - CLIENTS_FROM))).toISOString();

    clients.push({
      id,
      name: `${first} ${last}`,
      company,
      email: `${slug(first)}.${slug(last)}${id}@${slug(company)}.com`,
      country: pick(rand, COUNTRIES),
      status,
      createdAt
    });
  }

  return clients;
};

export const seed = (store: Store): void => {
  for (const user of SEED_USERS) {
    store.users.set(user.id, { ...user });
    store.credentials.set(user.id, hashPassword(SEED_PASSWORD));
  }

  for (const client of generateClients(CLIENT_COUNT)) {
    store.clients.set(client.id, client);
  }
};
