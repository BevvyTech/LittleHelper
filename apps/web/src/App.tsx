import { Routes, Route } from 'react-router-dom';

import { PublicLayout } from './layouts/PublicLayout.js';
import { HomePage } from './pages/HomePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { ReleasePage } from './pages/ReleasePage.js';

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/:locale/:slug/*" element={<div>Page placeholder</div>} />
        <Route path="/releases/:tag/:locale/:slug/*" element={<ReleasePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
