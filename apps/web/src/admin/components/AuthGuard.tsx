import { type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Skeleton } from '@littlehelper/ui';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = true }: AuthGuardProps) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-guard-loading">
        <Skeleton width={200} height={24} />
        <Skeleton width={300} height={16} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  if (requireAdmin && !isAdmin) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

function LoginPrompt() {
  const { login } = useAuth();

  return (
    <div className="login-prompt">
      <h1>Sign In Required</h1>
      <p>Please sign in to access the admin console.</p>
      <button onClick={login} className="button button--primary">
        Sign in with Google
      </button>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="access-denied">
      <h1>Access Denied</h1>
      <p>You need admin privileges to access this area.</p>
      <a href="/">Return to Home</a>
    </div>
  );
}
