/** Sidebar navigation maps for the three authenticated roles. */

export const customerNav = [
  {
    group: 'My Club',
    items: [
      { to: '/app/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { to: '/app/garden', label: 'My Garden', icon: 'Sprout' },
      { to: '/app/membership', label: 'My Membership', icon: 'Crown' },
    ],
  },
  {
    group: 'Play & Order',
    items: [
      { to: '/app/bookings', label: 'Court Bookings', icon: 'CalendarDays' },
      { to: '/app/shop', label: 'Sports Shop', icon: 'ShoppingBag', badgeKey: 'cart' },
      { to: '/app/cafe', label: 'Cafeteria', icon: 'Coffee' },
    ],
  },
  {
    group: 'Account',
    items: [
      { to: '/app/ai', label: 'ClubBloom AI', icon: 'Sparkles' },
      { to: '/app/notifications', label: 'Notifications', icon: 'Bell', badgeKey: 'notifications' },
      { to: '/app/profile', label: 'Profile', icon: 'User' },
    ],
  },
];

export const managerNav = [
  {
    group: 'Operations',
    items: [
      { to: '/manager/overview', label: 'Overview', icon: 'LayoutDashboard' },
      { to: '/manager/bookings', label: 'Bookings', icon: 'CalendarDays' },
      { to: '/manager/courts', label: 'Courts', icon: 'Map' },
      { to: '/manager/cafeteria', label: 'Cafeteria', icon: 'Coffee' },
    ],
  },
  {
    group: 'Community',
    items: [
      { to: '/manager/members', label: 'Members', icon: 'Users' },
      { to: '/manager/memberships', label: 'Membership Plans', icon: 'Crown' },
      { to: '/manager/trials', label: 'Trials & Enquiries', icon: 'ClipboardCheck' },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { to: '/manager/shop', label: 'Shop & Inventory', icon: 'ShoppingBag' },
      { to: '/manager/staff', label: 'Staff', icon: 'Briefcase' },
      { to: '/manager/finance', label: 'Finance', icon: 'Wallet' },
    ],
  },
  {
    group: 'Intelligence',
    items: [{ to: '/manager/ai', label: 'AI Insights', icon: 'Sparkles' }],
  },
];

export const adminNav = [
  {
    group: 'Platform',
    items: [
      { to: '/admin/overview', label: 'Overview', icon: 'LayoutDashboard' },
      { to: '/admin/managers', label: 'Manager Accounts', icon: 'UserCog' },
      { to: '/admin/staff', label: 'Staff Accounts', icon: 'Users' },
      { to: '/admin/roles', label: 'Roles & Permissions', icon: 'ShieldCheck' },
    ],
  },
  {
    group: 'Community',
    items: [{ to: '/admin/members', label: 'Members', icon: 'Users' }],
  },
  {
    group: 'Governance',
    items: [
      { to: '/admin/reports', label: 'Financial Reports', icon: 'FileBarChart' },
      { to: '/admin/audit', label: 'Audit Logs', icon: 'ScrollText' },
      { to: '/admin/settings', label: 'System Settings', icon: 'Settings' },
      { to: '/admin/notifications', label: 'Notifications', icon: 'Bell' },
    ],
  },
];

export const staffNav = [
  {
    group: 'Operations',
    items: [
      { to: '/staff/bookings', label: 'Court Bookings', icon: 'CalendarDays' },
      { to: '/staff/courts', label: 'Court Status', icon: 'Map' },
      { to: '/staff/cafeteria', label: 'Cafeteria Orders', icon: 'Coffee' },
      { to: '/staff/shop', label: 'Pro Shop Queue', icon: 'ShoppingBag' },
    ],
  },
  {
    group: 'Front Desk',
    items: [
      { to: '/staff/members', label: 'Member Check-in', icon: 'Users' },
      { to: '/staff/trials', label: 'Trial Visitors', icon: 'ClipboardCheck' },
    ],
  },
];

export const publicNav = [
  { to: '/', label: 'Home' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/membership', label: 'Membership' },
  { to: '/shop', label: 'Shop' },
  { to: '/cafeteria', label: 'Cafeteria' },
  { to: '/about', label: 'About' },
];

export const roleHome = {
  customer: '/app/dashboard',
  member: '/app/dashboard',
  visitor: '/app/dashboard',
  manager: '/manager/overview',
  receptionist: '/manager/overview',
  coach: '/manager/overview',
  accountant: '/manager/overview',
  admin: '/admin/overview',
  super_admin: '/admin/overview',
  owner: '/admin/overview',
  staff: '/staff/bookings',
};
