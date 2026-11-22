import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppProvider } from './frontend/context/AppContext';
import ToastHost from './frontend/components/ui/ToastHost';
import PublicLayout from './frontend/components/layout/PublicLayout';
import DashboardLayout from './frontend/components/layout/DashboardLayout';
import ProtectedRoute from './frontend/components/layout/ProtectedRoute';

/* Public */
import Home from './frontend/pages/public/Home';
import FacilitiesPage from './frontend/pages/public/FacilitiesPage';
import MembershipPage from './frontend/pages/public/MembershipPage';
import AboutPage from './frontend/pages/public/AboutPage';
import PublicShop from './frontend/pages/public/PublicShop';
import CafeteriaPage from './frontend/pages/public/CafeteriaPage';
import Login from './frontend/pages/public/Login';
import Register from './frontend/pages/public/Register';
import Trial from './frontend/pages/public/Trial';
import NotFound from './frontend/pages/public/NotFound';

/* Customer */
import CustomerDashboard from './frontend/pages/customer/Dashboard';
import MyGarden from './frontend/pages/customer/MyGarden';
import MyMembership from './frontend/pages/customer/MyMembership';
import Bookings from './frontend/pages/customer/Bookings';
import Shop from './frontend/pages/customer/Shop';
import Cafe from './frontend/pages/customer/Cafe';
import AiAssistant from './frontend/pages/customer/AiAssistant';
import Notifications from './frontend/pages/customer/Notifications';
import Profile from './frontend/pages/customer/Profile';

/* Manager */
import ManagerOverview from './frontend/pages/manager/Overview';
import ManagerMembers from './frontend/pages/manager/Members';
import ManagerCourts from './frontend/pages/manager/Courts';
import ManagerBookings from './frontend/pages/manager/Bookings';
import ManagerMemberships from './frontend/pages/manager/Memberships';
import ManagerTrials from './frontend/pages/manager/Trials';
import ManagerShop from './frontend/pages/manager/Shop';
import ManagerCafeteria from './frontend/pages/manager/Cafeteria';
import ManagerStaff from './frontend/pages/manager/Staff';
import ManagerFinance from './frontend/pages/manager/Finance';
import ManagerAi from './frontend/pages/manager/AiInsights';

/* Admin */
import AdminOverview from './frontend/pages/admin/Overview';
import AdminManagers from './frontend/pages/admin/Managers';
import AdminStaff from './frontend/pages/admin/StaffAccounts';
import AdminRoles from './frontend/pages/admin/Roles';
import AdminReports from './frontend/pages/admin/Reports';
import AdminAudit from './frontend/pages/admin/Audit';
import AdminSettings from './frontend/pages/admin/Settings';
import AdminNotifications from './frontend/pages/admin/Notifications';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ------------------------------ Public ------------------------------ */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/shop" element={<PublicShop />} />
            <Route path="/cafeteria" element={<CafeteriaPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trial" element={<Trial />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ----------------------------- Customer ----------------------------- */}
          <Route
            path="/app"
            element={
              <ProtectedRoute role="customer">
                <DashboardLayout variant="customer" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="garden" element={<MyGarden />} />
            <Route path="membership" element={<MyMembership />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="shop" element={<Shop />} />
            <Route path="cafe" element={<Cafe />} />
            <Route path="ai" element={<AiAssistant />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ------------------------------ Manager ----------------------------- */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute role="manager">
                <DashboardLayout variant="manager" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/manager/overview" replace />} />
            <Route path="overview" element={<ManagerOverview />} />
            <Route path="members" element={<ManagerMembers />} />
            <Route path="courts" element={<ManagerCourts />} />
            <Route path="bookings" element={<ManagerBookings />} />
            <Route path="memberships" element={<ManagerMemberships />} />
            <Route path="trials" element={<ManagerTrials />} />
            <Route path="shop" element={<ManagerShop />} />
            <Route path="cafeteria" element={<ManagerCafeteria />} />
            <Route path="staff" element={<ManagerStaff />} />
            <Route path="finance" element={<ManagerFinance />} />
            <Route path="ai" element={<ManagerAi />} />
          </Route>

          {/* ------------------------------- Staff ------------------------------ */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute role="staff">
                <DashboardLayout variant="staff" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/bookings" replace />} />
            <Route path="bookings" element={<ManagerBookings />} />
            <Route path="courts" element={<ManagerCourts />} />
            <Route path="cafeteria" element={<ManagerCafeteria />} />
            <Route path="shop" element={<ManagerShop />} />
            <Route path="members" element={<ManagerMembers />} />
            <Route path="trials" element={<ManagerTrials />} />
          </Route>

          {/* ------------------------------- Admin ------------------------------ */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <DashboardLayout variant="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="managers" element={<AdminManagers />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="members" element={<ManagerMembers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
        <ToastHost />
      </BrowserRouter>
    </AppProvider>
  );
}
