// Request body schemas. Imported by API routes AND client forms, so this file must stay free of server-only imports.
import * as Yup from 'yup';
import { ROLES, type Role } from './roles';
import { userStatuses, type UserStatus } from './types';

export const userUpdateSchema = Yup.object({
  fullName: Yup.string().trim().min(1, 'Full name is required'),
  // .email() accepts '' as "no value", so min(1) is what blocks an empty email
  email: Yup.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  role: Yup.mixed<Role>().oneOf(ROLES),
  status: Yup.mixed<UserStatus>().oneOf(userStatuses)
})
  .noUnknown()
  .strict();

export type UserUpdate = Yup.InferType<typeof userUpdateSchema>;
