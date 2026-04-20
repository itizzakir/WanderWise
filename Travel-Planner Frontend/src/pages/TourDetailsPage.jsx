import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWeather } from '../lib/weatherService';
import { formatInr, getTourPricePerTraveler } from '../lib/pricing';
import { Calendar, Users, Globe } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const TourDetailsPage = () => {
  const { destination, subDestination } = useParams();
  const [toursCatalog, setToursCatalog] = useState([]);
  const [isTourLoading, setIsTourLoading] = useState(true);
  const [tourFetchError, setTourFetchError] = useState(null);
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
  
  const [weather, setWeather] = useState(null);
  const tourPricePerTraveler = useMemo(() => getTourPricePerTraveler(tour), [tour]);
  const bookingPath = useMemo(() => {
    if (subDestination) {
      return `/tours/${destination}/${subDestination}/book`;
    }

    return `/tours/${destination}/book`;
  }, [destination, subDestination]);

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

  useEffect(() => {
    if (tour) {
      setWeather(getWeather(tour.destination, tour.weatherProfile));
    }
  }, [tour]);

  if (isTourLoading) {
    return <div className="page-shell flex min-h-screen items-center justify-center">Loading tour details...</div>;
  }

  if (tourFetchError) {
    return <div className="page-shell flex min-h-screen items-center justify-center">{tourFetchError}</div>;
  }

  if (!tour) {
    return <div className="page-shell flex min-h-screen items-center justify-center">Tour not found!</div>;
  }

  return (
    <div className="page-shell">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full flex items-center justify-center text-center text-white">
        <img src={tour.img} alt={tour.destination} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-primary font-bold mb-4">{tour.destination}, {tour.country}</h1>
          <p className="text-lg md:text-2xl max-w-2xl mx-auto">{tour.description}</p>
        </div>
      </section>

      {/* Tour Info Bar */}
      <section className="bg-white/70 backdrop-blur-sm py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Calendar className="w-8 h-8 text-primary mb-2" />
            <span className="font-semibold">Duration</span>
            <span className="text-gray-600">{tour.duration} Days</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-8 h-8 text-primary mb-2" />
            <span className="font-semibold">Category</span>
            <span className="text-gray-600">{tour.category}</span>
          </div>
          <div className="flex flex-col items-center">
            <Globe className="w-8 h-8 text-primary mb-2" />
            <span className="font-semibold">Location</span>
            <span className="text-gray-600">{tour.country}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-primary">{formatInr(tourPricePerTraveler)}</span>
            <span className="font-semibold">per person</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Side - Itinerary */}
          <div className="md:col-span-2">
            
            {/* Weather Widget */}
            {weather && (
              <div className="glass-card p-6 mb-8">
                <h3 className="text-2xl font-primary font-semibold mb-4">Local Weather Forecast</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-5xl">{weather.current.icon}</div>
                  <div>
                    <div className="text-3xl font-bold">{weather.current.temp}°C</div>
                    <div className="text-gray-600">{weather.current.condition}</div>
                  </div>
                  <div className="ml-auto text-sm text-gray-500 space-y-1">
                    <div>Humidity: {weather.current.humidity}%</div>
                    <div>Wind: {weather.current.windSpeed} km/h</div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center border-t pt-4">
                  {weather.forecast.map((day, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-semibold text-gray-500">{day.day}</div>
                      <div className="text-2xl my-1">{day.icon}</div>
                      <div className="font-medium">{day.temp}°C</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-4xl font-primary font-semibold mb-8">Tour Details</h2>
            <div className="prose max-w-none">
              <p className="text-lg mb-6">{tour.description}</p>
              
              <h3 className="text-3xl font-primary font-semibold mt-12 mb-6">Itinerary ({tour.duration} Days)</h3>
              <div className="space-y-4 border-l-2 border-gray-200 ml-2">
                {tour.plan.map((day, index) => (
                  <div key={index} className="relative pl-8">
                    <div className="absolute -left-2 top-2 w-4 h-4 bg-primary rounded-full"></div>
                    <p className="text-gray-700">{day}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Booking CTA */}
          <div className="md:col-span-1">
            <div className="glass-card p-8 sticky top-24">
              <h3 className="text-2xl font-primary font-semibold mb-4">Book This Tour</h3>
              <p className="text-gray-600 text-sm mb-6">
                Continue to the booking form to select travel date, transportation, and traveler details.
              </p>

              <div className="mb-6 rounded-xl border border-white/70 bg-white/80 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Starting Price</p>
                <p className="text-2xl font-bold text-primary mt-1">{formatInr(tourPricePerTraveler)}</p>
                <p className="text-xs text-gray-500">per traveler</p>
              </div>

              <Link
                to={bookingPath}
                className="block w-full text-center bg-primary text-white py-3 px-4 rounded-md hover:bg-accent transition-colors font-semibold"
              >
                Book Tour
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourDetailsPage;
