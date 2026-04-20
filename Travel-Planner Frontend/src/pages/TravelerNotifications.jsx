import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaBell, FaCheck, FaCheckCircle, FaCreditCard, FaSuitcase, FaTrash } from 'react-icons/fa';
import TravelerSidebar from '../components/dashboard/traveler/TravelerSidebar';
import TravelerHeader from '../components/dashboard/traveler/TravelerHeader';
import { useAuth } from '../lib/useAuth';
import {
  deleteTravelerNotification,
  getTravelerNotifications,
  markAllTravelerNotificationsRead,
  markTravelerNotificationRead,
} from '../lib/travelerNotifications';

const typeStyles = {
  BOOKING: 'bg-blue-100 text-blue-700',
  PAYMENT: 'bg-green-100 text-green-700',
  TRIP: 'bg-purple-100 text-purple-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
};

const typeLabels = {
  BOOKING: 'Booking',
  PAYMENT: 'Payment',
  TRIP: 'Trip',
  SYSTEM: 'System',
};

const typeIcons = {
  BOOKING: FaSuitcase,
  PAYMENT: FaCreditCard,
  TRIP: FaBell,
  SYSTEM: FaCheckCircle,
};

const getRouteFilter = (tab) => {
  if (tab === 'unread') {
    return 'UNREAD';
  }

  if (tab === 'bookings') {
    return 'BOOKING';
  }

  if (tab === 'payments') {
    return 'PAYMENT';
  }

  return 'ALL';
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const TravelerNotifications = () => {
  const { tab } = useParams();
  const { token, user } = useAuth();
  const isTraveler = user?.role === 'USER';

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeActionKey, setActiveActionKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((current) => !current);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const routeFilter = getRouteFilter(tab);
  const activeTypeFilter = routeFilter === 'ALL' ? typeFilter : routeFilter;

  const loadNotifications = useCallback(async () => {
    if (!isTraveler || !token) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError('');

    try {
      const payload = await getTravelerNotifications(token);
      setNotifications(Array.isArray(payload) ? payload : []);
    } catch (error) {
      setFetchError(error?.message || 'Unable to load notifications.');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTraveler, token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const summary = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((entry) => !entry.read).length,
      bookings: notifications.filter((entry) => entry.type === 'BOOKING').length,
      payments: notifications.filter((entry) => entry.type === 'PAYMENT').length,
    }),
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notifications.filter((entry) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        entry.title.toLowerCase().includes(normalizedSearch) ||
        entry.message.toLowerCase().includes(normalizedSearch) ||
        entry.type.toLowerCase().includes(normalizedSearch);

      if (activeTypeFilter === 'UNREAD') {
        return matchesSearch && !entry.read;
      }

      if (activeTypeFilter === 'ALL') {
        return matchesSearch;
      }

      return matchesSearch && entry.type === activeTypeFilter;
    });
  }, [notifications, searchTerm, activeTypeFilter]);

  const handleMarkRead = async (notificationId) => {
    if (!token) {
      return;
    }

    setActionError('');
    setActiveActionKey(`read-${notificationId}`);

    try {
      const updated = await markTravelerNotificationRead(token, notificationId);
      setNotifications((current) =>
        current.map((entry) =>
          entry.notificationId === notificationId ? updated : entry
        )
      );
    } catch (error) {
      setActionError(error?.message || 'Unable to mark notification as read.');
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) {
      return;
    }

    setActionError('');
    setActiveActionKey('mark-all');

    try {
      const updated = await markAllTravelerNotificationsRead(token);
      setNotifications(updated);
    } catch (error) {
      setActionError(error?.message || 'Unable to mark all notifications as read.');
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!token) {
      return;
    }

    setActionError('');
    setActiveActionKey(`delete-${notificationId}`);

    try {
      await deleteTravelerNotification(token, notificationId);
      setNotifications((current) =>
        current.filter((entry) => entry.notificationId !== notificationId)
      );
    } catch (error) {
      setActionError(error?.message || 'Unable to delete notification.');
    } finally {
      setActiveActionKey(null);
    }
  };

  return (
    <div className="page-shell flex h-screen overflow-hidden">
      <TravelerSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleCloseMobileSidebar}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TravelerHeader
          onMenuToggle={handleToggleMobileSidebar}
          isMenuOpen={isMobileSidebarOpen}
        />
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8 space-y-6">
          <div className="mx-auto w-full max-w-[1380px] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Stay updated with bookings, payments, and trip alerts.
                </p>
              </div>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={Boolean(activeActionKey)}
                className="px-3 py-2 rounded-lg text-xs font-medium bg-white/80 border border-white/70 text-gray-700 hover:bg-white transition-colors"
              >
                Mark All as Read
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{summary.unread}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Booking Alerts</p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">{summary.bookings}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Payment Alerts</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{summary.payments}</p>
              </div>
            </div>

            <div className="glass-card p-4">
              {fetchError ? (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                  {fetchError}
                </p>
              ) : null}
              {actionError ? (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                  {actionError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search notifications"
                  className="w-full md:flex-1 border border-gray-200/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  disabled={routeFilter !== 'ALL'}
                  className="border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white/80 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="ALL">All Types</option>
                  <option value="UNREAD">Unread</option>
                  <option value="BOOKING">Bookings</option>
                  <option value="PAYMENT">Payments</option>
                  <option value="TRIP">Trips</option>
                  <option value="SYSTEM">System</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="glass-card p-8 text-center text-sm text-gray-500">
                  Loading notifications...
                </div>
              ) : (
                filteredNotifications.map((entry) => {
                  const Icon = typeIcons[entry.type] || FaBell;

                  return (
                    <article
                      key={entry.notificationId}
                      className={`glass-card p-4 ${
                        entry.read ? 'border-white/70' : 'border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-800">{entry.title}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                typeStyles[entry.type] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {typeLabels[entry.type] || entry.type}
                            </span>
                            {!entry.read ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Unread
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{entry.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(entry.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!entry.read ? (
                            <button
                              type="button"
                              disabled={Boolean(activeActionKey)}
                              onClick={() => handleMarkRead(entry.notificationId)}
                              className="px-2 py-1 rounded-md text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 inline-flex items-center gap-1"
                            >
                              <FaCheck size={10} />
                              Mark Read
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={Boolean(activeActionKey)}
                            onClick={() => handleDelete(entry.notificationId)}
                            className="px-2 py-1 rounded-md text-xs bg-red-100 hover:bg-red-200 text-red-700 inline-flex items-center gap-1"
                          >
                            <FaTrash size={10} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {!isLoading && filteredNotifications.length === 0 ? (
              <div className="glass-card p-8 text-center text-sm text-gray-500">
                No notifications found for this view.
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TravelerNotifications;
