import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReleaseBadge } from '../components/ReleaseBadge.js';
import { ReleaseNoticeBanner } from '../components/ReleaseNoticeBanner.js';
import { VersionSelector } from '../components/VersionSelector.js';

interface ReleasePayload {
  release: { tag: string; name: string; description?: string | null };
  snapshot: { slugAtRelease: string; titleAtRelease: string };
  pageLocale: { locale: string; slug: string; title: string };
  content: string;
}

export function ReleasePage() {
  const params = useParams();
  const navigate = useNavigate();
  const tag = params.tag ?? '';
  const locale = params.locale ?? 'en';
  const slug = (params['*'] ?? '').replace(/^\/+|\/+$/g, '');

  const [data, setData] = useState<ReleasePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/releases/${tag}/${locale}/${slug}`);
        if (!res.ok) {
          throw new Error(`Failed to load release ${tag}`);
        }
        const body = await res.json();
        setData(body.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load release');
      } finally {
        setLoading(false);
      }
    };
    if (tag && slug) {
      void load();
    }
  }, [tag, locale, slug]);

  if (loading) {
    return <p className="muted">Loading release content...</p>;
  }

  if (error || !data) {
    return (
      <div className="notice notice--error">
        {error ?? 'Release not found.'}
        <div>
          <button className="header__pill" onClick={() => navigate(`/${locale}/${slug}`)}>
            Back to latest
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="release-page page-shell">
      <ReleaseNoticeBanner tag={data.release.tag} onBackToLatest={() => navigate(`/${locale}/${slug}`)} />
      <header className="release-page__header">
        <div>
          <ReleaseBadge tag={data.release.tag} />
          <h1>{data.snapshot.titleAtRelease ?? data.pageLocale.title}</h1>
          {data.release.description && <p className="muted">{data.release.description}</p>}
        </div>
        <VersionSelector currentLocale={locale} currentSlug={slug} currentTag={data.release.tag} />
      </header>
      <section className="release-page__content">
        <pre className="release-content">{data.content}</pre>
      </section>
    </article>
  );
}
