import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type Crumb = { label: string; href: string };

export function ResponsiveBreadcrumbs() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const items = useMemo<Crumb[]>(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const parts: Crumb[] = [{ label: 'Home', href: '/' }];

    let path = '';
    segments.forEach((segment) => {
      path += `/${segment}`;
      const label = segment.replace(/-/g, ' ');
      parts.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: path });
    });

    return parts;
  }, [location.pathname]);

  if (items.length <= 1) return null;

  const mobileCollapsed =
    !expanded && items.length > 3
      ? [items[0], { label: '...', href: '#' }, ...items.slice(-2)]
      : items;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {mobileCollapsed.map((item, index) => {
          const isLast = index === mobileCollapsed.length - 1;
          const isEllipsis = item.label === '...';

          if (isEllipsis) {
            return (
              <li key={`ellipsis-${index}`} className="breadcrumbs__item">
                <button
                  type="button"
                  className="breadcrumbs__ellipsis"
                  onClick={() => setExpanded(true)}
                  aria-label="Show full breadcrumb"
                >
                  ...
                </button>
              </li>
            );
          }

          return (
            <li key={item.href} className="breadcrumbs__item">
              {isLast ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link to={item.href}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
