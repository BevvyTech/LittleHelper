import { useEffect, useState } from 'react';

export interface Comment {
  id: string;
  threadId: string;
  authorId: string | null;
  body: string;
  createdAt: string;
}

export interface CommentThreadData {
  thread: { id: string; anchorId: string; pageLocaleId: string };
  comments: Comment[];
}

export function useComments(pageLocaleId: string) {
  const [threads, setThreads] = useState<CommentThreadData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = () => {
    if (!pageLocaleId) return;
    setIsLoading(true);
    fetch(`/api/pages/${pageLocaleId}/comments`)
      .then((res) => res.json())
      .then((data) => setThreads(data.data ?? []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLocaleId]);

  const getCountForAnchor = (anchorId: string) => {
    return (
      threads.find((t) => t.thread.anchorId === anchorId)?.comments.length ?? 0
    );
  };

  return { threads, isLoading, getCountForAnchor, reload: load };
}
