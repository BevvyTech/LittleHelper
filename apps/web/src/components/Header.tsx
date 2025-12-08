import { Link } from 'react-router-dom';

import { Button } from '@littlehelper/ui';

export function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          LittleHelper
        </Link>

        <nav className="header__nav">
          <div className="header__search">
            {/* Search placeholder - future hook */}
          </div>

          <div className="header__actions">
            {/* Locale switcher placeholder */}
            {/* Theme toggle placeholder */}
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
