import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { roleHome } from '../../data/navigation';

/**
 * Guards a dashboard route.
 *
 * Demo convenience: opening a dashboard URL with no active session signs the
 * visitor in as that role so every dashboard is reachable in a walkthrough.
 * Replace `quickLogin` with a redirect to /login once real auth is wired up.
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole, quickLogin } = useApp();
  const location = useLocation();
  const wrongRole = isAuthenticated && role && currentRole !== role;

  useEffect(() => {
    if (!isAuthenticated) quickLogin(role);
  }, [isAuthenticated, quickLogin, role]);

  if (wrongRole) return <Navigate to={roleHome[currentRole] || '/app/dashboard'} replace />;
  if (!isAuthenticated) return <Navigate to={location.pathname} replace />;

  return children;
}
