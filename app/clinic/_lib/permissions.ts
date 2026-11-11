export const ROLE_MODULES = [
  'Dashboard',
  'Patients',
  'Appointments',
  'Medical Records',
  'Sessions',
  'Treatment Plans',
  'Therapists',
  'Billing',
  'Payments',
  'Inventory',
  'Reports',
  'Settings',
] as const;

export const PERMISSION_ACTIONS = [
  'View',
  'Create',
  'Edit',
  'Delete',
  'Approve',
  'Export',
] as const;

export type RoleModule = (typeof ROLE_MODULES)[number];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export function emptyPermissions(): Record<string, PermissionAction[]> {
  return Object.fromEntries(ROLE_MODULES.map((m) => [m, []]));
}

export function fullPermissions(): Record<string, PermissionAction[]> {
  return Object.fromEntries(
    ROLE_MODULES.map((m) => [m, [...PERMISSION_ACTIONS]])
  );
}
