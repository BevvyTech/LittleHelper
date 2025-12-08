export interface SessionProps {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class Session {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;

  constructor(props: SessionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  getRemainingTime(): number {
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  static createExpiryDate(daysFromNow: number = 7): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }
}
