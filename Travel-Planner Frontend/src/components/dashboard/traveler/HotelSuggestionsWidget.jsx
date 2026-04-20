import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHotelSuggestions } from '../../../lib/hotels';

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const formatMoney = (amount, currency = 'USD') => {
  if (currency === 'USD') {
    return USD_FORMATTER.format(Number(amount || 0));
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0)}`;
  }
};

const HotelSuggestionsWidget = ({ token, upcomingTrip = null }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const destination = String(upcomingTrip?.destination || '').trim();
  const country = String(upcomingTrip?.country || '').trim();

  useEffect(() => {
    let isMounted = true;

    const loadSuggestions = async () => {
      if (!token || !destination || !country) {
        if (isMounted) {
          setSuggestions([]);
          setIsLoading(false);
          setErrorMessage('');
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const payload = await getHotelSuggestions(token, {
          destination,
          country,
          limit: 3,
        });

        if (isMounted) {
          setSuggestions(payload);
        }
      } catch (error) {
        if (isMounted) {
          setSuggestions([]);
          setErrorMessage(error?.message || 'Unable to load hotel picks.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      isMounted = false;
    };
  }, [token, destination, country]);

  const hotelsPagePath = useMemo(() => {
    const params = new URLSearchParams();
    if (destination) {
      params.set('destination', destination);
    }
    if (country) {
      params.set('country', country);
    }

    const query = params.toString();
    return query ? `/user/dashboard/hotels?${query}` : '/user/dashboard/hotels';
  }, [destination, country]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-primary text-lg font-semibold text-slate-900">Hotel Suggestions</h3>
          <p className="text-xs text-slate-500">
            {destination && country
              ? `Recommended for ${destination}, ${country}`
              : 'Add an upcoming trip to unlock location-based stays'}
          </p>
        </div>
        <Link
          to={hotelsPagePath}
          className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/15"
        >
          Manage Hotels
        </Link>
      </div>

      {errorMessage ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">Loading hotel picks...</div>
      ) : suggestions.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
          No hotel suggestions available for this location yet.
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((hotel) => (
            <div
              key={hotel.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5"
            >
              <img
                src={hotel.img}
                alt={hotel.name}
                className="h-16 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{hotel.name}</p>
                <p className="truncate text-[11px] text-slate-500">
                  {hotel.destination}, {hotel.country}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                  <span>{formatMoney(hotel.pricePerNight, hotel.currency)} / night</span>
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-700">
                    {Number(hotel.rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelSuggestionsWidget;
