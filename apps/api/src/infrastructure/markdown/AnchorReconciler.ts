import { type Anchor } from '../../domain/content/Anchor.js';
import { type GeneratedAnchor } from './AnchorGenerator.js';

export interface ReconcileResult {
  upserts: Array<{ pageLocaleId: string; anchorId: string; hash: string; index: number }>;
  activeAnchorIds: string[];
  orphanedHashes: string[];
}

export class AnchorReconciler {
  reconcile(
    pageLocaleId: string,
    existing: Anchor[],
    generated: GeneratedAnchor[]
  ): ReconcileResult {
    const existingByHash = new Map(existing.map((a) => [a.hash, a]));
    const upserts: ReconcileResult['upserts'] = [];
    const activeAnchorIds: string[] = [];
    const usedHashes = new Set<string>();

    for (const gen of generated) {
      const match = existingByHash.get(gen.hash);
      const anchorId = match ? match.anchorId : gen.anchorId;
      upserts.push({
        pageLocaleId,
        anchorId,
        hash: gen.hash,
        index: gen.index,
      });
      activeAnchorIds.push(anchorId);
      usedHashes.add(gen.hash);
    }

    const orphanedHashes = existing
      .filter((a) => !usedHashes.has(a.hash))
      .map((a) => a.hash);

    return { upserts, activeAnchorIds, orphanedHashes };
  }
}
