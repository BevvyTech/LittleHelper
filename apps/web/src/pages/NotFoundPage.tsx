import { Link } from 'react-router-dom';

import { Button } from '@littlehelper/ui';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1 className="not-found-page__title">404</h1>
      <p className="not-found-page__message">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
