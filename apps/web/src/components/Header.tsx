import { useState } from 'react';
import { Link } from 'react-router-dom';

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
        <div className="container header__container">
          <Link to="/" className="header__brand">
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

            <div className="header__search" role="search">
              <input type="search" name="q" placeholder="Search documentation" aria-label="Search" />
            </div>

            <div className="header__actions">
              <button className="header__pill" type="button" aria-label="Switch locale">
                EN ▼
              </button>
              <ThemeToggle />
              <Link to="/admin/login" className="header__login">
                Sign In
              </Link>
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
