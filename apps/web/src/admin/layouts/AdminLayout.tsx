import { Outlet } from 'react-router-dom';
import { useState } from 'react';

import { Sidebar } from '../components/Sidebar.js';
import { TopBar } from '../components/TopBar.js';
import { MobileAdminHeader } from '../components/MobileAdminHeader.js';

export function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-layout__main">
        <MobileAdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <TopBar />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
      {isSidebarOpen && (
        <button
          type="button"
          className="drawer-overlay is-visible"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
}
