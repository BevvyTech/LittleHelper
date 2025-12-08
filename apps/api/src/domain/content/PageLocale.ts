import { type SupportedLocale, isValidLocale, slugify, isValidSlug } from '@littlehelper/shared';

export interface PageLocaleProps {
  id: string;
  pageId: string;
  locale: SupportedLocale;
  title: string;
  slug: string;
  summary: string | null;
  keywords: string[];
  markdownPath: string;
  headerImage: string | null;
  geminiLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PageLocale {
  readonly id: string;
  readonly pageId: string;
  readonly locale: SupportedLocale;
  readonly title: string;
  readonly slug: string;
  readonly summary: string | null;
  readonly keywords: string[];
  readonly markdownPath: string;
  readonly headerImage: string | null;
  readonly geminiLocked: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: PageLocaleProps) {
    this.id = props.id;
    this.pageId = props.pageId;
    this.locale = props.locale;
    this.title = props.title;
    this.slug = props.slug;
    this.summary = props.summary;
    this.keywords = props.keywords;
    this.markdownPath = props.markdownPath;
    this.headerImage = props.headerImage;
    this.geminiLocked = props.geminiLocked;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  canUpdateSeoFromGemini(): boolean {
    return !this.geminiLocked;
  }

  static validateLocale(locale: string): boolean {
    return isValidLocale(locale);
  }

  static validateSlug(slug: string): boolean {
    return isValidSlug(slug);
  }

  static createSlug(title: string): string {
    return slugify(title);
  }

  getPath(): string {
    return `/${this.locale}/${this.slug}`;
  }
}
