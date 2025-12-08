import { type SupportedLocale } from '@littlehelper/shared';

export interface RedirectProps {
  id: string;
  oldSlug: string;
  newSlug: string;
  locale: SupportedLocale;
  createdAt: Date;
}

export class Redirect {
  readonly id: string;
  readonly oldSlug: string;
  readonly newSlug: string;
  readonly locale: SupportedLocale;
  readonly createdAt: Date;

  constructor(props: RedirectProps) {
    this.id = props.id;
    this.oldSlug = props.oldSlug;
    this.newSlug = props.newSlug;
    this.locale = props.locale;
    this.createdAt = props.createdAt;
  }

  getOldPath(): string {
    return `/${this.locale}/${this.oldSlug}`;
  }

  getNewPath(): string {
    return `/${this.locale}/${this.newSlug}`;
  }
}
