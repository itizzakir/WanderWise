import React, { useEffect } from 'react';
import { FaSuitcase, FaBell, FaCog, FaTimes, FaHotel } from 'react-icons/fa';
import { MdDashboard, MdExplore } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import SidebarItem from '../shared/SidebarItem';

const TravelerSidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  const location = useLocation();
  const currentSearchParams = new URLSearchParams(location.search);

  const normalizePath = (path) => {
    if (!path || path === '/') {
      return path;
    }

    return path.endsWith('/') ? path.slice(0, -1) : path;
  };

  const currentPath = normalizePath(location.pathname);

  useEffect(() => {
    onMobileClose();
  }, [currentPath, location.search, onMobileClose]);

  const navItems = [
    { icon: MdDashboard, text: 'Dashboard', to: '/user/dashboard', exact: true },
    {
      icon: FaSuitcase,
      text: 'My Trips',
      to: '/user/dashboard/my-trips',
      submenu: [
        { text: 'All Trips', to: '/user/dashboard/my-trips', exact: true },
        { text: 'Upcoming', to: '/user/dashboard/my-trips/upcoming' },
        { text: 'Completed', to: '/user/dashboard/my-trips/completed' },
      ],
    },
    {
      icon: FaHotel,
      text: 'Hotels',
      to: '/user/dashboard/hotels',
      submenu: [
        { text: 'Suggestions', to: '/user/dashboard/hotels', exact: true },
        { text: 'My Bookings', to: '/user/dashboard/hotels/bookings' },
      ],
    },
    {
      icon: MdExplore,
      text: 'Explore',
      to: '/tours',
      submenu: [
        { text: 'All Tours', to: '/tours', exact: true, query: { category: null } },
        { text: 'Family', to: '/tours?category=Family', exact: true, query: { category: 'Family' } },
        { text: 'Couple', to: '/tours?category=Couple', exact: true, query: { category: 'Couple' } },
        { text: 'Adventure', to: '/tours?category=Adventure', exact: true, query: { category: 'Adventure' } },
        { text: 'Culture', to: '/tours?category=Culture', exact: true, query: { category: 'Culture' } },
      ],
    },
    {
      icon: FaBell,
      text: 'Notifications',
      to: '/user/dashboard/notifications',
      submenu: [
        { text: 'All', to: '/user/dashboard/notifications', exact: true },
        { text: 'Unread', to: '/user/dashboard/notifications/unread' },
        { text: 'Bookings', to: '/user/dashboard/notifications/bookings' },
        { text: 'Payments', to: '/user/dashboard/notifications/payments' },
      ],
    },
    { icon: FaCog, text: 'Settings', to: '/user/settings', exact: true },
  ];

  const isActive = ({ to, exact, query }) => {
    if (!to) {
      return false;
    }

    const targetPath = normalizePath(to.split('?')[0]);
    const pathMatches = exact ? currentPath === targetPath : currentPath.startsWith(targetPath);

    if (!pathMatches) {
      return false;
    }

    if (!query) {
      return true;
    }

    return Object.entries(query).every(([key, expectedValue]) => {
      const value = currentSearchParams.get(key);
      if (expectedValue === null) {
        return value === null;
      }
      return value === expectedValue;
    });
  };

  const renderNavigation = (onItemSelect) => (
    <nav className="flex-1 overflow-y-auto pb-5">
      {navItems.map((item) => {
        const itemActive = isActive(item);

        return (
          <div key={item.text}>
            <SidebarItem
              icon={item.icon}
              text={item.text}
              to={item.to}
              hasSubmenu={Boolean(item.submenu?.length)}
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
              <span className="text-[11px] text-white/75">Traveler Console</span>
            </div>
          </div>
        </div>

        <div className="relative mt-3 px-2">{renderNavigation()}</div>

        <div className="relative mx-4 mb-5 rounded-2xl border border-white/20 bg-white/10 p-3.5 text-xs text-white/80 backdrop-blur-sm">
          <p className="font-medium text-white">Plan smarter</p>
          <p className="mt-1 leading-relaxed">
            Use saved places and budget widgets to build your next itinerary faster.
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
          aria-label="Traveler navigation menu"
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
          <div className="mt-3 px-2">{renderNavigation(onMobileClose)}</div>
        </aside>
      </div>
    </>
  );
};

export default TravelerSidebar;
