import { Outlet } from 'react-router-dom';

import { Header } from '../components/Header.js';
import { ResponsiveBreadcrumbs } from '../components/ResponsiveBreadcrumbs.js';
import { Footer } from '../components/Footer.js';

export function PublicLayout() {
  return (
    <div className="public-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <ResponsiveBreadcrumbs />
      <main id="main-content" className="public-layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
