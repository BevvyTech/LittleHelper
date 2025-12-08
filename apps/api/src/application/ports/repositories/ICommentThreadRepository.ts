import { type CommentThread } from '../../../domain/comments/index.js';

export interface ICommentThreadRepository {
  findById(id: string): Promise<CommentThread | null>;
  findByAnchorId(anchorId: string): Promise<CommentThread | null>;
  findByPageLocaleId(pageLocaleId: string): Promise<CommentThread[]>;
  create(data: { pageLocaleId: string; anchorId: string; createdById: string | null }): Promise<CommentThread>;
}
