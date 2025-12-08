export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-description">
        Welcome to the LittleHelper admin console.
      </p>

      <div className="dashboard-page__cards">
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Pages</h3>
          <p className="dashboard-card__value">--</p>
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Comments</h3>
          <p className="dashboard-card__value">--</p>
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Users</h3>
          <p className="dashboard-card__value">--</p>
        </div>
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Releases</h3>
          <p className="dashboard-card__value">--</p>
        </div>
      </div>
    </div>
  );
}
