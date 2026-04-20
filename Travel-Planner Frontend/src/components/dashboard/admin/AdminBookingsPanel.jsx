import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../lib/useAuth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const statusStyles = {
  PENDING_PAYMENT: 'bg-orange-100 text-orange-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const transportLabels = {
  suv: 'Luxury SUV',
  van: 'Comfort Van',
  bus: 'Shuttle Bus',
};

const getRouteStatusFilter = (tab) => {
  if (tab === 'pending') {
    return 'PENDING';
  }

  if (tab === 'approved') {
    return 'APPROVED';
  }

  if (tab === 'rejected') {
    return 'REJECTED';
  }

  return 'ALL';
};

const formatDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const AdminBookingsPanel = () => {
  const { user, token } = useAuth();
  const { tab } = useParams();
  const isAdmin = user?.role === 'ADMIN';

  const [bookingRequests, setBookingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [activeActionKey, setActiveActionKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionSelections, setActionSelections] = useState({});

  const routeStatusFilter = getRouteStatusFilter(tab);
  const activeStatusFilter = routeStatusFilter === 'ALL' ? statusFilter : routeStatusFilter;

  const summary = useMemo(
    () => ({
      total: bookingRequests.length,
      pending: bookingRequests.filter((entry) => entry.status === 'PENDING').length,
      approved: bookingRequests.filter((entry) => entry.status === 'APPROVED').length,
      rejected: bookingRequests.filter((entry) => entry.status === 'REJECTED').length,
    }),
    [bookingRequests]
  );

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return bookingRequests.filter((entry) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        entry.id.toLowerCase().includes(normalizedSearch) ||
        entry.travelerName.toLowerCase().includes(normalizedSearch) ||
        entry.travelerEmail.toLowerCase().includes(normalizedSearch) ||
        entry.destination.toLowerCase().includes(normalizedSearch);

      const matchesStatus = activeStatusFilter === 'ALL' || entry.status === activeStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookingRequests, searchTerm, activeStatusFilter]);

  const fetchBookings = useCallback(async () => {
    if (!isAdmin || !token) {
      setBookingRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        setFetchError(payload?.message || 'Unable to load booking requests.');
        return;
      }

      if (!Array.isArray(payload)) {
        setFetchError('Invalid booking response from backend.');
        return;
      }

      setBookingRequests(payload);
    } catch {
      setFetchError('Unable to connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingRecordId, status) => {
    const note =
      status === 'REJECTED'
        ? window.prompt('Optional note for rejection:', 'Please update travel date and submit again.') || ''
        : '';

    setActionError(null);
    setActiveActionKey(`status-${bookingRecordId}`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/admin/${bookingRecordId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          adminNote: note,
        }),
      });

      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        setActionError(payload?.message || 'Unable to update booking status.');
        return;
      }

      setBookingRequests((current) =>
        current.map((entry) => (entry.bookingRecordId === bookingRecordId ? payload : entry))
      );
    } catch {
      setActionError('Unable to connect to backend server.');
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleDelete = async (bookingRecordId) => {
    setActionError(null);
    setActiveActionKey(`delete-${bookingRecordId}`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/admin/${bookingRecordId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await parseJsonSafe(response);
      if (!response.ok) {
        setActionError(payload?.message || 'Unable to delete booking.');
        return;
      }

      setBookingRequests((current) =>
        current.filter((entry) => entry.bookingRecordId !== bookingRecordId)
      );
    } catch {
      setActionError('Unable to connect to backend server.');
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleActionChange = (bookingRecordId, action) => {
    if (!action) {
      return;
    }

    const statusByAction = {
      APPROVE: 'APPROVED',
      REJECT: 'REJECTED',
      PENDING: 'PENDING',
    };

    const nextStatus = statusByAction[action];
    if (nextStatus) {
      handleStatusUpdate(bookingRecordId, nextStatus);
    }

    setActionSelections((current) => ({
      ...current,
      [bookingRecordId]: '',
    }));
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800">Bookings</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only users with the ADMIN role can manage booking approvals.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review traveler requests and approve or reject bookings.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBookings}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Total Requests</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{summary.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Approved</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{summary.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Rejected</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{summary.rejected}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
        {fetchError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {fetchError}
          </p>
        ) : null}
        {actionError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {actionError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by booking ID, traveler, email, or destination"
            className="w-full md:flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            disabled={routeStatusFilter !== 'ALL'}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="py-3 font-medium">Booking</th>
                <th className="py-3 font-medium">Traveler</th>
                <th className="py-3 font-medium">Tour Date</th>
                <th className="py-3 font-medium">Transport</th>
                <th className="py-3 font-medium">Travelers</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredRequests.map((entry) => (
                <tr key={entry.bookingRecordId} className="hover:bg-gray-50">
                  <td className="py-3">
                    <p className="font-semibold text-gray-800">{entry.id}</p>
                    <p className="text-xs text-gray-500">
                      {entry.destination}, {entry.country}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Requested {formatDate(entry.requestedAt)}
                    </p>
                  </td>
                  <td className="py-3">
                    <p className="font-medium text-gray-800">{entry.travelerName}</p>
                    <p className="text-xs text-gray-500">{entry.travelerEmail}</p>
                  </td>
                  <td className="py-3 text-gray-700">{formatDate(entry.travelDate)}</td>
                  <td className="py-3 text-gray-700">{transportLabels[entry.transportation] || entry.transportation}</td>
                  <td className="py-3 text-gray-700">{entry.travelersCount}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        statusStyles[entry.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {entry.status}
                    </span>
                    {entry.adminNote ? (
                      <p className="text-xs text-gray-500 mt-1 max-w-[240px]">{entry.adminNote}</p>
                    ) : null}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={actionSelections[entry.bookingRecordId] || ''}
                        disabled={Boolean(activeActionKey)}
                        onChange={(event) => {
                          const selectedAction = event.target.value;
                          setActionSelections((current) => ({
                            ...current,
                            [entry.bookingRecordId]: selectedAction,
                          }));
                          handleActionChange(entry.bookingRecordId, selectedAction);
                        }}
                        className="px-2 py-1 rounded-md text-xs border border-gray-200 bg-white text-gray-700"
                      >
                        <option value="">Set Action</option>
                        <option value="APPROVE">Approve</option>
                        <option value="REJECT">Reject</option>
                        <option value="PENDING">Set Pending</option>
                      </select>
                      <button
                        type="button"
                        disabled={Boolean(activeActionKey)}
                        onClick={() => handleDelete(entry.bookingRecordId)}
                        className="px-2 py-1 rounded-md text-xs bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredRequests.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No booking requests found.</p>
        ) : null}
      </div>
    </section>
  );
};

export default AdminBookingsPanel;
