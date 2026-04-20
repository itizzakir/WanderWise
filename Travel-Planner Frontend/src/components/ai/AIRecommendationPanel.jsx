import { useState } from 'react';
import { Compass, Hotel, Sparkles } from 'lucide-react';
import { getTravelRecommendation } from '../../lib/aiPlanner';

const formatMoney = (amount, currency = 'INR') => {
  const numericAmount = Number(amount || 0);

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount}`;
  }
};

const parsePreferences = (value) =>
  String(value || '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const AIRecommendationPanel = () => {
  const [form, setForm] = useState({
    destination: 'Tokyo',
    budget: '120000',
    numberOfDays: '5',
    preferences: 'family, culture, breakfast included',
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await getTravelRecommendation({
        destination: form.destination,
        budget: Number(form.budget),
        numberOfDays: Number(form.numberOfDays),
        preferences: parsePreferences(form.preferences),
      });
      setResult(response);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load travel recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-white/70 bg-white/80 px-6 py-5">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <Sparkles size={14} />
          AI Recommendation
        </p>
        <h2 className="mt-3 text-2xl font-bold text-gray-800">Build a hybrid trip plan</h2>
        <p className="mt-2 text-sm text-gray-600">
          This combines your destination, budget, days, and preferences with local hotels, tours, and an AI explanation.
        </p>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-[#eadcf3] bg-[#fcfaff] p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Destination</span>
            <input
              value={form.destination}
              onChange={handleChange('destination')}
              className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              placeholder="Tokyo"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Budget (INR)</span>
            <input
              type="number"
              min="1"
              value={form.budget}
              onChange={handleChange('budget')}
              className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              placeholder="120000"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Number of days</span>
            <input
              type="number"
              min="1"
              value={form.numberOfDays}
              onChange={handleChange('numberOfDays')}
              className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              placeholder="5"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Preferences</span>
            <textarea
              rows={4}
              value={form.preferences}
              onChange={handleChange('preferences')}
              className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40"
              placeholder="family, culture, breakfast included"
            />
            <span className="mt-2 block text-xs text-gray-500">Separate preferences with commas or new lines.</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Generating recommendation...' : 'Generate Recommendation'}
          </button>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-[#eadcf3] bg-[#fffaf3] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">AI Explanation</p>
            <p className="mt-3 text-base leading-7 text-gray-700">
              {result?.explanation || 'Your recommendation summary will appear here after you submit the form.'}
            </p>
            {result ? (
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{result.dataStrategy}</span>
                <span className={`rounded-full px-3 py-1 ${result.aiEnhanced ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-amber-100 text-amber-700'}`}>
                  {result.aiEnhanced ? 'AI explanation enabled' : 'Database-only explanation'}
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[28px] border border-[#eadcf3] bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Hotel size={16} className="text-primary" />
                Recommended Hotels
              </div>
              <div className="mt-4 space-y-4">
                {result?.hotels?.length ? result.hotels.map((hotelItem) => (
                  <div key={hotelItem.id} className="rounded-2xl border border-[#f0e5f6] bg-[#fcfaff] p-4">
                    <p className="font-semibold text-gray-800">{hotelItem.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{hotelItem.destination}, {hotelItem.country}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                        {formatMoney(hotelItem.pricePerNight, hotelItem.currency)} / night
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                        Stay total: {formatMoney(hotelItem.estimatedStayCost, hotelItem.currency)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">{hotelItem.matchReason}</p>
                  </div>
                )) : <p className="text-sm text-gray-500">Hotels will appear here after generation.</p>}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#eadcf3] bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Compass size={16} className="text-primary" />
                Recommended Tours
              </div>
              <div className="mt-4 space-y-4">
                {result?.tours?.length ? result.tours.map((tourItem) => (
                  <div key={tourItem.id} className="rounded-2xl border border-[#f0e5f6] bg-[#fcfaff] p-4">
                    <p className="font-semibold text-gray-800">{tourItem.destination}, {tourItem.country}</p>
                    <p className="mt-1 text-xs text-gray-500">{tourItem.category} • {tourItem.duration} day(s)</p>
                    <p className="mt-3 text-sm text-gray-600">{tourItem.matchReason}</p>
                  </div>
                )) : <p className="text-sm text-gray-500">Tour ideas will appear here after generation.</p>}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#eadcf3] bg-white p-5">
            <p className="text-sm font-semibold text-gray-700">Suggested Itinerary</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {result?.suggestedItinerary?.length ? result.suggestedItinerary.map((item) => (
                <div key={item} className="rounded-2xl border border-[#f0e5f6] bg-[#fcfaff] p-4 text-sm text-gray-700">
                  {item}
                </div>
              )) : <p className="text-sm text-gray-500">The itinerary breakdown will appear here after generation.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIRecommendationPanel;
