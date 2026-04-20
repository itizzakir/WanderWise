import React, { useEffect } from 'react';
import { FaBell, FaCog, FaTimes } from 'react-icons/fa';
import { MdDashboard, MdExplore } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import SidebarItem from '../dashboard/shared/SidebarItem';

const SettingsSidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  const location = useLocation();

  useEffect(() => {
    onMobileClose();
  }, [location.pathname, location.search, onMobileClose]);

  const renderNavigation = (onItemSelect) => (
    <nav className="relative mt-3 flex-1 overflow-y-auto px-2 pb-5">
      <SidebarItem
        icon={MdDashboard}
        text="Dashboard"
        to="/user/dashboard"
        active={location.pathname === '/user/dashboard'}
        onClick={onItemSelect}
        variant="traveler"
      />
      <SidebarItem
        icon={MdExplore}
        text="My Trips"
        to="/user/dashboard/my-trips"
        active={location.pathname.startsWith('/user/dashboard/my-trips')}
        onClick={onItemSelect}
        variant="traveler"
      />
      <SidebarItem
        icon={MdExplore}
        text="Explore"
        to="/tours"
        active={location.pathname === '/tours'}
        onClick={onItemSelect}
        variant="traveler"
      />
      <SidebarItem
        icon={FaBell}
        text="Notifications"
        to="/user/dashboard/notifications"
        active={location.pathname.startsWith('/user/dashboard/notifications')}
        onClick={onItemSelect}
        variant="traveler"
      />
      <SidebarItem
        icon={FaCog}
        text="Settings"
        to="/user/settings"
        active={location.pathname === '/user/settings'}
        onClick={onItemSelect}
        variant="traveler"
      />
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
              <span className="text-[11px] text-white/75">Settings</span>
            </div>
          </div>
        </div>

        {renderNavigation()}
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
          aria-label="Settings navigation menu"
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
          {renderNavigation(onMobileClose)}
        </aside>
      </div>
    </>
  );
};

export default SettingsSidebar;
