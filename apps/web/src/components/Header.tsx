import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@littlehelper/ui';
import { DrawerOverlay } from './DrawerOverlay.js';
import { MobileDrawer } from './MobileDrawer.js';
import { ThemeToggle } from './ThemeToggle.js';

export function Header() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: 'Docs', href: '/' },
    { label: 'Releases', href: '/releases/latest/en' },
    { label: 'About', href: '/about' },
  ];

  return (
    <>
      <header className="header" id="navigation">
        <div className="header__container">
          <Link to="/" className="header__logo">
            LittleHelper
          </Link>

          <div className="header__desktop">
            <nav className="header__nav" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href} className="header__nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="header__actions">
              <div className="header__locale" aria-label="Locale switcher">
                <button className="header__pill" type="button">
                  EN
                </button>
                <button className="header__pill" type="button">
                  ES
                </button>
              </div>
              <ThemeToggle />
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </div>
          </div>

          <div className="header__mobile">
            <button
              className="header__hamburger"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <DrawerOverlay open={isDrawerOpen} onClick={() => setDrawerOpen(false)} />
      <MobileDrawer open={isDrawerOpen} onClose={() => setDrawerOpen(false)} navItems={navItems} />
    </>
  );
}
