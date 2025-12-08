export interface CommentThreadProps {
  id: string;
  pageLocaleId: string;
  anchorId: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CommentThread {
  readonly id: string;
  readonly pageLocaleId: string;
  readonly anchorId: string;
  readonly createdById: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CommentThreadProps) {
    this.id = props.id;
    this.pageLocaleId = props.pageLocaleId;
    this.anchorId = props.anchorId;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
