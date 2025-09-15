
export interface Application {
  id: string;
  name: string;
}

export interface Key {
  id: string;
  keyValue: string;
  applicationId: string;
  userName: string;
  userContact: string; // email or phone
  startDate: string; // ISO 8601 format: YYYY-MM-DD
  endDate: string; // ISO 8601 format: YYYY-MM-DD
  isActive: boolean;
}

export enum Permission {
  CREATE_KEYS = 'CREATE_KEYS',
  EDIT_KEYS = 'EDIT_KEYS',
  DELETE_KEYS = 'DELETE_KEYS',
  TOGGLE_KEY_STATUS = 'TOGGLE_KEY_STATUS',
  MANAGE_APPLICATIONS = 'MANAGE_APPLICATIONS',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  password?: string;
  permissions?: {
    [key in Permission]?: boolean;
  };
}

export enum KeyStatus {
  Active = 'Active',
  Expired = 'Expired',
  Pending = 'Pending',
  Deactivated = 'Deactivated',
}