import { type FastifyInstance, type FastifyRequest } from 'fastify';
import {
  type IPageRepository,
  type IPageLocaleRepository,
} from '../../../application/ports/repositories/index.js';
import { CommitPageEditUseCase } from '../../../application/usecases/sync/CommitPageEditUseCase.js';
import { type ISettingsRepository } from '../../../application/ports/repositories/ISettingsRepository.js';
import { type Page, type PageLocale } from '../../../domain/content/index.js';
import { type SupportedLocale } from '@littlehelper/shared';
import { type IAnchorRepository } from '../../../application/ports/repositories/IAnchorRepository.js';

export function createPagesController(deps: {
  pageRepository: IPageRepository;
  pageLocaleRepository: IPageLocaleRepository;
  settingsRepository: ISettingsRepository;
  anchorRepository: IAnchorRepository;
}) {
  const commitPageEdit = new CommitPageEditUseCase(
    deps.settingsRepository,
    deps.anchorRepository
  );

  return async function pagesRoutes(app: FastifyInstance) {
    app.get('/', async () => {
      const pages = await deps.pageRepository.findAll();
      const locales = await deps.pageLocaleRepository.findAll();
      const tree = buildTree(pages, locales, null);
      return { data: tree };
    });

    app.get<{ Params: { id: string } }>('/:id', async (request) => {
      const page = await deps.pageRepository.findById(request.params.id);
      if (!page) {
        return { data: null };
      }
      const locales = await deps.pageLocaleRepository.findByPageId(page.id);
      return { data: { page, locales } };
    });

    app.post<
      FastifyRequest<{
        Body: {
          parentId?: string | null;
          headerImage?: string | null;
          locales: Array<{
            locale: string;
            title: string;
            slug: string;
            markdownPath: string;
            summary?: string | null;
            keywords?: string[];
            headerImage?: string | null;
          }>;
        };
      }>
    >('/', async (request) => {
      const body = request.body;
      const page = await deps.pageRepository.create({
        parentId: body.parentId ?? null,
        headerImage: body.headerImage ?? null,
      });

      for (const locale of body.locales) {
        await deps.pageLocaleRepository.create({
          pageId: page.id,
          locale: locale.locale as SupportedLocale,
          title: locale.title,
          slug: locale.slug,
          markdownPath: locale.markdownPath,
          summary: locale.summary ?? null,
          keywords: locale.keywords ?? [],
          headerImage: locale.headerImage ?? null,
        });
      }

      const locales = await deps.pageLocaleRepository.findByPageId(page.id);
      return { data: { page, locales } };
    });

    app.put<
      FastifyRequest<{
        Params: { id: string };
        Body: {
          parentId?: string | null;
          headerImage?: string | null;
          locales?: Array<{
            locale: string;
            title: string;
            slug: string;
            markdownPath?: string;
            summary?: string | null;
            keywords?: string[];
            headerImage?: string | null;
          }>;
        };
      }>
    >('/:id', async (request) => {
      const body = request.body;
      const page = await deps.pageRepository.update(request.params.id, {
        parentId: body.parentId,
        headerImage: body.headerImage,
      });

      if (body.locales) {
        const existingLocales = await deps.pageLocaleRepository.findByPageId(page.id);
        for (const locale of body.locales) {
          const existing = existingLocales.find((l) => l.locale === locale.locale);
          if (existing) {
            await deps.pageLocaleRepository.update(existing.id, {
              title: locale.title,
              slug: locale.slug,
              summary: locale.summary,
              keywords: locale.keywords,
              markdownPath: locale.markdownPath ?? existing.markdownPath,
              headerImage: locale.headerImage,
            });
          } else {
            await deps.pageLocaleRepository.create({
              pageId: page.id,
              locale: locale.locale as SupportedLocale,
              title: locale.title,
              slug: locale.slug,
              markdownPath: locale.markdownPath ?? `${locale.slug}.md`,
              summary: locale.summary ?? null,
              keywords: locale.keywords ?? [],
              headerImage: locale.headerImage ?? null,
            });
          }
        }
      }

      const locales = await deps.pageLocaleRepository.findByPageId(page.id);
      return { data: { page, locales } };
    });

    app.put<
      FastifyRequest<{
        Params: { id: string };
        Body: { filePath: string; content: string; message: string; pageLocaleId?: string };
      }>
    >('/:id/content', async (request) => {
      const { filePath, content, message, pageLocaleId } = request.body;
      const result = await commitPageEdit.execute({ filePath, content, message, pageLocaleId });
      return { data: result };
    });

    app.delete<{ Params: { id: string } }>('/:id', async (request) => {
      await deps.pageRepository.delete(request.params.id);
      return { data: { deleted: true } };
    });
  };
}

function buildTree(pages: Page[], locales: PageLocale[], parentId: string | null) {
  return pages
    .filter((page) => page.parentId === parentId)
    .map((page) => {
      const pageLocales = locales.filter((l) => l.pageId === page.id);
      return {
        id: page.id,
        shortId: page.shortId,
        parentId: page.parentId,
        headerImage: page.headerImage,
        locales: pageLocales.map((l) => ({
          id: l.id,
          locale: l.locale,
          title: l.title,
          slug: l.slug,
          markdownPath: l.markdownPath,
        })),
        children: buildTree(pages, locales, page.id),
      };
    });
}
