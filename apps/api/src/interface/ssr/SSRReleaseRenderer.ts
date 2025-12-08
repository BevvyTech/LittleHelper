import { type FastifyReply } from 'fastify';
import { type ReleaseContentResolver } from './ReleaseContentResolver.js';

interface RenderInput {
  tag: string;
  locale: string;
  slug: string;
}

export class SSRReleaseRenderer {
  constructor(private readonly resolver: ReleaseContentResolver) {}

  async render(reply: FastifyReply, input: RenderInput) {
    try {
      const data = await this.resolver.resolve(
        input.tag,
        input.locale as never,
        input.slug
      );
      return reply.send({ data });
    } catch (error) {
      reply.status(404).send({ error: error instanceof Error ? error.message : 'Not found' });
    }
  }
}
