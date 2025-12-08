import { Button } from '@littlehelper/ui';

export function ToolsPage() {
  return (
    <div className="tools-page">
      <h1 className="page-title">Admin Tools</h1>
      <p className="page-description">
        Administrative actions and maintenance tools.
      </p>

      <div className="tools-page__grid">
        <div className="tools-card">
          <h3 className="tools-card__title">Manual Sync</h3>
          <p className="tools-card__description">
            Trigger a manual sync from the GitHub repository.
          </p>
          <Button variant="secondary" disabled>
            Trigger Sync
          </Button>
        </div>

        <div className="tools-card">
          <h3 className="tools-card__title">Clear Cache</h3>
          <p className="tools-card__description">
            Clear the content and redirect cache.
          </p>
          <Button variant="secondary" disabled>
            Clear Cache
          </Button>
        </div>

        <div className="tools-card">
          <h3 className="tools-card__title">Regenerate Anchors</h3>
          <p className="tools-card__description">
            Regenerate paragraph anchors for all pages.
          </p>
          <Button variant="secondary" disabled>
            Regenerate
          </Button>
        </div>

        <div className="tools-card">
          <h3 className="tools-card__title">Bulk SEO Generation</h3>
          <p className="tools-card__description">
            Generate SEO metadata for all pages using Gemini.
          </p>
          <Button variant="secondary" disabled>
            Generate All
          </Button>
        </div>
      </div>
    </div>
  );
}
