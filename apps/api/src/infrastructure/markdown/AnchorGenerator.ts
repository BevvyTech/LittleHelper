import { Anchor } from '../../domain/content/Anchor.js';

export interface GeneratedAnchor {
  hash: string;
  anchorId: string;
  index: number;
  normalizedText: string;
}

export class AnchorGenerator {
  async generate(pageLocaleId: string, blocks: Array<{ content: string; position: number }>): Promise<GeneratedAnchor[]> {
    const anchors: GeneratedAnchor[] = [];

    for (const block of blocks) {
      const normalizedText = Anchor.normalizeText(block.content);
      if (!normalizedText) continue;
      const hash = await Anchor.computeHash(pageLocaleId, normalizedText);
      anchors.push({
        hash,
        anchorId: Anchor.generateAnchorId(hash),
        index: block.position,
        normalizedText,
      });
    }

    return anchors;
  }
}
