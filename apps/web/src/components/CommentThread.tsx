import { CommentItem } from './CommentItem.js';

interface CommentThreadProps {
  comments: Array<{ id: string; authorId: string | null; body: string; createdAt: string }>;
  onDelete: (id: string) => void;
}

export function CommentThread({ comments, onDelete }: CommentThreadProps) {
  if (comments.length === 0) {
    return <p className="muted">Be the first to comment.</p>;
  }

  return (
    <div className="comment-thread">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          body={comment.body}
          authorId={comment.authorId}
          createdAt={comment.createdAt}
          onDelete={() => onDelete(comment.id)}
        />
      ))}
    </div>
  );
}
