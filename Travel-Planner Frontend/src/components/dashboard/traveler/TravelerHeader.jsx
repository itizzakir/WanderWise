import React, { useEffect, useState } from 'react';
import { FaSearch, FaBell, FaPhoneAlt, FaInfoCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../lib/useAuth';
import {
  getTravelerNotifications,
  TRAVELER_NOTIFICATIONS_UPDATED_EVENT,
} from '../../../lib/travelerNotifications';

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || '+91 98765 43210';
const SUPPORT_TEL_LINK = SUPPORT_PHONE.replace(/[^\d+]/g, '');

const TravelerHeader = ({ onMenuToggle, isMenuOpen = false }) => {
  const { logout, token, user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const syncNotifications = async () => {
      if (!token) {
        if (isMounted) {
          setUnreadCount(0);
        }
        return;
      }

      try {
        const list = await getTravelerNotifications(token);
        if (isMounted) {
          setUnreadCount(list.filter((entry) => !entry.read).length);
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0);
        }
      }
    };

    syncNotifications();
    window.addEventListener(TRAVELER_NOTIFICATIONS_UPDATED_EVENT, syncNotifications);

    return () => {
      isMounted = false;
      window.removeEventListener(TRAVELER_NOTIFICATIONS_UPDATED_EVENT, syncNotifications);
    };
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenSettings = () => {
    navigate('/user/settings');
  };

  const profileAvatar = user?.avatar || `https://i.pravatar.cc/150?u=${user?.email || 'traveler'}`;
  const profileAlt = user?.name ? `${user.name} profile` : 'Profile';

  return (
    <header className="sticky top-0 z-30 border-b border-white/65 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-8 md:py-5">
      <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-4">
        <div className="flex w-[44rem] max-w-full items-center gap-3 md:gap-4">
          {onMenuToggle ? (
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white md:hidden"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
            </button>
          ) : null}

          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              type="text"
              placeholder="Search trips, stays, and activities"
              className="w-full rounded-full border border-white/40 bg-white/85 py-2.5 pl-11 pr-4 text-sm text-slate-700 shadow-inner shadow-slate-100 outline-none transition focus:border-primary/35 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <Link
            to="/"
            className="hidden whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:inline-flex"
          >
            Home Page
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/user/dashboard/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary/30 hover:text-primary"
            aria-label="Open notifications"
          >
            <FaBell className="text-base" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Link>

          <a
            href={`tel:${SUPPORT_TEL_LINK}`}
            aria-label={`Call support ${SUPPORT_PHONE}`}
            title={`Call support: ${SUPPORT_PHONE}`}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700 md:inline-flex"
          >
            <FaPhoneAlt size={13} />
          </a>

          <Link
            to="/contact-us"
            aria-label="Open support information"
            title="Support information"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700 md:inline-flex"
          >
            <FaInfoCircle size={15} />
          </Link>

          <button
            type="button"
            onClick={handleOpenSettings}
            title="Open settings"
            className="rounded-full ring-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <img
              src={profileAvatar}
              alt={profileAlt}
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow"
            />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <FaSignOutAlt size={12} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TravelerHeader;
