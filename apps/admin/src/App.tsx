import { Routes, Route, Navigate } from 'react-router-dom';

import { AdminLayout } from './layouts/AdminLayout.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ContentPage } from './pages/ContentPage.js';
import { CommentsPage } from './pages/CommentsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { ToolsPage } from './pages/ToolsPage.js';

export function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/content/*" element={<ContentPage />} />
        <Route path="/comments" element={<CommentsPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/tools" element={<ToolsPage />} />
      </Route>
    </Routes>
  );
}
