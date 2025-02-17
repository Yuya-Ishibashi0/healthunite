import { Database } from './supabase';

export type Tables = Database['public']['Tables'];

export type Facility = Tables['facilities']['Row'];
export type NewFacility = Tables['facilities']['Insert'];
export type UpdateFacility = Tables['facilities']['Update'];

export type User = Tables['users']['Row'];
export type NewUser = Tables['users']['Insert'];
export type UpdateUser = Tables['users']['Update'];

export type AuditLog = Tables['audit_logs']['Row'];

export type UserRole = 'admin' | 'staff' | 'viewer';
export type ChangeType = 'insert' | 'update' | 'delete';

export type PPEStock = {
  masks?: number;
  gloves?: number;
  gowns?: number;
  shields?: number;
  sanitizer?: number;
  [key: string]: number | undefined;
};