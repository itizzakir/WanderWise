import { useState } from 'react';
import { Bus, CarTaxiFront, Plane, TrainFront } from 'lucide-react';
import { getTravelModeSuggestion } from '../../lib/aiPlanner';

const modeIcons = {
  Flight: Plane,
  Train: TrainFront,
  Bus: Bus,
  Car: CarTaxiFront,
};

const formatMoney = (amount) => {
  const numericAmount = Number(amount || 0);

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `INR ${numericAmount}`;
  }
};

const AITravelModePanel = () => {
  const [form, setForm] = useState({
    origin: 'Delhi',
    destination: 'Jaipur',
    distanceKm: '280',
    budget: '5000',
    availableHours: '7',
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
      const response = await getTravelModeSuggestion({
        origin: form.origin,
        destination: form.destination,
        distanceKm: Number(form.distanceKm),
        budget: Number(form.budget),
        availableHours: Number(form.availableHours),
      });
      setResult(response);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to generate travel mode suggestion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-white/70 bg-white/80 px-6 py-5">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <Plane size={14} />
          Travel Mode Suggestion
        </p>
        <h2 className="mt-3 text-2xl font-bold text-gray-800">Compare transport options</h2>
        <p className="mt-2 text-sm text-gray-600">
          Get a route recommendation based on distance, budget, and how much time you have available.
        </p>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-[#eadcf3] bg-[#fcfaff] p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Origin</span>
            <input value={form.origin} onChange={handleChange('origin')} className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Destination</span>
            <input value={form.destination} onChange={handleChange('destination')} className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Distance (km)</span>
            <input type="number" min="1" value={form.distanceKm} onChange={handleChange('distanceKm')} className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Budget (INR)</span>
            <input type="number" min="1" value={form.budget} onChange={handleChange('budget')} className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Available time (hours)</span>
            <input type="number" min="0.5" step="0.5" value={form.availableHours} onChange={handleChange('availableHours')} className="w-full rounded-2xl border border-[#eadcf3] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/40" />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Scoring transport options...' : 'Suggest Best Mode'}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-[#eadcf3] bg-[#fffaf3] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Recommendation</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white">
                {result?.recommendedMode || 'Waiting for your route'}
              </div>
              {result ? (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${result.aiEnhanced ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-amber-100 text-amber-700'}`}>
                  {result.aiEnhanced ? 'AI explanation enabled' : 'Rule-based explanation'}
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-base leading-7 text-gray-700">
              {result?.reason || 'Submit the form to compare flight, train, bus, and car for your route.'}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {result?.options?.length ? result.options.map((option) => {
              const Icon = modeIcons[option.mode] || Plane;

              return (
                <div key={option.mode} className={`rounded-[28px] border p-5 ${
                  option.mode === result.recommendedMode
                    ? 'border-primary/25 bg-primary/5'
                    : 'border-[#eadcf3] bg-white'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{option.mode}</p>
                        <p className="text-xs text-gray-500">Suitability score: {option.suitabilityScore}</p>
                      </div>
                    </div>
                    {option.mode === result.recommendedMode ? (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">Best fit</span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white/80 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Estimated Cost</p>
                      <p className="mt-1 font-semibold text-gray-800">{formatMoney(option.estimatedCost)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Estimated Time</p>
                      <p className="mt-1 font-semibold text-gray-800">{option.estimatedHours} hrs</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">{option.reason}</p>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-500">Compared transport options will appear here after generation.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AITravelModePanel;
