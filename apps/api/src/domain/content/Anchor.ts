import { ANCHOR_PREFIX, ANCHOR_HASH_LENGTH } from '@littlehelper/shared';

export interface AnchorProps {
  id: string;
  pageLocaleId: string;
  anchorId: string;
  hash: string;
  index: number;
  orphanedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Anchor {
  readonly id: string;
  readonly pageLocaleId: string;
  readonly anchorId: string;
  readonly hash: string;
  readonly index: number;
  readonly orphanedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: AnchorProps) {
    this.id = props.id;
    this.pageLocaleId = props.pageLocaleId;
    this.anchorId = props.anchorId;
    this.hash = props.hash;
    this.index = props.index;
    this.orphanedAt = props.orphanedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOrphaned(): boolean {
    return this.orphanedAt !== null;
  }

  static generateAnchorId(hash: string): string {
    return `${ANCHOR_PREFIX}${hash.slice(0, ANCHOR_HASH_LENGTH)}`;
  }

  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[*_~`\[\]()#>!|\\]/g, '') // Strip markdown formatting
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^\w\s]/g, ''); // Remove punctuation for hashing
  }

  static async computeHash(pageLocaleId: string, normalizedText: string): Promise<string> {
    const input = `${pageLocaleId}:${normalizedText}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
