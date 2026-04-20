import React, { useCallback, useEffect, useState } from 'react';
import TravelerSidebar from '../components/dashboard/traveler/TravelerSidebar';
import TravelerHeader from '../components/dashboard/traveler/TravelerHeader';
import ActiveTripsWidget from '../components/dashboard/traveler/ActiveTripsWidget';
import UpcomingTripWidget from '../components/dashboard/traveler/UpcomingTripWidget';
import SavedPlacesWidget from '../components/dashboard/traveler/SavedPlacesWidget';
import RemainingBudgetWidget from '../components/dashboard/traveler/RemainingBudgetWidget';
import UpcomingTripHero from '../components/dashboard/traveler/UpcomingTripHero';
import ExploreDestinationsWidget from '../components/dashboard/traveler/ExploreDestinationsWidget';
import BudgetSummaryWidget from '../components/dashboard/traveler/BudgetSummaryWidget';
import HotelSuggestionsWidget from '../components/dashboard/traveler/HotelSuggestionsWidget';
import { useAuth } from '../lib/useAuth';
import { getTravelerDashboard } from '../lib/travelerDashboard';
import { formatInr } from '../lib/pricing';

export default function UserTravelDashboard() {
  const { user, token } = useAuth();
  const isTraveler = user?.role === 'USER';

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((current) => !current);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!isTraveler || !token) {
        if (isMounted) {
          setDashboardData(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setFetchError('');

      try {
        const payload = await getTravelerDashboard(token);
        if (isMounted) {
          setDashboardData(payload);
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(error?.message || 'Unable to load dashboard.');
          setDashboardData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [isTraveler, token]);

  const travelerName = dashboardData?.travelerName || user?.name || 'Traveler';
  const overview = dashboardData?.overview;
  const totalUpcomingTrips = Number(overview?.upcomingTrips || 0);
  const remainingBudget = Number(overview?.remainingBudget || 0);
  const savedPlacesTotal = Number(dashboardData?.savedPlaces?.total || 0);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#f1f5ff] font-secondary text-slate-900">
      <div className="pointer-events-none absolute -left-20 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-9rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />

      <TravelerSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleCloseMobileSidebar}
      />

      <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <TravelerHeader
          onMenuToggle={handleToggleMobileSidebar}
          isMenuOpen={isMobileSidebarOpen}
        />

        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-[1380px]">
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/75 px-6 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-8 md:py-7">
              <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-2xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-16 -left-12 h-36 w-36 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
              <div className="relative">
                <h1 className="font-primary text-2xl font-semibold text-slate-900 md:text-[1.75rem]">
                  Welcome back, {travelerName}
                </h1>
                <p className="mt-1 text-sm text-slate-600 md:text-base">
                  Track your journey, budget, and destinations from one place.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-medium md:text-sm">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                    {totalUpcomingTrips} upcoming {totalUpcomingTrips === 1 ? 'trip' : 'trips'}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                    Budget left: {formatInr(remainingBudget)}
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                    {savedPlacesTotal} saved places
                  </span>
                </div>
              </div>
            </div>

            {fetchError ? (
              <p className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-sm">
                {fetchError}
              </p>
            ) : null}

            {isLoading ? (
              <div className="rounded-3xl border border-white/70 bg-white/80 p-10 text-center text-sm text-slate-500 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                Loading dashboard...
              </div>
            ) : (
              <>
                <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <ActiveTripsWidget
                    activeTrips={dashboardData?.activeTrips || []}
                    totalActive={Number(overview?.upcomingTrips || 0)}
                  />
                  <UpcomingTripWidget upcomingTrip={dashboardData?.upcomingTrip || null} />
                  <SavedPlacesWidget savedPlaces={dashboardData?.savedPlaces || { total: 0, topPlaces: [] }} />
                  <RemainingBudgetWidget
                    overview={overview || { totalBudget: 0, spentBudget: 0, remainingBudget: 0 }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <UpcomingTripHero upcomingTrip={dashboardData?.upcomingTrip || null} />
                  <div className="space-y-6">
                    <ExploreDestinationsWidget destinations={dashboardData?.exploreDestinations || []} />
                    <HotelSuggestionsWidget token={token} upcomingTrip={dashboardData?.upcomingTrip || null} />
                    <BudgetSummaryWidget activities={dashboardData?.budgetActivities || []} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
