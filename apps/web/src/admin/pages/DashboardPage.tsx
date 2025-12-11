export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="pill pill--accent">Admin overview</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Operate content, comments, releases, and settings without leaving the shared interface.
          </p>
        </div>
        <div className="page-actions">
          <button className="header__login" type="button">
            New page
          </button>
          <button className="header__pill" type="button">
            Trigger sync
          </button>
        </div>
      </div>

      <div className="dashboard-page__cards">
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Pages</h3>
          <p className="dashboard-card__value">—</p>
          <span className="dashboard-card__meta">Docs tree</span>
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Comments</h3>
          <p className="dashboard-card__value">—</p>
          <span className="dashboard-card__meta">Paragraph feedback</span>
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Users</h3>
          <p className="dashboard-card__value">—</p>
          <span className="dashboard-card__meta">Active accounts</span>
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Releases</h3>
          <p className="dashboard-card__value">—</p>
          <span className="dashboard-card__meta">Tags ready</span>
        </div>
      </div>
    </div>
  );
}
