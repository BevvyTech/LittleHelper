interface CommentItemProps {
  body: string;
  authorId: string | null;
  createdAt: string;
  onDelete?: () => void;
}

export function CommentItem({ body, authorId, createdAt, onDelete }: CommentItemProps) {
  return (
    <div className="comment-item">
      <div className="comment-item__meta">
        <span className="comment-item__author">{authorId ?? 'Anonymous'}</span>
        <span className="comment-item__date">{new Date(createdAt).toLocaleString()}</span>
        {onDelete && (
          <button className="comment-item__delete" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
      <p className="comment-item__body">{body}</p>
    </div>
  );
}
