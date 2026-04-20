import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import TravelerSidebar from '../components/dashboard/traveler/TravelerSidebar';
import TravelerHeader from '../components/dashboard/traveler/TravelerHeader';
import { useAuth } from '../lib/useAuth';
import { getTravelerDashboard } from '../lib/travelerDashboard';
import {
  cancelMyHotelBooking,
  createHotelBooking,
  getHotelSuggestions,
  getMyHotelBookings,
} from '../lib/hotels';

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
};

const toDateInputValue = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatMoney = (amount, currency = 'USD') => {
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

const TravelerHotels = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const { tab } = useParams();
  const activeTab = tab === 'bookings' ? 'bookings' : 'suggestions';
  const isTraveler = user?.role === 'USER';

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [quickLocation, setQuickLocation] = useState(null);

  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [activeCancelId, setActiveCancelId] = useState(null);

  const [form, setForm] = useState({
    checkInDate: toDateInputValue(7),
    checkOutDate: toDateInputValue(8),
    guestsCount: 2,
    roomCount: 1,
    specialRequest: '',
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((current) => !current);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const selectedHotel = useMemo(
    () => hotels.find((entry) => entry.id === selectedHotelId) || null,
    [hotels, selectedHotelId]
  );

  const bookingSummary = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((entry) => entry.status === 'PENDING').length,
      confirmed: bookings.filter((entry) => entry.status === 'CONFIRMED').length,
    }),
    [bookings]
  );

  const loadSuggestions = useCallback(
    async (nextDestination, nextCountry) => {
      if (!token) {
        return;
      }

      if (!String(nextDestination || '').trim() && !String(nextCountry || '').trim()) {
        setHotels([]);
        setSelectedHotelId(null);
        return;
      }

      setHotelsLoading(true);
      setHotelsError('');
      try {
        const payload = await getHotelSuggestions(token, {
          destination: nextDestination,
          country: nextCountry,
          limit: 20,
        });
        setHotels(payload);
        setSelectedHotelId(payload[0]?.id || null);
      } catch (error) {
        setHotels([]);
        setSelectedHotelId(null);
        setHotelsError(error?.message || 'Unable to load hotel suggestions.');
      } finally {
        setHotelsLoading(false);
      }
    },
    [token]
  );

  const loadBookings = useCallback(async () => {
    if (!token) {
      return;
    }

    setBookingsLoading(true);
    setBookingsError('');
    try {
      const payload = await getMyHotelBookings(token);
      setBookings(payload);
    } catch (error) {
      setBookings([]);
      setBookingsError(error?.message || 'Unable to load hotel bookings.');
    } finally {
      setBookingsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      if (!isTraveler || !token) {
        return;
      }

      const query = new URLSearchParams(location.search);
      let initialDestination = String(query.get('destination') || '').trim();
      let initialCountry = String(query.get('country') || '').trim();

      try {
        const dashboard = await getTravelerDashboard(token);
        if (!initialDestination && dashboard?.upcomingTrip?.destination) {
          initialDestination = dashboard.upcomingTrip.destination;
        }
        if (!initialCountry && dashboard?.upcomingTrip?.country) {
          initialCountry = dashboard.upcomingTrip.country;
        }
        if (dashboard?.upcomingTrip?.destination && dashboard?.upcomingTrip?.country) {
          setQuickLocation({
            destination: dashboard.upcomingTrip.destination,
            country: dashboard.upcomingTrip.country,
          });
        }
      } catch {
        // dashboard bootstrap is optional for this page
      }

      if (!isMounted) {
        return;
      }

      setDestination(initialDestination);
      setCountry(initialCountry);
      await Promise.all([loadSuggestions(initialDestination, initialCountry), loadBookings()]);
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [isTraveler, token, location.search, loadSuggestions, loadBookings]);

  const handleBookHotel = async (event) => {
    event.preventDefault();
    setBookingError('');
    setBookingMessage('');

    if (!selectedHotel) {
      setBookingError('Please select a hotel.');
      return;
    }

    if (!form.checkInDate || !form.checkOutDate || new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      setBookingError('Please provide a valid check-in and check-out date.');
      return;
    }

    setIsBooking(true);
    try {
      const payload = await createHotelBooking(token, {
        hotelId: selectedHotel.id,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        guestsCount: Math.max(1, Number(form.guestsCount || 1)),
        roomCount: Math.max(1, Number(form.roomCount || 1)),
        specialRequest: String(form.specialRequest || '').trim() || null,
      });
      setBookings((current) => [payload, ...current]);
      setBookingMessage(`Booking ${payload.bookingId} created.`);
      setForm((current) => ({ ...current, specialRequest: '' }));
    } catch (error) {
      setBookingError(error?.message || 'Unable to create hotel booking.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async (hotelBookingRecordId) => {
    setActiveCancelId(hotelBookingRecordId);
    try {
      const payload = await cancelMyHotelBooking(token, hotelBookingRecordId);
      setBookings((current) =>
        current.map((entry) =>
          entry.hotelBookingRecordId === hotelBookingRecordId ? payload : entry
        )
      );
    } catch (error) {
      setBookingsError(error?.message || 'Unable to cancel booking.');
    } finally {
      setActiveCancelId(null);
    }
  };

  if (!isTraveler) {
    return <div className="page-shell flex min-h-screen items-center justify-center">Hotels are available for traveler accounts only.</div>;
  }

  return (
    <div className="page-shell flex h-screen overflow-hidden">
      <TravelerSidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={handleCloseMobileSidebar} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <TravelerHeader onMenuToggle={handleToggleMobileSidebar} isMenuOpen={isMobileSidebarOpen} />
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-[1380px] space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Hotels</h1>
                <p className="text-sm text-gray-500 mt-1">Location-based hotel suggestions and booking management.</p>
              </div>
              <div className="flex gap-2 rounded-xl border border-white/70 bg-white/70 p-1.5">
                <Link to="/user/dashboard/hotels" className={`rounded-lg px-3 py-1.5 text-xs font-medium ${activeTab === 'suggestions' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Suggestions</Link>
                <Link to="/user/dashboard/hotels/bookings" className={`rounded-lg px-3 py-1.5 text-xs font-medium ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>My Bookings</Link>
              </div>
            </div>

            {activeTab === 'suggestions' ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                  <div className="glass-card p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Destination" className="rounded-lg border border-gray-200/70 px-3 py-2 text-sm" />
                      <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Country" className="rounded-lg border border-gray-200/70 px-3 py-2 text-sm" />
                      <button type="button" onClick={() => loadSuggestions(destination, country)} className="rounded-lg bg-blue-600 text-white text-sm font-medium px-3 py-2 hover:bg-blue-700">Find Hotels</button>
                    </div>
                    {quickLocation ? (
                      <button type="button" onClick={() => { setDestination(quickLocation.destination); setCountry(quickLocation.country); loadSuggestions(quickLocation.destination, quickLocation.country); }} className="mt-3 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                        Recommended: {quickLocation.destination}, {quickLocation.country}
                      </button>
                    ) : null}
                    {hotelsError ? <p className="mt-3 text-sm text-red-700">{hotelsError}</p> : null}
                  </div>

                  <div className="glass-card p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Suggested Hotels</h2>
                    {hotelsLoading ? <p className="text-sm text-gray-500">Loading suggestions...</p> : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hotels.map((hotel) => (
                          <button key={hotel.id} type="button" onClick={() => setSelectedHotelId(hotel.id)} className={`overflow-hidden rounded-xl border text-left ${selectedHotelId === hotel.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                            <img src={hotel.img} alt={hotel.name} className="h-32 w-full object-cover" />
                            <div className="p-3">
                              <p className="font-semibold text-gray-800">{hotel.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{hotel.destination}, {hotel.country}</p>
                              <p className="text-xs text-blue-700 font-medium mt-2">{formatMoney(hotel.pricePerNight, hotel.currency)} / night</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {!hotelsLoading && hotels.length === 0 ? <p className="text-sm text-gray-500">No hotels found.</p> : null}
                  </div>
                </div>

                <div className="glass-card p-4">
                  <h2 className="text-lg font-semibold text-gray-800">Book Selected Hotel</h2>
                  {!selectedHotel ? <p className="text-sm text-gray-500 mt-3">Select a hotel to continue.</p> : (
                    <>
                      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 p-3">
                        <p className="font-semibold text-gray-800">{selectedHotel.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedHotel.address}</p>
                        <p className="text-xs text-blue-700 font-medium mt-2">{formatMoney(selectedHotel.pricePerNight, selectedHotel.currency)} per night</p>
                      </div>
                      <form onSubmit={handleBookHotel} className="mt-4 space-y-3">
                        <input type="date" value={form.checkInDate} onChange={(event) => setForm((current) => ({ ...current, checkInDate: event.target.value }))} className="w-full rounded-lg border border-gray-200/70 px-3 py-2 text-sm" />
                        <input type="date" value={form.checkOutDate} onChange={(event) => setForm((current) => ({ ...current, checkOutDate: event.target.value }))} className="w-full rounded-lg border border-gray-200/70 px-3 py-2 text-sm" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" min="1" value={form.guestsCount} onChange={(event) => setForm((current) => ({ ...current, guestsCount: event.target.value }))} className="w-full rounded-lg border border-gray-200/70 px-3 py-2 text-sm" placeholder="Guests" />
                          <input type="number" min="1" value={form.roomCount} onChange={(event) => setForm((current) => ({ ...current, roomCount: event.target.value }))} className="w-full rounded-lg border border-gray-200/70 px-3 py-2 text-sm" placeholder="Rooms" />
                        </div>
                        <textarea rows={3} value={form.specialRequest} onChange={(event) => setForm((current) => ({ ...current, specialRequest: event.target.value }))} placeholder="Special request (optional)" className="w-full rounded-lg border border-gray-200/70 px-3 py-2 text-sm resize-y" />
                        <button type="submit" disabled={isBooking} className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-70">{isBooking ? 'Booking...' : 'Book Hotel'}</button>
                        {bookingError ? <p className="text-xs text-red-700">{bookingError}</p> : null}
                        {bookingMessage ? <p className="text-xs text-green-700">{bookingMessage}</p> : null}
                      </form>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4"><p className="text-xs text-gray-400 uppercase">Total</p><p className="text-2xl font-bold text-gray-800 mt-1">{bookingSummary.total}</p></div>
                  <div className="glass-card p-4"><p className="text-xs text-gray-400 uppercase">Pending</p><p className="text-2xl font-bold text-amber-700 mt-1">{bookingSummary.pending}</p></div>
                  <div className="glass-card p-4"><p className="text-xs text-gray-400 uppercase">Confirmed</p><p className="text-2xl font-bold text-green-700 mt-1">{bookingSummary.confirmed}</p></div>
                </div>
                <div className="glass-card p-4">
                  {bookingsError ? <p className="mb-3 text-sm text-red-700">{bookingsError}</p> : null}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-sm">
                      <thead><tr className="border-b border-gray-100 text-left text-gray-500"><th className="py-3">Booking</th><th className="py-3">Hotel</th><th className="py-3">Stay</th><th className="py-3">Amount</th><th className="py-3">Status</th><th className="py-3">Action</th></tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookingsLoading ? <tr><td colSpan={6} className="py-6 text-center text-gray-500">Loading bookings...</td></tr> : bookings.map((entry) => (
                          <tr key={entry.hotelBookingRecordId}>
                            <td className="py-3"><p className="font-semibold text-gray-800">{entry.bookingId}</p><p className="text-xs text-gray-500 mt-1">{formatDate(entry.requestedAt)}</p></td>
                            <td className="py-3"><p className="font-medium text-gray-800">{entry.hotelName}</p><p className="text-xs text-gray-500">{entry.destination}, {entry.country}</p></td>
                            <td className="py-3 text-gray-700">{formatDate(entry.checkInDate)} - {formatDate(entry.checkOutDate)}</td>
                            <td className="py-3 text-gray-700">{formatMoney(entry.totalAmount, entry.currency)}</td>
                            <td className="py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[entry.status] || 'bg-gray-100 text-gray-700'}`}>{entry.status}</span></td>
                            <td className="py-3">
                              {entry.status === 'PENDING' || entry.status === 'CONFIRMED' ? (
                                <button type="button" disabled={activeCancelId === entry.hotelBookingRecordId} onClick={() => handleCancelBooking(entry.hotelBookingRecordId)} className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-70">{activeCancelId === entry.hotelBookingRecordId ? 'Cancelling...' : 'Cancel'}</button>
                              ) : <span className="text-xs text-gray-400">No action</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!bookingsLoading && bookings.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">No hotel bookings found.</p> : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TravelerHotels;
