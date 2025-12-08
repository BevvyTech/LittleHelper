import { useEffect, useState } from 'react';
import { PageTree, type PageTreeNode } from '../components/PageTree.js';
import { PageEditor, type PageDetail } from '../components/PageEditor.js';

export function ContentPage() {
  const [tree, setTree] = useState<PageTreeNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadTree();
  }, []);

  useEffect(() => {
    if (selectedId) {
      void loadDetail(selectedId);
    }
  }, [selectedId]);

  const loadTree = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pages', { credentials: 'include' });
      const data = await response.json();
      setTree(data.data ?? []);
      const firstId = data.data?.[0]?.id ?? null;
      setSelectedId((prev) => prev ?? firstId);
    } catch (error) {
      console.error('Failed to load pages', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pages/${id}`, { credentials: 'include' });
      const data = await response.json();
      setDetail(data.data);
    } catch (error) {
      console.error('Failed to load page', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (draft: PageDetail) => {
    setMessage(null);
    const response = await fetch(`/api/admin/pages/${draft.page.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentId: draft.page.parentId,
        headerImage: draft.page.headerImage,
        locales: draft.locales,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to save page');
    }
    setMessage('Saved changes.');
    await loadTree();
    await loadDetail(draft.page.id);
  };

  return (
    <div className="content-page">
      <div className="content-page__header">
        <div>
          <h1 className="page-title">Content</h1>
          <p className="page-description">Manage your documentation hierarchy and pages.</p>
        </div>
        {message && <div className="notice notice--success">{message}</div>}
      </div>

      <div className="content-layout">
        <aside className="content-sidebar">
          {loading && <p className="muted">Loading...</p>}
          <PageTree nodes={tree} onSelect={setSelectedId} selectedId={selectedId} />
        </aside>
        <section className="content-editor">
          <PageEditor detail={detail} onSave={handleSave} />
        </section>
      </div>
    </div>
  );
}
