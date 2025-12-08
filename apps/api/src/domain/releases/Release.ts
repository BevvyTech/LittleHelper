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

  constructor(props: ReleaseProps) {
    this.id = props.id;
    this.tag = props.tag;
    this.name = props.name;
    this.description = props.description;
    this.createdAt = props.createdAt;
  }

  static validateTag(tag: string): boolean {
    return /^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(tag);
  }
}
