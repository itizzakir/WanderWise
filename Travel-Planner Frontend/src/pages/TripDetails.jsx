
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyTripDetails } from '../lib/my-trips';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRupeeSign } from 'react-icons/fa';
import { useAuth } from '../lib/useAuth';

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const TripDetails = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const isTraveler = user?.role === 'USER';
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTrip = async () => {
      if (!isTraveler || !token || !id) {
        if (isMounted) {
          setTrip(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setFetchError('');

      try {
        const payload = await getMyTripDetails(token, id);
        if (isMounted) {
          setTrip(payload);
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(error?.message || 'Unable to load trip details.');
          setTrip(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTrip();

    return () => {
      isMounted = false;
    };
  }, [id, isTraveler, token]);

  const budgetProgress = useMemo(() => {
    const total = Number(trip?.budget?.total || 0);
    const spent = Number(trip?.budget?.spent || 0);
    if (total <= 0) {
      return 0;
    }
    return Math.min(100, (spent / total) * 100);
  }, [trip]);

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-600">Loading trip details...</p>
      </div>
    );
  }

  if (!trip || fetchError) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen px-4">
        <div className="glass-card p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            {fetchError ? 'Unable to load trip' : 'Trip not found'}
          </h2>
          {fetchError ? (
            <p className="text-sm text-red-600 mb-3">{fetchError}</p>
          ) : null}
          <Link to="/user/dashboard/my-trips" className="text-blue-600 hover:underline">
            &larr; Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];
  const collaborators = Array.isArray(trip.collaborators) ? trip.collaborators : [];

  return (
    <div className="page-shell min-h-screen">
      <div className="relative h-80">
        <img src={trip.imageUrl} alt={trip.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white text-center">
            {trip.destination}, {trip.country}
          </h1>
        </div>
        <div className="absolute top-4 left-4">
          <Link to="/user/dashboard/my-trips" className="flex items-center text-white bg-black/50 px-4 py-2 rounded-full hover:bg-black/75 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Trips
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10 pt-8 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 glass-card p-8">
            <div className="flex items-center mb-6">
              <FaMapMarkerAlt className="text-2xl text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-800">{trip.destination}, {trip.country}</h2>
            </div>
            <div className="flex items-center text-gray-600 mb-6">
              <FaCalendarAlt className="mr-3" />
              <span>{formatDate(trip.startDate)} to {formatDate(trip.endDate)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-sm">
              <div className="rounded-lg border border-white/70 bg-white/70 p-3">
                <p className="text-gray-500">Booking ID</p>
                <p className="font-semibold text-gray-800">{trip.bookingId}</p>
              </div>
              <div className="rounded-lg border border-white/70 bg-white/70 p-3">
                <p className="text-gray-500">Booking Status</p>
                <p className="font-semibold text-gray-800">{trip.bookingStatus}</p>
              </div>
              <div className="rounded-lg border border-white/70 bg-white/70 p-3">
                <p className="text-gray-500">Transportation</p>
                <p className="font-semibold text-gray-800">{trip.transportation}</p>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Itinerary</h3>
            <div className="space-y-4">
              {itinerary.map((entry) => (
                <div key={entry.day} className="flex items-start">
                  <div className="w-4 h-4 bg-blue-600 rounded-full mt-1.5 mr-4"></div>
                  <p>Day {entry.day}: {entry.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Budget & Collaborators */}
          <div className="space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FaRupeeSign className="mr-2 text-green-500"/>Budget Overview</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Spent:</span>
                <span className="font-bold text-lg text-red-500">{formatAmount(trip.budget?.spent)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-lg text-green-500">{formatAmount(trip.budget?.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full" style={{ width: `${budgetProgress}%` }}></div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaUsers className="mr-2 text-purple-500"/>Travelers
              </h3>
              <div className="flex space-x-4">
                {collaborators.map((c) => (
                  <div key={c.id} className="text-center">
                    <img src={c.avatarUrl} alt={c.name} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-purple-500"/>
                    <p className="text-gray-700">{c.name}</p>
                  </div>
                ))}
                 {collaborators.length === 0 && (
                   <p className="text-gray-500">
                     {trip.travelersCount} traveler(s) are included in this booking.
                   </p>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
