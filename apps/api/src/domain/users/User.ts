import { type UserRole } from '@littlehelper/shared';

export interface UserProps {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  banned: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly banned: boolean;
  readonly lastLogin: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.avatarUrl = props.avatarUrl;
    this.role = props.role;
    this.banned = props.banned;
    this.lastLogin = props.lastLogin;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isBanned(): boolean {
    return this.banned;
  }

  canLogin(): boolean {
    return !this.banned;
  }

  canModerate(): boolean {
    return this.isAdmin() && !this.banned;
  }
}
