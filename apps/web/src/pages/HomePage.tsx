import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="page-shell home-page">
      <section className="hero">
        <div className="hero__grid">
          <div className="hero__content">
            <span className="pill pill--accent">Docs + Admin in one place</span>
            <h1 className="hero__title">LittleHelper keeps your docs live, versioned, and discussable.</h1>
            <p className="hero__subtitle">
              Publish multi-language help pages, capture paragraph-level feedback, and manage releases without leaving the same interface.
            </p>
            <div className="hero__actions">
              <Link to="/en/getting-started" className="button button--primary">
                Browse documentation
              </Link>
              <Link to="/admin/dashboard" className="button button--secondary">
                Open admin console
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <strong>Multi-language</strong>
                <span>Locale-specific pages with shared structure</span>
              </div>
              <div className="hero__stat">
                <strong>Release ready</strong>
                <span>Serve latest or tagged versions with badges</span>
              </div>
              <div className="hero__stat">
                <strong>Inline feedback</strong>
                <span>Anchored comments per paragraph</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card-grid">
        <article className="card">
          <div className="card__title">Getting Started</div>
          <p className="card__desc">
            Learn the basics, set up locales, and structure your first docs tree with clean slugs and breadcrumbs.
          </p>
          <Link to="/en/getting-started" className="button button--secondary">
            Start guide
          </Link>
        </article>
        <article className="card">
          <div className="card__title">Content & Sync</div>
          <p className="card__desc">
            Connect GitHub, edit Markdown, and commit changes directly from LittleHelper—no context switching.
          </p>
          <Link to="/admin/content" className="button button--secondary">
            Manage content
          </Link>
        </article>
        <article className="card">
          <div className="card__title">Releases & SEO</div>
          <p className="card__desc">
            Tag releases, surface version badges, and let Gemini generate summaries and keywords you can lock in place.
          </p>
          <Link to="/admin/releases" className="button button--secondary">
            View releases
          </Link>
        </article>
      </section>

      <section className="panel">
        <div className="panel__title">What makes LittleHelper different?</div>
        <ul className="panel__list">
          <li>
            <span className="panel__badge">1</span>
            Hybrid Git + DB model keeps Markdown in sync with anchors, redirects, and comments.
          </li>
          <li>
            <span className="panel__badge">2</span>
            Admin console lives under <code>/admin</code>, sharing the same design system as public docs.
          </li>
          <li>
            <span className="panel__badge">3</span>
            Responsive, accessible layouts with sticky header, truncated breadcrumbs, and mobile-ready tables.
          </li>
        </ul>
      </section>
    </div>
  );
}
