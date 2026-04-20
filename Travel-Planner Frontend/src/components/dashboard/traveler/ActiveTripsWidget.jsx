import React from 'react';
import StatCard from './StatCard';
import { FaSuitcase } from 'react-icons/fa';

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

const ActiveTripsWidget = ({ activeTrips = [], totalActive = 0 }) => (
  <StatCard>
    <div className="mb-3 flex items-start justify-between">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <FaSuitcase className="text-[11px]" /> Active Trips
      </div>
      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        {totalActive}
      </span>
    </div>

    <div className="space-y-2.5">
      {activeTrips.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">No active trips right now.</p>
      ) : activeTrips.map((trip) => (
        <div key={trip.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-3 py-2 text-sm">
          <span className="font-semibold text-slate-700">{trip.destination}</span>
          <span className="text-xs text-slate-500">
            {formatDateLabel(trip.startDate)} - {formatDateLabel(trip.endDate)}
          </span>
        </div>
      ))}
    </div>
  </StatCard>
);

export default ActiveTripsWidget;
