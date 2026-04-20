import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../lib/useAuth';
import { formatInr } from '../../../lib/pricing';

const REPORT_TABS = [
  { id: 'overview', label: 'Overview', to: '/admin/dashboard/reports' },
  { id: 'revenue', label: 'Revenue', to: '/admin/dashboard/reports/revenue' },
  { id: 'bookings', label: 'Bookings', to: '/admin/dashboard/reports/bookings' },
  { id: 'users', label: 'Users', to: '/admin/dashboard/reports/users' },
];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const normalizeReportTab = (tab) => {
  if (!tab) {
    return 'overview';
  }

  const validTabs = REPORT_TABS.map((entry) => entry.id);
  return validTabs.includes(tab) ? tab : 'overview';
};

const toPercent = (value, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
};

const AdminReportsPanel = () => {
  const { user, token } = useAuth();
  const { tab } = useParams();
  const isAdmin = user?.role === 'ADMIN';
  const activeTab = normalizeReportTab(tab);
  const [rangeDays, setRangeDays] = useState(90);
  const nowTimestamp = useMemo(() => Date.now(), []);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchReportsData = useCallback(async () => {
    if (!isAdmin || !token) {
      setBookings([]);
      setPayments([]);
      setUsers([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const [bookingsResponse, paymentsResponse, usersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bookings/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/payments/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const [bookingsPayload, paymentsPayload, usersPayload] = await Promise.all([
        parseJsonSafe(bookingsResponse),
        parseJsonSafe(paymentsResponse),
        parseJsonSafe(usersResponse),
      ]);

      if (!bookingsResponse.ok) {
        setFetchError(bookingsPayload?.message || 'Unable to load booking reports data.');
        setBookings([]);
        setPayments([]);
        setUsers([]);
        return;
      }

      if (!paymentsResponse.ok) {
        setFetchError(paymentsPayload?.message || 'Unable to load payment reports data.');
        setBookings([]);
        setPayments([]);
        setUsers([]);
        return;
      }

      if (!usersResponse.ok) {
        setFetchError(usersPayload?.message || 'Unable to load user reports data.');
        setBookings([]);
        setPayments([]);
        setUsers([]);
        return;
      }

      if (!Array.isArray(bookingsPayload) || !Array.isArray(paymentsPayload) || !Array.isArray(usersPayload)) {
        setFetchError('Invalid reports response from backend.');
        setBookings([]);
        setPayments([]);
        setUsers([]);
        return;
      }

      setBookings(bookingsPayload);
      setPayments(paymentsPayload);
      setUsers(usersPayload);
    } catch {
      setFetchError('Unable to connect to backend server.');
      setBookings([]);
      setPayments([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const thresholdTimestamp = useMemo(
    () => nowTimestamp - Number(rangeDays) * 24 * 60 * 60 * 1000,
    [rangeDays, nowTimestamp]
  );

  const filteredBookings = useMemo(
    () =>
      bookings.filter((entry) => new Date(entry.requestedAt).getTime() >= thresholdTimestamp),
    [bookings, thresholdTimestamp]
  );

  const filteredPayments = useMemo(
    () => payments.filter((entry) => new Date(entry.paidAt).getTime() >= thresholdTimestamp),
    [payments, thresholdTimestamp]
  );

  const successfulPayments = useMemo(
    () => filteredPayments.filter((entry) => entry.status === 'SUCCESS'),
    [filteredPayments]
  );

  const summary = useMemo(() => {
    const bookingTotal = filteredBookings.length;
    const paymentTotal = filteredPayments.length;
    const successfulRevenue = successfulPayments.reduce(
      (sum, entry) => sum + Number(entry.amount || 0),
      0
    );
    const approvedBookings = filteredBookings.filter((entry) => entry.status === 'APPROVED').length;
    const activeUsers = users.filter((entry) => entry.status === 'ACTIVE').length;

    return {
      successfulRevenue,
      avgBookingValue:
        successfulPayments.length > 0
          ? Math.round(successfulRevenue / successfulPayments.length)
          : 0,
      approvalRate: toPercent(approvedBookings, bookingTotal),
      paymentSuccessRate: toPercent(successfulPayments.length, paymentTotal),
      activeUsers,
      totalUsers: users.length,
      pendingBookings: filteredBookings.filter((entry) => entry.status === 'PENDING').length,
      failedPayments: filteredPayments.filter((entry) => entry.status === 'FAILED').length,
      suspendedUsers: users.filter((entry) => entry.status === 'SUSPENDED').length,
      disabledUsers: users.filter((entry) => entry.status === 'DISABLED').length,
    };
  }, [filteredBookings, filteredPayments, successfulPayments, users]);

  const destinationPerformance = useMemo(() => {
    const byDestination = new Map();

    filteredBookings.forEach((entry) => {
      const key = `${entry.destination}, ${entry.country}`;

      if (!byDestination.has(key)) {
        byDestination.set(key, {
          destination: key,
          requests: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          revenue: 0,
        });
      }

      const stats = byDestination.get(key);
      stats.requests += 1;

      if (entry.status === 'APPROVED') {
        stats.approved += 1;
      }

      if (entry.status === 'REJECTED') {
        stats.rejected += 1;
      }

      if (entry.status === 'PENDING') {
        stats.pending += 1;
      }

      const destinationRevenue = successfulPayments
        .filter((payment) => payment.bookingId === entry.id)
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      stats.revenue += destinationRevenue;
    });

    return Array.from(byDestination.values())
      .map((entry) => ({
        ...entry,
        approvalRate: toPercent(entry.approved, entry.requests),
      }))
      .sort((a, b) => b.requests - a.requests);
  }, [filteredBookings, successfulPayments]);

  const monthlyRevenue = useMemo(() => {
    const buckets = [];
    const monthCount = 6;

    for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
      const date = new Date(nowTimestamp);
      date.setDate(1);
      date.setMonth(date.getMonth() - offset);

      buckets.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: 0,
      });
    }

    const bucketIndex = new Map(buckets.map((entry, index) => [entry.key, index]));

    successfulPayments.forEach((entry) => {
      const paidDate = new Date(entry.paidAt);
      const key = `${paidDate.getFullYear()}-${paidDate.getMonth()}`;
      const index = bucketIndex.get(key);
      if (index !== undefined) {
        buckets[index].amount += Number(entry.amount || 0);
      }
    });

    const maxAmount = Math.max(...buckets.map((entry) => entry.amount), 1);

    return buckets.map((entry) => ({
      ...entry,
      barWidth:
        entry.amount === 0 ? 0 : Math.max(10, Math.round((entry.amount / maxAmount) * 100)),
    }));
  }, [successfulPayments, nowTimestamp]);

  const showRevenueSection = activeTab === 'overview' || activeTab === 'revenue';
  const showBookingsSection = activeTab === 'overview' || activeTab === 'bookings';
  const showUsersSection = activeTab === 'overview' || activeTab === 'users';

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only users with the ADMIN role can view operational reports.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyze booking, revenue, and user performance from one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={String(rangeDays)}
            onChange={(event) => setRangeDays(Number(event.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
          </select>
          <button
            type="button"
            onClick={fetchReportsData}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {REPORT_TABS.map((entry) => {
          const active = activeTab === entry.id;

          return (
            <Link
              key={entry.id}
              to={entry.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {entry.label}
            </Link>
          );
        })}
      </div>

      {fetchError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
          {fetchError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Collected Revenue</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatInr(summary.successfulRevenue)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Average Booking Value</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatInr(summary.avgBookingValue)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Booking Approval Rate</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{summary.approvalRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Payment Success Rate</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{summary.paymentSuccessRate}%</p>
        </div>
      </div>

      {showRevenueSection ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue Trend</h3>
          <p className="text-xs text-gray-500 mt-1">Successful payments in the selected period.</p>
          <div className="mt-5 space-y-3">
            {monthlyRevenue.map((entry) => (
              <div key={entry.key}>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{entry.label}</span>
                  <span className="font-medium text-gray-700">{formatInr(entry.amount)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${entry.barWidth}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showBookingsSection ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800">Destination Performance</h3>
          <p className="text-xs text-gray-500 mt-1">
            Requests, approvals, and realized revenue by destination.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="py-3 font-medium">Destination</th>
                  <th className="py-3 font-medium">Requests</th>
                  <th className="py-3 font-medium">Approved</th>
                  <th className="py-3 font-medium">Rejected</th>
                  <th className="py-3 font-medium">Pending</th>
                  <th className="py-3 font-medium">Approval Rate</th>
                  <th className="py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {destinationPerformance.map((entry) => (
                  <tr key={entry.destination} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{entry.destination}</td>
                    <td className="py-3 text-gray-700">{entry.requests}</td>
                    <td className="py-3 text-green-700 font-medium">{entry.approved}</td>
                    <td className="py-3 text-red-700 font-medium">{entry.rejected}</td>
                    <td className="py-3 text-yellow-700 font-medium">{entry.pending}</td>
                    <td className="py-3 text-gray-700">{entry.approvalRate}%</td>
                    <td className="py-3 font-semibold text-gray-800">{formatInr(entry.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {destinationPerformance.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No destination data available.</p>
          ) : null}
        </div>
      ) : null}

      {showUsersSection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Active Users</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{summary.activeUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Suspended Users</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{summary.suspendedUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Disabled Users</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">{summary.disabledUsers}</p>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-800">Operational Watchlist</h3>
        <p className="text-xs text-gray-500 mt-1">
          Items that need attention based on current report range.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs uppercase tracking-wide text-yellow-700">Pending Booking Approvals</p>
            <p className="text-2xl font-bold text-yellow-800 mt-1">{summary.pendingBookings}</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs uppercase tracking-wide text-red-700">Failed Payments</p>
            <p className="text-2xl font-bold text-red-800 mt-1">{summary.failedPayments}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-700">Restricted User Accounts</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {summary.suspendedUsers + summary.disabledUsers}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminReportsPanel;
