import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { roleHome } from '../../data/navigation';

/**
 * Guards a dashboard route based on user authentication and permissions.
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole } = useApp();
  const location = useLocation();

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
  }

  return children;
}
