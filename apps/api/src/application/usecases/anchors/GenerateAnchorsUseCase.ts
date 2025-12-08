import {
  type IAnchorRepository,
  type UpsertAnchorData,
} from '../../ports/repositories/IAnchorRepository.js';
import {
  AnchorGenerator,
  AnchorReconciler,
  MarkdownBlockParser,
} from '../../../infrastructure/markdown/index.js';

export interface GenerateAnchorsInput {
  pageLocaleId: string;
  content: string;
}

export class GenerateAnchorsUseCase {
  constructor(
    private readonly anchorRepository: IAnchorRepository,
    private readonly parser = new MarkdownBlockParser(),
    private readonly generator = new AnchorGenerator(),
    private readonly reconciler = new AnchorReconciler()
  ) {}

  async execute(input: GenerateAnchorsInput): Promise<void> {
    const blocks = await this.parser.parse(input.content);
    const generated = await this.generator.generate(input.pageLocaleId, blocks);
    const existing = await this.anchorRepository.findByPageLocaleId(input.pageLocaleId);

    const { upserts, activeAnchorIds } = this.reconciler.reconcile(
      input.pageLocaleId,
      existing,
      generated
    );

    await this.anchorRepository.upsertMany(upserts as UpsertAnchorData[]);
    await this.anchorRepository.markOrphaned(input.pageLocaleId, activeAnchorIds);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    await this.anchorRepository.deleteOrphanedOlderThan(cutoff);
  }
}
