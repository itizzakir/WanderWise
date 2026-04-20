import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../shared/StatCard';
import BookingsOverviewChart from './BookingsOverviewChart';
import UserManagementTable from './UserManagementTable';
import RecentBookingsTable from './RecentBookingsTable';
import BudgetSummary from './BudgetSummary';
import SystemAlerts from './SystemAlerts';
import PopularDestinations from './PopularDestinations';
import SectionTitle from '../shared/SectionTitle';
import { formatInr } from '../../../lib/pricing';
import { useAuth } from '../../../lib/useAuth';
import { getAdminDashboardOverview } from '../../../lib/adminDashboard';

const DEFAULT_OVERVIEW = {
  totals: {
    totalUsers: 0,
    activeTrips: 0,
    totalBookings: 0,
    totalRevenue: 0,
  },
  bookingsOverview: [],
  users: [],
  recentBookings: [],
  budget: {
    spent: 0,
    target: 0,
    remaining: 0,
  },
  systemAlerts: [],
  popularDestinations: [],
};

const AdminOverviewContent = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [overview, setOverview] = useState(DEFAULT_OVERVIEW);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      if (!isAdmin || !token) {
        if (isMounted) {
          setOverview(DEFAULT_OVERVIEW);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setFetchError('');

      try {
        const payload = await getAdminDashboardOverview(token);
        if (isMounted) {
          setOverview({
            ...DEFAULT_OVERVIEW,
            ...payload,
          });
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(error?.message || 'Unable to load admin dashboard overview.');
          setOverview(DEFAULT_OVERVIEW);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, token]);

  const firstAlert = useMemo(
    () => (Array.isArray(overview.systemAlerts) && overview.systemAlerts.length > 0 ? overview.systemAlerts[0] : null),
    [overview.systemAlerts]
  );

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800">Admin Overview</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only users with the ADMIN role can access this dashboard.
        </p>
      </div>
    );
  }

  return (
    <>
      {fetchError ? (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          {fetchError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={overview.totals.totalUsers} subtext="Registered accounts" />
        <StatCard title="Active Trips" value={overview.totals.activeTrips} subtext="Upcoming approved and pending trips" />
        <StatCard
          title="Total Bookings"
          value={overview.totals.totalBookings}
          subtext="All traveler requests"
          icon={<div className="flex gap-1 text-xs">B</div>}
        />
        <StatCard
          title="Total Revenue"
          value={formatInr(overview.totals.totalRevenue)}
          subtext="Successful payment volume"
          color="text-yellow-500"
        />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-500">
          Loading admin overview...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            <BookingsOverviewChart chartData={overview.bookingsOverview} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UserManagementTable users={overview.users} />
              <RecentBookingsTable bookings={overview.recentBookings} />
              <BudgetSummary
                budget={overview.budget}
                onView={() => navigate('/admin/dashboard/budget-payments')}
                onEdit={() => navigate('/admin/dashboard/settings')}
              />
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <SectionTitle title="System Snapshot" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget Target</span>
                    <span className="font-semibold text-gray-800">{formatInr(overview.budget.target)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget Remaining</span>
                    <span className="font-semibold text-green-700">{formatInr(overview.budget.remaining)}</span>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 mt-3">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Top Alert</p>
                    <p className="font-semibold text-gray-700 mt-1">{firstAlert?.title || 'All systems operational'}</p>
                    <p className="text-xs text-gray-500 mt-1">{firstAlert?.message || 'No active alerts.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <PopularDestinations destinations={overview.popularDestinations} />
            <SystemAlerts alerts={overview.systemAlerts} />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOverviewContent;
