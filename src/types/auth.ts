import { UserRole } from './purchaseOrder';

export interface AppUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  branch?: string; // 門市同事必填
  isActive: boolean;
  createdAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
