export interface ReleaseProps {
  id: string;
  tag: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export class Release {
  readonly id: string;
  readonly tag: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: Date;

  static readonly TAG_PATTERN = /^[a-z0-9._-]+$/i;
  static readonly MAX_TAG_LENGTH = 50;
  static readonly MAX_NAME_LENGTH = 100;
  static readonly MAX_DESCRIPTION_LENGTH = 1000;

  constructor(props: ReleaseProps) {
    this.id = props.id;
    this.tag = props.tag;
    this.name = props.name;
    this.description = props.description;
    this.createdAt = props.createdAt;
  }

  static validateTag(tag: string): { valid: boolean; error?: string } {
    if (tag.length === 0) {
      return { valid: false, error: 'Tag is required' };
    }
    if (tag.length > Release.MAX_TAG_LENGTH) {
      return { valid: false, error: `Tag must be at most ${Release.MAX_TAG_LENGTH} characters` };
    }
    if (!Release.TAG_PATTERN.test(tag)) {
      return { valid: false, error: 'Tag must be alphanumeric with dots, underscores, and hyphens' };
    }
    return { valid: true };
  }

  static validateName(name: string): { valid: boolean; error?: string } {
    if (name.length === 0) {
      return { valid: false, error: 'Name is required' };
    }
    if (name.length > Release.MAX_NAME_LENGTH) {
      return { valid: false, error: `Name must be at most ${Release.MAX_NAME_LENGTH} characters` };
    }
    return { valid: true };
  }
}
