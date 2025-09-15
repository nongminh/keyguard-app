// Fix: Changed 'import type' to a regular import for Permission enum as it is used as a value.
import { Permission } from './types';

export const SUPER_ADMIN_EMAIL = 'nongdinhminh@gmail.com';
export const MOCK_OTP = '123456';

export const PERMISSIONS: { [key in Permission]: string } = {
  [Permission.CREATE_KEYS]: 'Create Keys',
  [Permission.EDIT_KEYS]: 'Edit Keys',
  [Permission.DELETE_KEYS]: 'Delete Keys',
  [Permission.TOGGLE_KEY_STATUS]: 'Toggle Key Status',
  [Permission.MANAGE_APPLICATIONS]: 'Manage Applications',
};