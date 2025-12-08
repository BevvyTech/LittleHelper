export interface PageProps {
  id: string;
  shortId: string;
  parentId: string | null;
  headerImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Page {
  readonly id: string;
  readonly shortId: string;
  readonly parentId: string | null;
  readonly headerImage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: PageProps) {
    this.id = props.id;
    this.shortId = props.shortId;
    this.parentId = props.parentId;
    this.headerImage = props.headerImage;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isRoot(): boolean {
    return this.parentId === null;
  }

  static generateShortId(cuid: string): string {
    return cuid.slice(0, 8);
  }
}
