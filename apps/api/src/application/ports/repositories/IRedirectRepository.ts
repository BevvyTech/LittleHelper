import { type Redirect } from '../../../domain/redirects/index.js';
import { type SupportedLocale } from '@littlehelper/shared';

export interface CreateRedirectData {
  oldSlug: string;
  newSlug: string;
  locale: SupportedLocale;
}

export interface IRedirectRepository {
  findByOldSlug(locale: SupportedLocale, oldSlug: string): Promise<Redirect | null>;
  findAll(locale?: SupportedLocale): Promise<Redirect[]>;
  create(data: CreateRedirectData): Promise<Redirect>;
  delete(id: string): Promise<void>;
  deleteByOldSlug(locale: SupportedLocale, oldSlug: string): Promise<void>;
}
