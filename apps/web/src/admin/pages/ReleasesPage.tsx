import { useEffect, useMemo, useState } from 'react';
import { Button, Input } from '@littlehelper/ui';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { Badge } from '../components/Badge.js';

interface Release {
  id: string;
  tag: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

export function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTag, setDeleteTag] = useState<string | null>(null);
  const [form, setForm] = useState({ tag: '', name: '', description: '' });
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      releases.filter(
        (r) =>
          r.tag.toLowerCase().includes(filter.toLowerCase()) ||
          r.name.toLowerCase().includes(filter.toLowerCase())
      ),
    [releases, filter]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/releases');
        const data = await res.json();
        setReleases(data.data ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    void load();
  }, []);

  const createRelease = async () => {
    if (!form.tag || !/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(form.tag)) {
      setError('Tag must be alphanumeric with hyphens or dots.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: form.tag,
          name: form.name || form.tag,
          description: form.description || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create release');
      const data = await res.json();
      setReleases((prev) => [data.data, ...prev]);
      setShowCreate(false);
      setForm({ tag: '', name: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create release');
    } finally {
      setCreating(false);
    }
  };

  const deleteRelease = async (tag: string) => {
    try {
      await fetch(`/api/admin/releases/${tag}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setReleases((prev) => prev.filter((r) => r.tag !== tag));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTag(null);
    }
  };

  return (
    <div className="releases-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Releases</h1>
          <p className="page-description">Manage documentation releases and tags.</p>
        </div>
        <div className="releases-page__actions">
          <Input
            placeholder="Filter by tag or name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button onClick={() => setShowCreate(true)}>Create Release</Button>
        </div>
      </div>

      <div className="card">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Name</th>
              <th>Description</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((release) => (
              <tr key={release.id}>
                <td data-label="Tag">
                  <Badge variant="accent">{release.tag}</Badge>
                </td>
                <td data-label="Name">{release.name}</td>
                <td data-label="Description">{release.description ?? '—'}</td>
                <td data-label="Created">{new Date(release.createdAt).toLocaleString()}</td>
                <td data-label="Actions">
                  <Button variant="danger" size="sm" onClick={() => setDeleteTag(release.tag)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No releases yet.</div>}
      </div>

      <ConfirmModal
        open={showCreate}
        title="Create Release"
        onCancel={() => setShowCreate(false)}
        onConfirm={createRelease}
        confirmLabel={creating ? 'Creating...' : 'Create'}
      >
        <div className="form-field">
          <label>Tag *</label>
          <Input
            value={form.tag}
            onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
            placeholder="v1.0.0"
          />
        </div>
        <div className="form-field">
          <label>Name *</label>
          <Input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Release v1.0.0"
          />
        </div>
        <div className="form-field">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>
        {error && <div className="notice notice--error">{error}</div>}
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(deleteTag)}
        title="Delete release?"
        description="This removes the DB record but keeps the Git tag."
        onCancel={() => setDeleteTag(null)}
        onConfirm={() => deleteTag && deleteRelease(deleteTag)}
        destructive
        confirmLabel="Delete"
      />
    </div>
  );
}
