import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyTrips } from '../lib/my-trips';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaPlaneDeparture, FaUsers } from 'react-icons/fa';
import TravelerSidebar from '../components/dashboard/traveler/TravelerSidebar';
import TravelerHeader from '../components/dashboard/traveler/TravelerHeader';
import { useAuth } from '../lib/useAuth';

const statusStyles = {
  Upcoming: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const getStatusIcon = (status) => {
  if (status === 'Upcoming') {
    return <FaPlaneDeparture className="text-blue-500" />;
  }

  if (status === 'Completed') {
    return <FaCheckCircle className="text-green-500" />;
  }

  return <FaHourglassHalf className="text-yellow-500" />;
};

const formatDate = (dateValue) => DATE_FORMATTER.format(new Date(dateValue));

const formatAmount = (amount) => INR_FORMATTER.format(Number(amount || 0));

const MyTrips = ({ statusFilter = 'All' }) => {
  const { token, user } = useAuth();
  const isTraveler = user?.role === 'USER';

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startDateDesc');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((current) => !current);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      if (!isTraveler || !token) {
        if (isMounted) {
          setTrips([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setFetchError('');

      try {
        const payload = await getMyTrips(token);
        if (isMounted) {
          setTrips(payload);
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(error?.message || 'Unable to load trips.');
          setTrips([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTrips();

    return () => {
      isMounted = false;
    };
  }, [isTraveler, token]);

  const filteredTrips = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const base = trips.filter((trip) => {
      const destination = String(trip.destination || '');
      const country = String(trip.country || '');
      const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        destination.toLowerCase().includes(normalizedSearch) ||
        country.toLowerCase().includes(normalizedSearch) ||
        String(trip.bookingId || '').toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    const sorted = [...base];

    if (sortBy === 'startDateAsc') {
      sorted.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }

    if (sortBy === 'startDateDesc') {
      sorted.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }

    if (sortBy === 'budgetHigh') {
      sorted.sort((a, b) => Number(b.budget.total || 0) - Number(a.budget.total || 0));
    }

    return sorted;
  }, [trips, searchTerm, sortBy, statusFilter]);

  const summary = useMemo(
    () => ({
      total: trips.length,
      upcoming: trips.filter((trip) => trip.status === 'Upcoming').length,
      completed: trips.filter((trip) => trip.status === 'Completed').length,
      spent: trips.reduce((sum, trip) => sum + Number(trip.budget?.spent || 0), 0),
    }),
    [trips]
  );

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
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Trips</h1>
              <p className="text-sm text-gray-500 mt-1">
              Track your itineraries, collaborators, and trip budgets in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Total Trips</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{summary.upcoming}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{summary.completed}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{formatAmount(summary.spent)}</p>
              </div>
            </div>

            <div className="glass-card p-4">
              {fetchError ? (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                  {fetchError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by destination, country, or booking ID"
                  className="w-full md:flex-1 border border-gray-200/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white/80"
                >
                  <option value="startDateDesc">Latest Start Date</option>
                  <option value="startDateAsc">Earliest Start Date</option>
                  <option value="budgetHigh">Highest Budget</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full glass-card p-8 text-center text-sm text-gray-500">
                  Loading trips...
                </div>
              ) : filteredTrips.map((trip) => (
                <article
                  key={trip.id}
                  className="glass-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img src={trip.imageUrl} alt={trip.destination} className="w-full h-48 object-cover" />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                          statusStyles[trip.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {getStatusIcon(trip.status)}
                        {trip.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-bold text-gray-800">
                      {trip.destination}, {trip.country}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Booking ID: {trip.bookingId}</p>
                    <p className="text-xs text-gray-500 mt-1">Booking Status: {trip.bookingStatus}</p>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400" />
                        <span>{Number(trip.travelersCount || trip.collaborators?.length || 0)} travelers</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-500">Budget Used</span>
                        <span className="font-semibold text-gray-700">
                          {formatAmount(trip.budget?.spent)} / {formatAmount(trip.budget?.total)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Number(trip.budget?.total || 0) === 0
                                ? 0
                                : (Number(trip.budget?.spent || 0) / Number(trip.budget?.total || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/user/dashboard/my-trips/${trip.id}`}
                      className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-5 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {!isLoading && filteredTrips.length === 0 ? (
              <div className="glass-card p-8 text-center text-sm text-gray-500">
                No trips found for this view.
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyTrips;
