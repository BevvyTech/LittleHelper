import { useState } from 'react';

interface CommentComposerProps {
  onSubmit: (body: string) => Promise<void>;
  isAuthenticated: boolean;
}

export function CommentComposer({ onSubmit, isAuthenticated }: CommentComposerProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to comment.');
      return;
    }
    if (!body.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(body.trim());
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-composer">
      <textarea
        placeholder={isAuthenticated ? 'Write a comment...' : 'Sign in to comment'}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={!isAuthenticated || isSubmitting}
      />
      <div className="comment-composer__actions">
        <button onClick={handleSubmit} disabled={isSubmitting || !body.trim()}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
        {error && <span className="comment-composer__error">{error}</span>}
      </div>
    </div>
  );
}
