import { type PageLocale } from '../../../domain/content/index.js';
import { type SupportedLocale } from '@littlehelper/shared';

export interface CreatePageLocaleData {
  pageId: string;
  locale: SupportedLocale;
  title: string;
  slug: string;
  markdownPath: string;
  summary?: string | null;
  keywords?: string[];
  headerImage?: string | null;
  geminiLocked?: boolean;
}

export interface UpdatePageLocaleData {
  title?: string;
  slug?: string;
  summary?: string | null;
  keywords?: string[];
  headerImage?: string | null;
  markdownPath?: string;
  geminiLocked?: boolean;
}

export interface IPageLocaleRepository {
  findById(id: string): Promise<PageLocale | null>;
  findByPageId(pageId: string): Promise<PageLocale[]>;
  findBySlug(locale: SupportedLocale, slug: string): Promise<PageLocale | null>;
  findAll(locale?: SupportedLocale): Promise<PageLocale[]>;
  create(data: CreatePageLocaleData): Promise<PageLocale>;
  update(id: string, data: UpdatePageLocaleData): Promise<PageLocale>;
  delete(id: string): Promise<void>;
}
