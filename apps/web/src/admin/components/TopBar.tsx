import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { ThemeToggle } from './ThemeToggle.js';

export function TopBar() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar__search">
        {/* Search placeholder */}
      </div>

      <div className="topbar__actions">
        <ThemeToggle />
        <div className="topbar__user">
          <button className="topbar__user-button" onClick={() => setShowMenu(!showMenu)}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="topbar__avatar" />
            ) : (
              <div className="topbar__avatar-placeholder">
                {user?.name?.[0] ?? user?.email[0]}
              </div>
            )}
            <span className="topbar__user-name">{user?.name ?? user?.email}</span>
          </button>

          {showMenu && (
            <div className="topbar__menu">
              <div className="topbar__menu-header">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <hr />
              <button onClick={logout} className="topbar__menu-item">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
