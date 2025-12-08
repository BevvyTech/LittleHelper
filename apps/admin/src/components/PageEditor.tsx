import { useEffect, useState } from 'react';

export interface PageLocaleDetail {
  id: string;
  locale: string;
  title: string;
  slug: string;
  markdownPath: string;
  summary?: string | null;
}

export interface PageDetail {
  page: {
    id: string;
    parentId: string | null;
    headerImage: string | null;
  };
  locales: PageLocaleDetail[];
}

interface PageEditorProps {
  detail: PageDetail | null;
  onSave: (detail: PageDetail) => Promise<void>;
}

export function PageEditor({ detail, onSave }: PageEditorProps) {
  const [activeLocale, setActiveLocale] = useState<string | null>(null);
  const [draft, setDraft] = useState<PageDetail | null>(detail);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(detail);
    setActiveLocale(detail?.locales[0]?.locale ?? null);
  }, [detail]);

  if (!draft || !activeLocale) {
    return (
      <div className="page-editor__empty">
        <p>Select a page to start editing.</p>
      </div>
    );
  }

  const currentLocale = draft.locales.find((l) => l.locale === activeLocale);
  if (!currentLocale) return null;

  const updateLocale = (field: keyof PageLocaleDetail, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        locales: prev.locales.map((loc) =>
          loc.locale === activeLocale ? { ...loc, [field]: value } : loc
        ),
      };
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    setStatus('saving');
    setError(null);
    try {
      await onSave(draft);
      setStatus('saved');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <div className="page-editor">
      <div className="page-editor__header">
        <div>
          <h2>Edit Page</h2>
          <p>Update page metadata and slugs per locale.</p>
        </div>
        <button className="button button--primary" onClick={handleSave}>
          {status === 'saving' ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="page-editor__locales">
        {draft.locales.map((locale) => (
          <button
            key={locale.locale}
            className={`page-editor__locale ${locale.locale === activeLocale ? 'is-active' : ''}`}
            onClick={() => setActiveLocale(locale.locale)}
          >
            {locale.locale.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="page-editor__grid">
        <label className="form-field">
          <span>Title</span>
          <input
            type="text"
            value={currentLocale.title}
            onChange={(e) => updateLocale('title', e.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Slug</span>
          <input
            type="text"
            value={currentLocale.slug}
            onChange={(e) => updateLocale('slug', e.target.value)}
          />
          <small className="muted">Preview: /{currentLocale.locale}/{currentLocale.slug}</small>
        </label>

        <label className="form-field">
          <span>Markdown Path</span>
          <input
            type="text"
            value={currentLocale.markdownPath}
            onChange={(e) => updateLocale('markdownPath', e.target.value)}
          />
        </label>

        <label className="form-field">
          <span>Summary</span>
          <textarea
            rows={3}
            value={currentLocale.summary ?? ''}
            onChange={(e) => updateLocale('summary', e.target.value)}
          />
        </label>
      </div>

      {status === 'error' && <div className="notice notice--error">{error}</div>}
      {status === 'saved' && <div className="notice notice--success">Changes saved.</div>}
    </div>
  );
}
