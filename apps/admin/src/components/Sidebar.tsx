import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/content', label: 'Content', icon: '📄' },
  { to: '/comments', label: 'Comments', icon: '💬' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/releases', label: 'Releases', icon: '🏷️' },
  { to: '/tools', label: 'Tools', icon: '🔧' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar__header">
        <a href="/" className="sidebar__logo">
          LittleHelper
        </a>
        <span className="sidebar__badge">Admin</span>
        <button className="sidebar__close" onClick={onClose} aria-label="Close navigation">
          ✕
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={item.label}
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <a href="/" className="sidebar__back-link">
          ← Back to Site
        </a>
      </div>
    </aside>
  );
}
