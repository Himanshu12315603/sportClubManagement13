import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { roleHome } from '../../data/navigation';

/**
<<<<<<< HEAD
 * Guards a dashboard route based on user authentication and permissions.
=======
 * Guards a dashboard route.
 * Redirects unauthenticated users directly to /login.
>>>>>>> origin/feature/frontendshaivya
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole } = useApp();
  const location = useLocation();

<<<<<<< HEAD
  const isRoleAuthorized = (userRole, targetRole) => {
    if (!targetRole) return true;
    if (userRole === targetRole) return true;
    if (targetRole === 'customer') {
      return ['member', 'visitor', 'customer'].includes(userRole);
    }
    if (targetRole === 'manager') {
      return ['manager', 'receptionist', 'coach', 'accountant', 'super_admin', 'owner'].includes(userRole);
    }
    if (targetRole === 'admin') {
      return ['admin', 'super_admin', 'owner'].includes(userRole);
    }
    return false;
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && !isRoleAuthorized(currentRole, role)) {
    const destination = roleHome[currentRole] || '/app/dashboard';
    return <Navigate to={destination} replace />;
=======
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const wrongRole = role && currentRole !== role;
  if (wrongRole) {
    return <Navigate to={roleHome[currentRole] || '/app/dashboard'} replace />;
>>>>>>> origin/feature/frontendshaivya
  }

  return children;
}
