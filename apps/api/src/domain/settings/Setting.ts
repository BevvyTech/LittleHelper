export interface SettingGroupProps {
  id: string;
  key: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class SettingGroup {
  readonly id: string;
  readonly key: string;
  readonly data: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  static readonly VALID_KEYS = ['general', 'content-source', 'storage', 'ai'] as const;

  constructor(props: SettingGroupProps) {
    this.id = props.id;
    this.key = props.key;
    this.data = props.data;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static isValidKey(key: string): boolean {
    return (SettingGroup.VALID_KEYS as readonly string[]).includes(key);
  }

  getValue<T>(field: string, defaultValue: T): T {
    const value = this.data[field];
    return value !== undefined ? (value as T) : defaultValue;
  }
}
