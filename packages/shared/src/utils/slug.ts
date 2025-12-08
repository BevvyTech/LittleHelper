export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function buildPagePath(locale: string, slugParts: string[]): string {
  return `/${locale}/${slugParts.join('/')}`;
}

export function buildReleasePath(tag: string, locale: string, slugParts: string[]): string {
  return `/releases/${tag}/${locale}/${slugParts.join('/')}`;
}

export function parsePagePath(path: string): { locale: string; slugParts: string[] } | null {
  const match = path.match(/^\/([a-z]{2})\/(.+)$/);
  if (!match) return null;

  const [, locale, slugPath] = match;
  if (!locale || !slugPath) return null;

  return {
    locale,
    slugParts: slugPath.split('/').filter(Boolean),
  };
}

export function parseReleasePath(
  path: string
): { tag: string; locale: string; slugParts: string[] } | null {
  const match = path.match(/^\/releases\/([^/]+)\/([a-z]{2})\/(.+)$/);
  if (!match) return null;

  const [, tag, locale, slugPath] = match;
  if (!tag || !locale || !slugPath) return null;

  return {
    tag,
    locale,
    slugParts: slugPath.split('/').filter(Boolean),
  };
}
