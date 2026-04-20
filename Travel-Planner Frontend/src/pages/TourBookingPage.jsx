import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PlusCircle, XCircle } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { formatInr, getTourPricePerTraveler } from '../lib/pricing';

const PENDING_BOOKING_STORAGE_KEY = 'pendingTourBookingCheckout';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const bookingSchema = yup.object({
  date: yup.date().required('Date is required').min(new Date(), 'Date cannot be in the past'),
  transportation: yup.string().required('Transportation is required'),
  travelers: yup.array().of(
    yup.object({
      name: yup.string().required('Name is required'),
      age: yup.number().typeError('Age must be a number').required('Age is required').min(1).max(120),
      gender: yup.string().required('Gender is required'),
    })
  ).min(1, 'At least one traveler is required'),
}).required();

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const TourBookingPage = () => {
  const { destination, subDestination } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, token } = useAuth();

  const [toursCatalog, setToursCatalog] = useState([]);
  const [isTourLoading, setIsTourLoading] = useState(true);
  const [tourFetchError, setTourFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const requestedTourPath = useMemo(
    () => [destination, subDestination].filter(Boolean).join('/'),
    [destination, subDestination]
  );

  const tour = useMemo(
    () =>
      toursCatalog.find(
        (entry) => entry.destination.toLowerCase().replace(/\s/g, '-') === requestedTourPath
      ),
    [toursCatalog, requestedTourPath]
  );

  const canBookAsTraveler = isAuthenticated && user?.role === 'USER';
  const tourPricePerTraveler = useMemo(() => getTourPricePerTraveler(tour), [tour]);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      travelers: [{ name: '', age: '', gender: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'travelers',
  });

  useEffect(() => {
    const loadTours = async () => {
      setIsTourLoading(true);
      setTourFetchError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/tours`);
        const payload = await parseJsonSafe(response);

        if (!response.ok) {
          setTourFetchError(payload?.message || 'Unable to load tour data.');
          setToursCatalog([]);
          return;
        }

        if (!Array.isArray(payload)) {
          setTourFetchError('Invalid tour response from backend.');
          setToursCatalog([]);
          return;
        }

        setToursCatalog(payload);
      } catch {
        setTourFetchError('Unable to connect to backend server.');
        setToursCatalog([]);
      } finally {
        setIsTourLoading(false);
      }
    };

    loadTours();
  }, []);

  const onSubmit = (data) => {
    if (!isAuthenticated || user?.role !== 'USER' || !token) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setSubmitError(null);
    setIsSubmittingBooking(true);

    fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        destination: tour.destination,
        country: tour.country,
        travelDate: data.date,
        transportation: data.transportation,
        travelers: data.travelers,
        amountPerTraveler: tourPricePerTraveler,
        currency: 'INR',
      }),
    })
      .then(async (response) => {
        const payload = await parseJsonSafe(response);

        if (!response.ok) {
          setSubmitError(payload?.message || 'Unable to create booking');
          return;
        }

        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(PENDING_BOOKING_STORAGE_KEY, JSON.stringify(payload));
        }

        navigate('/user/payment/demo', { state: { pendingBooking: payload } });
      })
      .catch(() => {
        setSubmitError('Unable to connect to backend server.');
      })
      .finally(() => {
        setIsSubmittingBooking(false);
      });
  };

  const handleFormSubmit = (event) => {
    if (!canBookAsTraveler) {
      event.preventDefault();
      navigate('/login', { state: { from: location } });
      return;
    }

    handleSubmit(onSubmit)(event);
  };

  if (isTourLoading) {
    return <div className="page-shell flex min-h-screen items-center justify-center">Loading booking form...</div>;
  }

  if (tourFetchError) {
    return <div className="page-shell flex min-h-screen items-center justify-center">{tourFetchError}</div>;
  }

  if (!tour) {
    return <div className="page-shell flex min-h-screen items-center justify-center">Tour not found!</div>;
  }

  return (
    <div className="page-shell pt-32 pb-20">
      <section className="max-w-4xl mx-auto px-4">
        <div className="glass-card p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-primary font-bold text-primary">Book This Tour</h1>
            <p className="text-gray-600 mt-2">
              {tour.destination}, {tour.country} | {tour.duration} Days | {formatInr(tourPricePerTraveler)} per traveler
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                {...register('date')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label htmlFor="transportation" className="block text-sm font-medium text-gray-700">Mode of Transportation</label>
              <select
                id="transportation"
                {...register('transportation')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Select a mode</option>
                <option value="suv">Luxury SUV</option>
                <option value="van">Comfort Van</option>
                <option value="bus">Shuttle Bus</option>
              </select>
              {errors.transportation && <p className="text-red-500 text-sm mt-1">{errors.transportation.message}</p>}
            </div>

            <hr />

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">Travelers</h4>
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-white/70 rounded-xl bg-white/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-semibold">Traveler {index + 1}</h5>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                        <XCircle size={20} />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <input
                      {...register(`travelers.${index}.name`)}
                      placeholder="Full Name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    {errors.travelers?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.travelers[index].name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Age</label>
                      <input
                        type="number"
                        {...register(`travelers.${index}.age`)}
                        placeholder="Age"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      {errors.travelers?.[index]?.age && (
                        <p className="text-red-500 text-sm mt-1">{errors.travelers[index].age.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Gender</label>
                      <select
                        {...register(`travelers.${index}.gender`)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.travelers?.[index]?.gender && (
                        <p className="text-red-500 text-sm mt-1">{errors.travelers[index].gender.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {fields.length < 10 && (
                <button
                  type="button"
                  onClick={() => append({ name: '', age: '', gender: '' })}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <PlusCircle size={16} />
                  Add Traveler
                </button>
              )}
            </div>

            <hr />

            <button
              type="submit"
              disabled={isSubmittingBooking}
              className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-accent transition-colors font-semibold"
            >
              {isSubmittingBooking ? 'Creating Booking...' : 'Book Now'}
            </button>
            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
          </form>
        </div>
      </section>
    </div>
  );
};

export default TourBookingPage;
