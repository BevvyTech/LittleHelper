import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.js';
import { AuthGuard } from './components/AuthGuard.js';

import { AdminLayout } from './layouts/AdminLayout.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ContentPage } from './pages/ContentPage.js';
import { CommentsPage } from './pages/CommentsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { ToolsPage } from './pages/ToolsPage.js';
import { ReleasesPage } from './pages/ReleasesPage.js';
import './styles/global.css';

export function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="content/*" element={<ContentPage />} />
            <Route path="comments" element={<CommentsPage />} />
            <Route path="settings/*" element={<SettingsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="releases" element={<ReleasesPage />} />
            <Route path="tools" element={<ToolsPage />} />
          </Route>
        </Routes>
      </AuthGuard>
    </AuthProvider>
  );
}
