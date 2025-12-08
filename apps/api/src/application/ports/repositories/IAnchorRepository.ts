import { type Anchor } from '../../../domain/content/index.js';

export interface UpsertAnchorData {
  pageLocaleId: string;
  anchorId: string;
  hash: string;
  index: number;
}

export interface IAnchorRepository {
  findByPageLocaleId(pageLocaleId: string): Promise<Anchor[]>;
  findByHash(pageLocaleId: string, hash: string): Promise<Anchor | null>;
  upsertMany(anchors: UpsertAnchorData[]): Promise<Anchor[]>;
  markOrphaned(pageLocaleId: string, activeAnchorIds: string[]): Promise<void>;
  deleteOrphanedOlderThan(cutoff: Date): Promise<number>;
}
