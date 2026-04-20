import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../lib/useAuth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const statusStyles = {
  SUCCESS: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REFUNDED: 'bg-blue-100 text-blue-700',
  FAILED: 'bg-red-100 text-red-700',
};

const methodLabels = {
  CARD: 'Card',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank Transfer',
};

const getRouteStatusFilter = (tab) => {
  if (tab === 'successful') {
    return 'SUCCESS';
  }

  if (tab === 'pending') {
    return 'PENDING';
  }

  if (tab === 'refunded') {
    return 'REFUNDED';
  }

  return 'ALL';
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const AdminPaymentsPanel = () => {
  const { user, token } = useAuth();
  const { tab } = useParams();
  const isAdmin = user?.role === 'ADMIN';

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const routeStatusFilter = getRouteStatusFilter(tab);
  const activeStatusFilter = routeStatusFilter === 'ALL' ? statusFilter : routeStatusFilter;

  const fetchPayments = useCallback(async () => {
    if (!isAdmin || !token) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        setFetchError(payload?.message || 'Unable to load payments.');
        return;
      }

      if (!Array.isArray(payload)) {
        setFetchError('Invalid payments response from backend.');
        return;
      }

      setPayments(payload);
    } catch {
      setFetchError('Unable to connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return payments.filter((entry) => {
      const matchesSearch =
        search.length === 0 ||
        entry.id.toLowerCase().includes(search) ||
        entry.bookingId.toLowerCase().includes(search) ||
        entry.travelerName.toLowerCase().includes(search) ||
        entry.travelerEmail.toLowerCase().includes(search);

      const matchesStatus = activeStatusFilter === 'ALL' || entry.status === activeStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, activeStatusFilter]);

  const summary = useMemo(
    () => ({
      totalTransactions: payments.length,
      grossVolume: payments.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
      successful: payments.filter((entry) => entry.status === 'SUCCESS').length,
      refunded: payments.filter((entry) => entry.status === 'REFUNDED').length,
    }),
    [payments]
  );

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800">Payments</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only users with the ADMIN role can view payment history.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review all traveler payment transactions from the admin dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchPayments}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Transactions</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalTransactions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Gross Volume</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatAmount(summary.grossVolume, 'INR')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Successful</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{summary.successful}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Refunded</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{summary.refunded}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
        {fetchError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {fetchError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by payment ID, booking ID, traveler, or email"
            className="w-full md:flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            disabled={routeStatusFilter !== 'ALL'}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="py-3 font-medium">Payment ID</th>
                <th className="py-3 font-medium">Booking ID</th>
                <th className="py-3 font-medium">Traveler</th>
                <th className="py-3 font-medium">Method</th>
                <th className="py-3 font-medium">Paid Date</th>
                <th className="py-3 font-medium">Amount</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.map((entry) => (
                <tr key={entry.paymentRecordId} className="hover:bg-gray-50">
                  <td className="py-3 font-semibold text-gray-800">{entry.id}</td>
                  <td className="py-3 text-gray-700">{entry.bookingId}</td>
                  <td className="py-3">
                    <p className="font-medium text-gray-800">{entry.travelerName}</p>
                    <p className="text-xs text-gray-500">{entry.travelerEmail}</p>
                  </td>
                  <td className="py-3 text-gray-700">{methodLabels[entry.method] || entry.method}</td>
                  <td className="py-3 text-gray-700">{formatDate(entry.paidAt)}</td>
                  <td className="py-3 text-gray-800 font-semibold">{formatAmount(entry.amount, entry.currency || 'INR')}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        statusStyles[entry.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredPayments.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No payment history found for this filter.</p>
        ) : null}
      </div>
    </section>
  );
};

export default AdminPaymentsPanel;
