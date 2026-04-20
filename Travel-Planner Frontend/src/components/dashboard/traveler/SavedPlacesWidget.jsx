import React from 'react';
import StatCard from './StatCard';
import { FaMapMarkerAlt, FaSuitcase, FaHotel, FaCamera } from 'react-icons/fa';

const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60';

const SavedPlacesWidget = ({ savedPlaces }) => {
  const topPlaces = Array.isArray(savedPlaces?.topPlaces) ? savedPlaces.topPlaces : [];
  const placeLabel = topPlaces
    .slice(0, 2)
    .map((entry) => entry.destination)
    .filter(Boolean)
    .join(' | ');

  return (
    <>
      <StatCard>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          <FaMapMarkerAlt className="text-[11px]" /> Saved Places
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="font-primary text-4xl font-semibold leading-none text-slate-900">
            {Number(savedPlaces?.total || 0)}
          </span>
          <div className="mb-1 ml-2 flex gap-2 text-base text-slate-400">
            <FaSuitcase />
            <FaHotel />
            <FaCamera />
          </div>
        </div>

        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {placeLabel || 'No destinations saved yet'}
        </p>
      </StatCard>

      <StatCard className="p-3">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <FaMapMarkerAlt className="text-[11px]" /> Top Picks
        </div>

        <div className="grid h-full min-h-[88px] grid-cols-3 gap-2 overflow-hidden rounded-xl">
          {topPlaces.length === 0 ? (
            <div className="col-span-3 flex h-full min-h-[88px] items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">
              No saved places
            </div>
          ) : (
            topPlaces.slice(0, 3).map((entry, index) => (
              <div
                key={`${entry.destination}-${index}`}
                className="group relative h-full min-h-[88px] overflow-hidden rounded-lg bg-slate-200"
              >
                <img
                  src={entry.imageUrl || FALLBACK_IMAGE_URL}
                  alt={entry.destination}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <span className="absolute bottom-1.5 left-2 right-2 truncate text-[10px] font-semibold text-white">
                  {entry.destination || 'Destination'}
                </span>
              </div>
            ))
          )}
        </div>
      </StatCard>
    </>
  );
};

export default SavedPlacesWidget;
