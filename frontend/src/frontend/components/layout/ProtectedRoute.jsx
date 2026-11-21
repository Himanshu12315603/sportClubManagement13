import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { roleHome } from '../../data/navigation';

/**
 * Guards a dashboard route.
 * Redirects unauthenticated users directly to /login.
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const wrongRole = role && currentRole !== role;
  if (wrongRole) {
    return <Navigate to={roleHome[currentRole] || '/app/dashboard'} replace />;
  }

  return children;
}
