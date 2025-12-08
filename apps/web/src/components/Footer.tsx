import { Link, useLocation } from 'react-router-dom';
import { VersionSelector } from './VersionSelector.js';

export function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isReleaseRoute = pathParts[0] === 'releases';
  const [currentTag, currentLocale, currentSlug] = isReleaseRoute
    ? [pathParts[1], pathParts[2], pathParts.slice(3).join('/')]
    : [undefined, pathParts[0] ?? 'en', pathParts.slice(1).join('/') || ''];

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__nav">
          <Link to="/" className="footer__link">
            Docs
          </Link>
          <Link to="/releases/latest/en" className="footer__link">
            Releases
          </Link>
          <Link to="/about" className="footer__link">
            About
          </Link>
          <Link to="https://github.com" className="footer__link">
            GitHub
          </Link>
          <Link to="/contact" className="footer__link">
            Contact
          </Link>
        </div>

        {currentSlug && (
          <div className="footer__selector">
            <VersionSelector
              currentLocale={currentLocale}
              currentSlug={currentSlug}
              currentTag={currentTag}
            />
          </div>
        )}

        <div className="footer__copyright">
          &copy; {year} LittleHelper
        </div>
      </div>
    </footer>
  );
}
