import React, { useEffect } from 'react';
import { FaMoneyBillWave, FaBell, FaCog, FaSuitcase, FaChartBar, FaEnvelope, FaTimes, FaHotel } from 'react-icons/fa';
import { MdDashboard, MdPeople, MdReceipt } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import SidebarItem from '../shared/SidebarItem';

const AdminSidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  const location = useLocation();

  const normalizePath = (path) => {
    if (!path || path === '/') {
      return path;
    }

    return path.endsWith('/') ? path.slice(0, -1) : path;
  };

  const currentPath = normalizePath(location.pathname);

  useEffect(() => {
    onMobileClose();
  }, [currentPath, onMobileClose]);

  const navItems = [
    { icon: MdDashboard, text: 'Dashboard', to: '/admin/dashboard', exact: true },
    {
      icon: MdPeople,
      text: 'User Management',
      to: '/admin/dashboard/user-management',
      submenu: [
        { text: 'All Users', to: '/admin/dashboard/user-management', exact: true },
        { text: 'Admins', to: '/admin/dashboard/user-management/admins' },
        { text: 'Suspended', to: '/admin/dashboard/user-management/suspended' },
      ],
    },
    {
      icon: FaSuitcase,
      text: 'Trips & Itineraries',
      to: '/admin/dashboard/trips-itineraries',
      submenu: [
        { text: 'All Tours', to: '/admin/dashboard/trips-itineraries', exact: true },
        { text: 'Family', to: '/admin/dashboard/trips-itineraries/family' },
        { text: 'Couple', to: '/admin/dashboard/trips-itineraries/couple' },
        { text: 'Adventure', to: '/admin/dashboard/trips-itineraries/adventure' },
        { text: 'Culture', to: '/admin/dashboard/trips-itineraries/culture' },
      ],
    },
    {
      icon: FaHotel,
      text: 'Hotels',
      to: '/admin/dashboard/hotels',
      submenu: [
        { text: 'Inventory', to: '/admin/dashboard/hotels', exact: true },
        { text: 'Hotel Bookings', to: '/admin/dashboard/hotels/bookings' },
      ],
    },
    {
      icon: MdReceipt,
      text: 'Bookings',
      to: '/admin/dashboard/bookings',
      submenu: [
        { text: 'All Requests', to: '/admin/dashboard/bookings', exact: true },
        { text: 'Pending', to: '/admin/dashboard/bookings/pending' },
        { text: 'Approved', to: '/admin/dashboard/bookings/approved' },
        { text: 'Rejected', to: '/admin/dashboard/bookings/rejected' },
      ],
    },
    {
      icon: FaMoneyBillWave,
      text: 'Payments',
      to: '/admin/dashboard/budget-payments',
      submenu: [
        { text: 'Payment History', to: '/admin/dashboard/budget-payments', exact: true },
        { text: 'Successful', to: '/admin/dashboard/budget-payments/successful' },
        { text: 'Pending', to: '/admin/dashboard/budget-payments/pending' },
        { text: 'Refunded', to: '/admin/dashboard/budget-payments/refunded' },
      ],
    },
    {
      icon: FaChartBar,
      text: 'Recommendations',
      to: '/admin/dashboard/recommendations',
      submenu: [
        { text: 'All Suggestions', to: '/admin/dashboard/recommendations', exact: true },
        { text: 'Destinations', to: '/admin/dashboard/recommendations/destinations' },
        { text: 'Pricing', to: '/admin/dashboard/recommendations/pricing' },
        { text: 'Travel Timing', to: '/admin/dashboard/recommendations/timing' },
      ],
    },
    {
      icon: FaBell,
      text: 'Notifications',
      to: '/admin/dashboard/notifications',
      submenu: [
        { text: 'All Alerts', to: '/admin/dashboard/notifications', exact: true },
        { text: 'Unread', to: '/admin/dashboard/notifications/unread' },
        { text: 'Bookings', to: '/admin/dashboard/notifications/bookings' },
        { text: 'Payments', to: '/admin/dashboard/notifications/payments' },
        { text: 'Users', to: '/admin/dashboard/notifications/users' },
        { text: 'Security', to: '/admin/dashboard/notifications/security' },
        { text: 'System', to: '/admin/dashboard/notifications/system' },
      ],
    },
    {
      icon: FaEnvelope,
      text: 'Messages',
      to: '/admin/dashboard/messages',
      submenu: [
        { text: 'All Messages', to: '/admin/dashboard/messages', exact: true },
        { text: 'Unread', to: '/admin/dashboard/messages/unread' },
      ],
    },
    {
      icon: FaChartBar,
      text: 'Reports',
      to: '/admin/dashboard/reports',
      submenu: [
        { text: 'Overview', to: '/admin/dashboard/reports', exact: true },
        { text: 'Revenue', to: '/admin/dashboard/reports/revenue' },
        { text: 'Bookings', to: '/admin/dashboard/reports/bookings' },
        { text: 'Users', to: '/admin/dashboard/reports/users' },
      ],
    },
    { icon: FaCog, text: 'Settings', to: '/admin/dashboard/settings' },
  ];

  const isActive = ({ to, exact }) => {
    const targetPath = normalizePath(to);
    return exact ? currentPath === targetPath : currentPath.startsWith(targetPath);
  };

  const renderNavigation = (onItemSelect) => (
    <nav className="h-full overflow-y-auto pb-5 pr-1">
      {navItems.map((item) => {
        const itemActive = isActive(item);

        return (
          <div key={item.text}>
            <SidebarItem
              icon={item.icon}
              text={item.text}
              to={item.to}
              hasSubmenu={item.hasSubmenu || Boolean(item.submenu?.length)}
              active={itemActive}
              onClick={onItemSelect}
              variant="traveler"
            />
            {item.submenu?.length ? (
              <div
                className={`mx-4 mb-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/15 via-white/10 to-white/5 px-3 py-3 space-y-1 ${
                  itemActive ? 'block' : 'hidden'
                }`}
              >
                {item.submenu.map((subItem) => {
                  const subActive = isActive(subItem);
                  return (
                    <Link
                      key={subItem.text}
                      to={subItem.to}
                      onClick={onItemSelect}
                      className={`block rounded-lg px-3 py-2 text-xs transition-colors ${
                        subActive
                          ? 'bg-white text-primary font-semibold'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {subItem.text}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="relative hidden w-72 shrink-0 overflow-hidden bg-gradient-to-b from-[#4b1f65] via-primary to-[#223458] text-white shadow-[8px_0_28px_rgba(20,20,40,0.24)] md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="pointer-events-none absolute -left-24 top-[-3.5rem] h-44 w-44 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 right-[-3rem] h-40 w-40 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

        <div className="relative border-b border-white/15 px-7 py-7">
          <div className="flex items-center gap-3">
            <img
              src="/wanderwise-mark.svg"
              alt="WanderWise Logo"
              className="h-10 w-10 rounded-xl border border-white/25 bg-white/10 p-1"
            />
            <div>
              <span className="font-primary block text-lg font-semibold tracking-wide">WanderWise</span>
              <span className="text-[11px] text-white/75">Admin Console</span>
            </div>
          </div>
        </div>

        <div className="relative mt-3 flex-1 min-h-0 overflow-hidden px-2">{renderNavigation()}</div>

        <div className="relative mx-4 mb-5 rounded-2xl border border-white/20 bg-white/10 p-3.5 text-xs text-white/80 backdrop-blur-sm">
          <p className="font-medium text-white">Operations ready</p>
          <p className="mt-1 leading-relaxed">
            Monitor bookings, revenue, and alerts from one consolidated admin view.
          </p>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-40 md:hidden ${isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isMobileOpen}
      >
        <button
          type="button"
          onClick={onMobileClose}
          className={`absolute inset-0 bg-slate-900/55 transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Close sidebar backdrop"
        />

        <aside
          className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-hidden bg-gradient-to-b from-[#4b1f65] via-primary to-[#223458] text-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation menu"
        >
          <div className="border-b border-white/15 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/wanderwise-mark.svg"
                  alt="WanderWise Logo"
                  className="h-8 w-8 rounded-lg border border-white/25 bg-white/10 p-1"
                />
                <span className="text-lg font-semibold">WanderWise</span>
              </div>
              <button
                type="button"
                onClick={onMobileClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/90 hover:bg-white/10"
                aria-label="Close navigation menu"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex-1 min-h-0 overflow-hidden px-2">{renderNavigation(onMobileClose)}</div>
        </aside>
      </div>
    </>
  );
};

export default AdminSidebar;
