export function HomePage() {
  return (
    <div className="home-page">
      <div className="home-page__hero">
        <h1 className="home-page__title">Welcome to LittleHelper</h1>
        <p className="home-page__subtitle">
          Your documentation hub for all things helpful.
        </p>
      </div>

      <div className="home-page__content">
        <section className="home-page__section">
          <h2>Getting Started</h2>
          <p>
            Browse our documentation to learn more about our products and services.
          </p>
        </section>
      </div>
    </div>
  );
}
