import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__section">
          {/* Version selector placeholder */}
          <span className="footer__version">Latest</span>
        </div>

        <div className="footer__section">
          {/* Locale switcher placeholder */}
        </div>

        <div className="footer__section">
          <Link to="/admin" className="footer__link">
            Admin
          </Link>
        </div>

        <div className="footer__copyright">
          &copy; {new Date().getFullYear()} LittleHelper
        </div>
      </div>
    </footer>
  );
}
