import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const ExploreDestinationsWidget = ({ destinations = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDestinations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return destinations;
    }

    return destinations.filter((entry) => {
      const destination = String(entry.destination || '').toLowerCase();
      const country = String(entry.country || '').toLowerCase();
      return destination.includes(normalizedSearch) || country.includes(normalizedSearch);
    });
  }, [destinations, searchTerm]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-primary text-lg font-semibold text-slate-900">Explore Destinations</h3>
        <Link to="/tours" className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/15">
          View All
        </Link>
      </div>

      <div className="relative mb-4">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Where do you want to go?"
          className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-primary/35 focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filteredDestinations.length === 0 ? (
          <div className="col-span-3 flex h-24 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">
            No destinations found
          </div>
        ) : (
          filteredDestinations.slice(0, 3).map((dest, index) => (
            <Link
              key={dest.slug || `${dest.destination}-${index}`}
              to={dest.slug ? `/tours/${dest.slug}` : '/tours'}
              className="group relative h-24 overflow-hidden rounded-xl"
            >
              <img
                src={dest.imageUrl}
                alt={dest.destination}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="truncate text-[10px] font-semibold tracking-wide text-white">{dest.destination}</p>
                <p className="truncate text-[10px] text-white/80">{dest.country}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ExploreDestinationsWidget;
