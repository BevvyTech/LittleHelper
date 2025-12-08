import { CommentThread } from './CommentThread.js';
import { CommentComposer } from './CommentComposer.js';

interface CommentDrawerProps {
  anchorId: string | null;
  pageLocaleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  comments: Array<{ id: string; authorId: string | null; body: string; createdAt: string }>;
  onAdd: (body: string) => Promise<void>;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
}

export function CommentDrawer({
  anchorId,
  pageLocaleId,
  isOpen,
  onClose,
  comments,
  onAdd,
  onDelete,
  isAuthenticated,
}: CommentDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="comment-drawer">
      <div className="comment-drawer__header">
        <h3>Comments</h3>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="comment-drawer__body">
        <CommentThread comments={comments} onDelete={onDelete} />
      </div>
      <CommentComposer onSubmit={onAdd} isAuthenticated={isAuthenticated} />
    </div>
  );
}
