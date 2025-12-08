export interface CommentProps {
  id: string;
  threadId: string;
  authorId: string | null;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment {
  readonly id: string;
  readonly threadId: string;
  readonly authorId: string | null;
  readonly body: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  static readonly MIN_BODY_LENGTH = 1;
  static readonly MAX_BODY_LENGTH = 5000;

  constructor(props: CommentProps) {
    this.id = props.id;
    this.threadId = props.threadId;
    this.authorId = props.authorId;
    this.body = props.body;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isAuthoredBy(userId: string): boolean {
    return this.authorId === userId;
  }

  canBeDeletedBy(userId: string, isAdmin: boolean): boolean {
    return this.isAuthoredBy(userId) || isAdmin;
  }

  static validateBody(body: string): { valid: boolean; error?: string } {
    if (body.length < Comment.MIN_BODY_LENGTH) {
      return { valid: false, error: 'Comment body is required' };
    }
    if (body.length > Comment.MAX_BODY_LENGTH) {
      return { valid: false, error: `Comment body must be at most ${Comment.MAX_BODY_LENGTH} characters` };
    }
    return { valid: true };
  }
}
