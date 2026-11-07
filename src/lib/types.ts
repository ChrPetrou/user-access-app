import { Role } from './roles';

export const userStatuses = ['active', 'deactivated'] as const;
export type UserStatus = (typeof userStatuses)[number];

export const clientStatuses = ['active', 'churned'] as const;
export type ClientStatus = (typeof clientStatuses)[number];

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  managerId: number | null;
  createdAt: string;
};

export type Client = {
  id: number;
  name: string;
  company: string;
  email: string;
  country: string;
  status: ClientStatus;
  createdAt: string;
};
