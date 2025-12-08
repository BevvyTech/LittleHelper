import { useEffect, useState } from 'react';

interface ThreadData {
  thread: { id: string; anchorId: string; pageLocaleId: string };
  comments: Array<{
    id: string;
    authorId: string | null;
    body: string;
    createdAt: string;
  }>;
}

export function useCommentThread(anchorId: string | null, pageLocaleId: string | null) {
  const [data, setData] = useState<ThreadData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = () => {
    if (!anchorId) return;
    setIsLoading(true);
    fetch(`/api/comments/thread/${anchorId}`)
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorId]);

  const addComment = async (body: string) => {
    if (!anchorId || !pageLocaleId) return;
    const response = await fetch('/api/comments', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anchorId, pageLocaleId, body }),
    });
    if (!response.ok) {
      throw new Error('Failed to post comment');
    }
    const json = await response.json();
    const newComment = json.data.comment;
    setData((prev) =>
      prev
        ? { thread: json.data.thread ?? prev.thread, comments: [...prev.comments, newComment] }
        : json.data
    );
  };

  const deleteComment = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: 'DELETE', credentials: 'include' });
    setData((prev) =>
      prev ? { ...prev, comments: prev.comments.filter((c) => c.id !== id) } : prev
    );
  };

  return { data, isLoading, addComment, deleteComment, reload: load };
}
