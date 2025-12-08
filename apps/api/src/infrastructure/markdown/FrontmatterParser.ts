import matter from 'gray-matter';
import { isValidLocale, type SupportedLocale } from '@littlehelper/shared';

export interface ParsedFrontmatter {
  title: string;
  slug: string;
  locale: SupportedLocale;
  parent: string;
  headerImage?: string | null;
  summary?: string | null;
  keywords?: string[];
}

export class FrontmatterParser {
  parse(filePath: string, content: string): ParsedFrontmatter {
    const { data } = matter(content);

    const title = this.getString(data.title);
    const slug = this.getString(data.slug);
    const localeValue = this.getString(data.locale);
    const parent = this.getString(data.parent);

    if (!title || !slug || !localeValue || !parent) {
      throw new Error(`Missing required frontmatter fields in ${filePath}`);
    }

    if (!isValidLocale(localeValue)) {
      throw new Error(`Invalid locale "${localeValue}" in ${filePath}`);
    }

    const headerImage = this.getOptionalString(data.headerImage);
    const summary = this.getOptionalString(data.summary);
    const keywords = Array.isArray(data.keywords)
      ? data.keywords.map((k: unknown) => String(k)).filter(Boolean)
      : undefined;

    return {
      title,
      slug,
      locale: localeValue,
      parent,
      headerImage,
      summary,
      keywords,
    };
  }

  private getString(value: unknown): string {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
  }

  private getOptionalString(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === 'string') return value.trim();
    return undefined;
  }
}
