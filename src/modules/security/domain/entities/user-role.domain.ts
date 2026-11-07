import { Role } from './role.domain.js';

export class UserRole {
  id: string;
  userId: number;
  roleId: number;
  startDate?: Date;
  endDate?: Date;
  status: boolean;
  role?: Role;
}
