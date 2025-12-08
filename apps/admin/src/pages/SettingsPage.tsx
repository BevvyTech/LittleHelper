import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { ContentSourceSettings } from './settings/ContentSourceSettings.js';
import { AiSettings as AiSettingsPanel } from './settings/AiSettings.js';
import { StorageSettings as StorageSettingsPanel } from './settings/StorageSettings.js';

const settingsTabs = [
  { to: '/settings/general', label: 'General' },
  { to: '/settings/content-source', label: 'Content Source' },
  { to: '/settings/storage', label: 'Storage' },
  { to: '/settings/ai', label: 'AI Integrations' },
];

export function SettingsPage() {
  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>

      <nav className="settings-page__tabs">
        {settingsTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `settings-tab ${isActive ? 'settings-tab--active' : ''}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="settings-page__content">
        <Routes>
          <Route index element={<Navigate to="general" replace />} />
          <Route path="general" element={<GeneralSettings />} />
          <Route path="content-source" element={<ContentSourceSettings />} />
          <Route path="storage" element={<StorageSettings />} />
          <Route path="ai" element={<AiSettings />} />
        </Routes>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="settings-section">
      <h2>General Settings</h2>
      <p>Configure general site settings.</p>
    </div>
  );
}

function StorageSettings() {
  return <StorageSettingsPanel />;
}

function AiSettings() {
  return <AiSettingsPanel />;
}
