import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle.js';

type NavItem = { label: string; href: string };

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems?: NavItem[];
}

export function MobileDrawer({ open, onClose, navItems = [] }: MobileDrawerProps) {
  return (
    <div className={`mobile-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="mobile-drawer__header">
        <span className="mobile-drawer__title">Menu</span>
        <button className="mobile-drawer__close" onClick={onClose} aria-label="Close menu">
          X
        </button>
      </div>

      <nav className="mobile-drawer__nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="mobile-drawer__link"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mobile-drawer__section">
        <div className="mobile-drawer__label">Theme & Shape</div>
        <ThemeToggle />
      </div>

      <div className="mobile-drawer__section">
        <div className="mobile-drawer__label">Locale</div>
        <button className="mobile-drawer__pill" type="button">
          EN
        </button>
        <button className="mobile-drawer__pill" type="button">
          ES
        </button>
      </div>

      <div className="mobile-drawer__footer">
        <Link to="/admin" className="mobile-drawer__cta" onClick={onClose}>
          Sign In
        </Link>
      </div>
    </div>
  );
}
