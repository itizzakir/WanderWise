import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../lib/useAuth';
import {
  createAdminHotel,
  deleteAdminHotel,
  getAdminHotelBookings,
  getAdminHotels,
  updateAdminHotel,
  updateAdminHotelBookingStatus,
} from '../../../lib/hotels';

const emptyHotelForm = {
  name: '',
  destination: '',
  country: '',
  address: '',
  pricePerNight: '',
  currency: 'INR',
  rating: '4.0',
  img: '',
  amenitiesText: '',
};

const mapHotelToForm = (hotel) => ({
  name: hotel.name || '',
  destination: hotel.destination || '',
  country: hotel.country || '',
  address: hotel.address || '',
  pricePerNight: hotel.pricePerNight != null ? String(hotel.pricePerNight) : '',
  currency: hotel.currency || 'INR',
  rating: hotel.rating != null ? String(hotel.rating) : '4.0',
  img: hotel.img || '',
  amenitiesText: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : '',
});

const parseAmenities = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatMoney = (amount, currency = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Math.round(Number(amount || 0))}`;
  }
};

const AdminHotelsPanel = () => {
  const { user, token } = useAuth();
  const { tab } = useParams();
  const activeTab = tab === 'bookings' ? 'bookings' : 'inventory';
  const isAdmin = user?.role === 'ADMIN';

  const [hotels, setHotels] = useState([]);
  const [hotelSearchTerm, setHotelSearchTerm] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [editorMode, setEditorMode] = useState('view');
  const [hotelForm, setHotelForm] = useState(emptyHotelForm);
  const [isHotelsLoading, setIsHotelsLoading] = useState(true);
  const [hotelError, setHotelError] = useState('');
  const [hotelMessage, setHotelMessage] = useState('');
  const [isSavingHotel, setIsSavingHotel] = useState(false);
  const [isDeletingHotel, setIsDeletingHotel] = useState(false);

  const [hotelBookings, setHotelBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [activeBookingAction, setActiveBookingAction] = useState(null);

  const selectedHotel = useMemo(
    () => hotels.find((entry) => entry.id === selectedHotelId) || null,
    [hotels, selectedHotelId]
  );

  const filteredHotels = useMemo(() => {
    const query = hotelSearchTerm.trim().toLowerCase();
    if (!query) {
      return hotels;
    }

    return hotels.filter((entry) => {
      const location = `${entry.destination} ${entry.country}`.toLowerCase();
      return entry.name.toLowerCase().includes(query) || location.includes(query);
    });
  }, [hotels, hotelSearchTerm]);

  const inventorySummary = useMemo(
    () => ({
      total: hotels.length,
      destinations: new Set(hotels.map((entry) => `${entry.destination}|${entry.country}`)).size,
      avgPrice:
        hotels.length === 0
          ? 0
          : hotels.reduce((sum, entry) => sum + Number(entry.pricePerNight || 0), 0) / hotels.length,
    }),
    [hotels]
  );

  const loadHotels = useCallback(async () => {
    if (!isAdmin || !token) {
      setHotels([]);
      setIsHotelsLoading(false);
      return;
    }

    setIsHotelsLoading(true);
    setHotelError('');
    try {
      const payload = await getAdminHotels(token);
      setHotels(payload);
      setSelectedHotelId((current) => current || payload[0]?.id || null);
    } catch (error) {
      setHotelError(error?.message || 'Unable to load hotels.');
      setHotels([]);
      setSelectedHotelId(null);
    } finally {
      setIsHotelsLoading(false);
    }
  }, [isAdmin, token]);

  const loadHotelBookings = useCallback(async () => {
    if (!isAdmin || !token) {
      setHotelBookings([]);
      setIsBookingsLoading(false);
      return;
    }

    setIsBookingsLoading(true);
    setBookingError('');
    try {
      const payload = await getAdminHotelBookings(token);
      setHotelBookings(payload);
    } catch (error) {
      setBookingError(error?.message || 'Unable to load hotel bookings.');
      setHotelBookings([]);
    } finally {
      setIsBookingsLoading(false);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    loadHotels();
    loadHotelBookings();
  }, [loadHotels, loadHotelBookings]);

  useEffect(() => {
    if (editorMode === 'view') {
      setHotelForm(selectedHotel ? mapHotelToForm(selectedHotel) : emptyHotelForm);
    }
  }, [selectedHotel, editorMode]);

  const handleSaveHotel = async () => {
    setHotelError('');
    setHotelMessage('');

    const payload = {
      name: hotelForm.name.trim(),
      destination: hotelForm.destination.trim(),
      country: hotelForm.country.trim(),
      address: hotelForm.address.trim(),
      pricePerNight: Number(hotelForm.pricePerNight || 0),
      currency: hotelForm.currency.trim().toUpperCase(),
      rating: Number(hotelForm.rating || 0),
      img: hotelForm.img.trim(),
      amenities: parseAmenities(hotelForm.amenitiesText),
    };

    if (!payload.name || !payload.destination || !payload.country || !payload.address || !payload.img) {
      setHotelError('Name, destination, country, address, and image URL are required.');
      return;
    }

    if (!Number.isFinite(payload.pricePerNight) || payload.pricePerNight <= 0) {
      setHotelError('Price per night must be greater than 0.');
      return;
    }

    if (!Number.isFinite(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      setHotelError('Rating must be between 1 and 5.');
      return;
    }

    setIsSavingHotel(true);
    try {
      if (editorMode === 'create') {
        const created = await createAdminHotel(token, payload);
        setHotels((current) => [created, ...current]);
        setSelectedHotelId(created.id);
        setHotelMessage('Hotel added successfully.');
      } else if (editorMode === 'edit' && selectedHotelId) {
        const updated = await updateAdminHotel(token, selectedHotelId, payload);
        setHotels((current) => current.map((entry) => (entry.id === selectedHotelId ? updated : entry)));
        setHotelMessage('Hotel updated successfully.');
      }

      setEditorMode('view');
    } catch (error) {
      setHotelError(error?.message || 'Unable to save hotel.');
    } finally {
      setIsSavingHotel(false);
    }
  };

  const handleDeleteSelectedHotel = async () => {
    if (!selectedHotelId) {
      return;
    }

    const isConfirmed = window.confirm('Delete selected hotel?');
    if (!isConfirmed) {
      return;
    }

    setIsDeletingHotel(true);
    setHotelError('');
    setHotelMessage('');
    try {
      await deleteAdminHotel(token, selectedHotelId);
      setHotels((current) => {
        const filtered = current.filter((entry) => entry.id !== selectedHotelId);
        setSelectedHotelId(filtered[0]?.id || null);
        return filtered;
      });
      setEditorMode('view');
      setHotelMessage('Hotel deleted successfully.');
    } catch (error) {
      setHotelError(error?.message || 'Unable to delete hotel.');
    } finally {
      setIsDeletingHotel(false);
    }
  };

  const handleBookingStatusUpdate = async (hotelBookingRecordId, status) => {
    setActiveBookingAction(hotelBookingRecordId);
    setBookingError('');
    try {
      const note =
        status === 'REJECTED'
          ? window.prompt('Optional rejection note:', 'Unavailable for selected dates.') || ''
          : '';
      const payload = await updateAdminHotelBookingStatus(token, hotelBookingRecordId, status, note);
      setHotelBookings((current) =>
        current.map((entry) =>
          entry.hotelBookingRecordId === hotelBookingRecordId ? payload : entry
        )
      );
    } catch (error) {
      setBookingError(error?.message || 'Unable to update booking status.');
    } finally {
      setActiveBookingAction(null);
    }
  };

  if (!isAdmin) {
    return <div className="bg-white rounded-xl p-6 text-sm text-gray-500">Only ADMIN users can manage hotels.</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hotels</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hotel inventory and hotel-booking approvals.</p>
        </div>
        <div className="flex gap-2 rounded-xl border border-gray-200 bg-white p-1.5">
          <Link to="/admin/dashboard/hotels" className={`rounded-lg px-3 py-1.5 text-xs font-medium ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Inventory</Link>
          <Link to="/admin/dashboard/hotels/bookings" className={`rounded-lg px-3 py-1.5 text-xs font-medium ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Hotel Bookings</Link>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-400 uppercase">Total Hotels</p><p className="text-2xl font-bold text-gray-800 mt-1">{inventorySummary.total}</p></div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-400 uppercase">Destinations</p><p className="text-2xl font-bold text-blue-700 mt-1">{inventorySummary.destinations}</p></div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-400 uppercase">Avg Price/Night</p><p className="text-2xl font-bold text-gray-800 mt-1">{formatMoney(inventorySummary.avgPrice, 'INR')}</p></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex gap-2 mb-4">
                <input value={hotelSearchTerm} onChange={(event) => setHotelSearchTerm(event.target.value)} placeholder="Search hotels or destination" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <button type="button" onClick={loadHotels} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Refresh</button>
              </div>
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {isHotelsLoading ? <p className="text-sm text-gray-500">Loading hotels...</p> : filteredHotels.map((hotel) => (
                  <button key={hotel.id} type="button" onClick={() => { setSelectedHotelId(hotel.id); setEditorMode('view'); }} className={`w-full rounded-lg border p-3 text-left ${selectedHotelId === hotel.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <p className="font-semibold text-gray-800">{hotel.name}</p>
                    <p className="text-xs text-gray-500">{hotel.destination}, {hotel.country}</p>
                    <p className="text-xs text-blue-700 mt-1">{formatMoney(hotel.pricePerNight, hotel.currency)}/night</p>
                  </button>
                ))}
                {!isHotelsLoading && filteredHotels.length === 0 ? <p className="text-sm text-gray-500">No hotels found.</p> : null}
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setEditorMode('create'); setHotelForm(emptyHotelForm); setHotelMessage(''); setHotelError(''); }} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700">Add New Hotel</button>
                <button type="button" onClick={() => { if (selectedHotel) { setEditorMode('edit'); setHotelForm(mapHotelToForm(selectedHotel)); setHotelMessage(''); setHotelError(''); } }} disabled={!selectedHotel} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Edit Selected</button>
                <button type="button" onClick={handleDeleteSelectedHotel} disabled={!selectedHotel || isDeletingHotel} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60">{isDeletingHotel ? 'Deleting...' : 'Delete Selected'}</button>
              </div>

              {hotelError ? <p className="text-sm text-red-700">{hotelError}</p> : null}
              {hotelMessage ? <p className="text-sm text-green-700">{hotelMessage}</p> : null}

              {(editorMode === 'create' || editorMode === 'edit') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={hotelForm.name} onChange={(event) => setHotelForm((current) => ({ ...current, name: event.target.value }))} placeholder="Hotel Name" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input value={hotelForm.destination} onChange={(event) => setHotelForm((current) => ({ ...current, destination: event.target.value }))} placeholder="Destination" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input value={hotelForm.country} onChange={(event) => setHotelForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input value={hotelForm.address} onChange={(event) => setHotelForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input type="number" min="1" step="1" value={hotelForm.pricePerNight} onChange={(event) => setHotelForm((current) => ({ ...current, pricePerNight: event.target.value }))} placeholder="Price Per Night" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input value={hotelForm.currency} onChange={(event) => setHotelForm((current) => ({ ...current, currency: event.target.value }))} placeholder="Currency (INR)" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input type="number" min="1" max="5" step="0.1" value={hotelForm.rating} onChange={(event) => setHotelForm((current) => ({ ...current, rating: event.target.value }))} placeholder="Rating" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <input value={hotelForm.img} onChange={(event) => setHotelForm((current) => ({ ...current, img: event.target.value }))} placeholder="Image URL" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                  <textarea value={hotelForm.amenitiesText} onChange={(event) => setHotelForm((current) => ({ ...current, amenitiesText: event.target.value }))} placeholder="Amenities (comma separated)" rows={3} className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm resize-y" />
                  <div className="md:col-span-2 flex gap-2">
                    <button type="button" onClick={handleSaveHotel} disabled={isSavingHotel} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70">{isSavingHotel ? 'Saving...' : editorMode === 'create' ? 'Create Hotel' : 'Save Changes'}</button>
                    <button type="button" onClick={() => setEditorMode('view')} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              ) : selectedHotel ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">{selectedHotel.name}</h2>
                  <img src={selectedHotel.img} alt={selectedHotel.name} className="h-56 w-full rounded-xl object-cover border border-gray-100" />
                  <p className="text-sm text-gray-600">{selectedHotel.address}</p>
                  <p className="text-sm text-gray-600">{selectedHotel.destination}, {selectedHotel.country}</p>
                  <p className="text-sm font-semibold text-blue-700">{formatMoney(selectedHotel.pricePerNight, selectedHotel.currency)} per night</p>
                </div>
              ) : <p className="text-sm text-gray-500">Select a hotel to view details.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          {bookingError ? <p className="mb-3 text-sm text-red-700">{bookingError}</p> : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px] text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-gray-500"><th className="py-3">Booking</th><th className="py-3">Traveler</th><th className="py-3">Hotel</th><th className="py-3">Stay</th><th className="py-3">Amount</th><th className="py-3">Status</th><th className="py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {isBookingsLoading ? <tr><td colSpan={7} className="py-7 text-center text-gray-500">Loading hotel bookings...</td></tr> : hotelBookings.map((entry) => (
                  <tr key={entry.hotelBookingRecordId}>
                    <td className="py-3"><p className="font-semibold text-gray-800">{entry.bookingId}</p><p className="text-xs text-gray-500">{formatDate(entry.requestedAt)}</p></td>
                    <td className="py-3"><p className="font-medium text-gray-800">{entry.travelerName}</p><p className="text-xs text-gray-500">{entry.travelerEmail}</p></td>
                    <td className="py-3"><p className="font-medium text-gray-800">{entry.hotelName}</p><p className="text-xs text-gray-500">{entry.destination}, {entry.country}</p></td>
                    <td className="py-3 text-gray-700">{formatDate(entry.checkInDate)} - {formatDate(entry.checkOutDate)} ({entry.nights} nights)</td>
                    <td className="py-3 text-gray-700">{formatMoney(entry.totalAmount, entry.currency)}</td>
                    <td className="py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[entry.status] || 'bg-gray-100 text-gray-700'}`}>{entry.status}</span></td>
                    <td className="py-3">
                      <select disabled={activeBookingAction === entry.hotelBookingRecordId} value="" onChange={(event) => { const status = event.target.value; if (status) { handleBookingStatusUpdate(entry.hotelBookingRecordId, status); } }} className="rounded-md border border-gray-200 px-2 py-1 text-xs bg-white">
                        <option value="">Set Status</option>
                        <option value="CONFIRMED">Confirm</option>
                        <option value="REJECTED">Reject</option>
                        <option value="CANCELLED">Cancel</option>
                        <option value="PENDING">Set Pending</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isBookingsLoading && hotelBookings.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">No hotel bookings available.</p> : null}
        </div>
      )}
    </section>
  );
};

export default AdminHotelsPanel;
