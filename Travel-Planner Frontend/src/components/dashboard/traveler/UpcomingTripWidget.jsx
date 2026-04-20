import React from 'react';
import StatCard from './StatCard';
import { FaPlane } from 'react-icons/fa';

const formatDateLabel = (value) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '--';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const UpcomingTripWidget = ({ upcomingTrip }) => (
  <StatCard>
    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
      <FaPlane className="-rotate-45 text-[11px]" /> Upcoming Trip
    </div>

    <div>
      {upcomingTrip ? (
        <>
          <h3 className="font-primary text-lg font-semibold text-slate-900">
            {upcomingTrip.destination}, {upcomingTrip.country}
          </h3>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-primary text-4xl font-semibold leading-none text-slate-900">
              {upcomingTrip.daysLeft}
            </span>
            <span className="text-sm text-slate-500">
              {upcomingTrip.daysLeft === 1 ? 'Day Left' : 'Days Left'}
            </span>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            <span>{formatDateLabel(upcomingTrip.startDate)}</span>
            <span className="text-slate-400">to</span>
            <span>{formatDateLabel(upcomingTrip.endDate)}</span>
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">No upcoming trip found.</p>
      )}
    </div>
  </StatCard>
);

export default UpcomingTripWidget;
