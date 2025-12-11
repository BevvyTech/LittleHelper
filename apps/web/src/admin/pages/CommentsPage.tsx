import { useEffect, useState } from 'react';

interface AdminComment {
  id: string;
  body: string;
  authorId: string | null;
  createdAt: string;
  threadId: string;
}

export function CommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/comments', { credentials: 'include' });
        const data = await res.json();
        setComments(data.data.comments ?? []);
      } catch (error) {
        console.error('Failed to load comments', error);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="comments-page">
      <h1 className="page-title">Comments</h1>
      <p className="page-description">Moderate user comments across all pages.</p>

      {isLoading ? (
        <p className="muted">Loading comments...</p>
      ) : (
        <div className="card">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Excerpt</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td data-label="Author">{comment.authorId ?? 'Anonymous'}</td>
                  <td data-label="Excerpt">
                    {comment.body.slice(0, 80)}
                    {comment.body.length > 80 ? '...' : ''}
                  </td>
                  <td data-label="Date">{new Date(comment.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {comments.length === 0 && <div className="empty-state">No comments yet.</div>}
        </div>
      )}
    </div>
  );
}
