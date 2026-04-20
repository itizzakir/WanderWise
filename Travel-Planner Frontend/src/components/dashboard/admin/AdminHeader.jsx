import React, { useEffect, useState } from 'react';
import { FaBars, FaBell, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../lib/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import {
  ADMIN_NOTIFICATIONS_UPDATED_EVENT,
  getAdminNotifications,
} from '../../../lib/adminNotifications';
import {
  CONTACT_MESSAGES_UPDATED_EVENT,
  getAdminContactMessages,
} from '../../../lib/contactMessages';

const AdminHeader = ({ onMenuToggle = () => {}, isMenuOpen = false }) => {
  const { logout, token, user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const adminAvatar = user?.avatar || `https://i.pravatar.cc/150?u=${user?.email || 'admin'}`;
  const adminName = user?.name || 'Admin';

  useEffect(() => {
    let isMounted = true;

    const syncUnread = async () => {
      if (!token || user?.role !== 'ADMIN') {
        if (isMounted) {
          setUnreadCount(0);
        }
        return;
      }

      const [notificationsResult, contactMessagesResult] = await Promise.allSettled([
        getAdminNotifications(token),
        getAdminContactMessages(token),
      ]);

      let nextUnread = 0;
      if (notificationsResult.status === 'fulfilled') {
        nextUnread += notificationsResult.value.filter((entry) => !entry.read).length;
      }

      if (contactMessagesResult.status === 'fulfilled') {
        nextUnread += contactMessagesResult.value.filter((entry) => !entry.read).length;
      }

      if (isMounted) {
        if (
          notificationsResult.status === 'rejected' &&
          contactMessagesResult.status === 'rejected'
        ) {
          setUnreadCount(0);
          return;
        }

        setUnreadCount(nextUnread);
      }
    };

    syncUnread();
    const pollingId = window.setInterval(syncUnread, 30000);
    window.addEventListener(ADMIN_NOTIFICATIONS_UPDATED_EVENT, syncUnread);
    window.addEventListener(CONTACT_MESSAGES_UPDATED_EVENT, syncUnread);

    return () => {
      isMounted = false;
      window.clearInterval(pollingId);
      window.removeEventListener(ADMIN_NOTIFICATIONS_UPDATED_EVENT, syncUnread);
      window.removeEventListener(CONTACT_MESSAGES_UPDATED_EVENT, syncUnread);
    };
  }, [token, user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/65 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-8 md:py-5">
      <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white md:hidden"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
          </button>
          <div className="hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
            Admin Console
          </div>
          <h2 className="truncate font-primary text-base font-semibold text-slate-900 sm:text-lg">Wanderwise Admin</h2>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/admin/dashboard/notifications/unread"
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

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 xl:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            API Status: All Systems Operational
          </div>

          <Link
            to="/admin/dashboard/settings"
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300"
            title="Open admin settings"
          >
            <img
              src={adminAvatar}
              alt={`${adminName} avatar`}
              className="h-8 w-8 rounded-full border border-white object-cover shadow"
            />
            <div className="hidden text-sm lg:block">
              <span className="block font-semibold text-slate-700">{adminName}</span>
              <span className="text-xs text-slate-400">Admin Dashboard</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <FaSignOutAlt size={12} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
