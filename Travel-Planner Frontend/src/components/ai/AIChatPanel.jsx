import { useEffect, useRef, useState } from 'react';
import { MessageCircle, MapPinned, RefreshCcw, SendHorizontal } from 'lucide-react';
import { sendChatMessage } from '../../lib/aiPlanner';

const starterPrompts = [
  'Show me good hotels in Tokyo for a family trip',
  'What tour plans do you have for Santorini?',
  'Can you suggest a short travel plan for Gold Coast?',
];

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

const AIChatPanel = () => {
  const [conversationId, setConversationId] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [latestContext, setLatestContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, latestContext]);

  const submitMessage = async (messageText) => {
    const trimmed = String(messageText || '').trim();
    if (!trimmed) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await sendChatMessage({
        conversationId: conversationId || undefined,
        message: trimmed,
      });

      setConversationId(response.conversationId);
      setMessages(response.history || []);
      setLatestContext({
        matchedDestination: response.matchedDestination,
        matchedCountry: response.matchedCountry,
        hotels: response.hotels || [],
        tours: response.tours || [],
        databaseBacked: response.databaseBacked,
        aiEnhanced: response.aiEnhanced,
      });
      setInput('');
    } catch (requestError) {
      setError(requestError?.message || 'Unable to send chat message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitMessage(input);
  };

  const startFresh = () => {
    setConversationId('');
    setMessages([]);
    setLatestContext(null);
    setInput('');
    setError('');
  };

  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-white/70 bg-[linear-gradient(135deg,rgba(113,42,133,0.96),rgba(217,70,239,0.88))] px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              <MessageCircle size={14} />
              AI Chatbot
            </p>
            <h2 className="mt-3 text-2xl font-bold">Ask about hotels, tours, and travel plans</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/85">
              The assistant checks your local hotel and tour database first, then adds AI guidance when available.
            </p>
          </div>
          <button
            type="button"
            onClick={startFresh}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <RefreshCcw size={16} />
            New Chat
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className="space-y-4">
          <div className="max-h-[420px] min-h-[320px] space-y-4 overflow-y-auto rounded-[28px] border border-[#efe3f5] bg-[#fbf7fe] p-4">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-primary/25 bg-white/80 p-5 text-sm text-gray-600">
                Start with a question like “Show me budget hotels in Tokyo” or “What tours do you have for Santorini?”.
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${message.timestamp}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-3xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'border border-[#eadcf3] bg-white text-gray-700'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">
                    {message.role === 'user' ? 'You' : 'WanderWise AI'}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-[#eadcf3] bg-white px-4 py-3 text-sm text-gray-500">
                  Thinking through your travel data...
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => submitMessage(prompt)}
                className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#efe3f5] bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <label className="flex-1">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Your question</span>
                <textarea
                  rows={3}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about a hotel, a tour itinerary, or a trip plan..."
                  className="w-full resize-none rounded-2xl border border-[#eadcf3] bg-[#fcfaff] px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-primary/40"
                />
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <SendHorizontal size={16} />
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-[#eadcf3] bg-[#fffaf3] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <MapPinned size={16} />
              Latest Match
            </div>
            <p className="mt-3 text-xl font-bold text-gray-800">
              {latestContext?.matchedDestination
                ? `${latestContext.matchedDestination}${latestContext?.matchedCountry ? `, ${latestContext.matchedCountry}` : ''}`
                : 'Waiting for your first travel query'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className={`rounded-full px-3 py-1 ${latestContext?.databaseBacked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {latestContext?.databaseBacked ? 'Database matched' : 'General AI mode'}
              </span>
              <span className={`rounded-full px-3 py-1 ${latestContext?.aiEnhanced ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-amber-100 text-amber-700'}`}>
                {latestContext?.aiEnhanced ? 'AI enhanced' : 'Rule-based summary'}
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#eadcf3] bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Hotels</h3>
            <div className="mt-4 space-y-3">
              {latestContext?.hotels?.length ? latestContext.hotels.map((hotel) => (
                <div key={hotel.id} className="rounded-2xl border border-[#f0e5f6] bg-[#fcfaff] p-4">
                  <p className="font-semibold text-gray-800">{hotel.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{hotel.destination}, {hotel.country}</p>
                  <p className="mt-2 text-sm font-medium text-primary">{formatMoney(hotel.pricePerNight, hotel.currency)} / night</p>
                  <p className="mt-2 text-xs text-gray-600">Amenities: {(hotel.amenities || []).slice(0, 3).join(', ') || 'N/A'}</p>
                </div>
              )) : <p className="text-sm text-gray-500">Hotel matches will appear here.</p>}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#eadcf3] bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Tours</h3>
            <div className="mt-4 space-y-3">
              {latestContext?.tours?.length ? latestContext.tours.map((tour) => (
                <div key={tour.id} className="rounded-2xl border border-[#f0e5f6] bg-[#fcfaff] p-4">
                  <p className="font-semibold text-gray-800">{tour.destination}, {tour.country}</p>
                  <p className="mt-1 text-xs text-gray-500">{tour.category} • {tour.duration} day(s)</p>
                  <p className="mt-2 text-sm text-gray-600">{tour.description}</p>
                </div>
              )) : <p className="text-sm text-gray-500">Tour matches will appear here.</p>}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default AIChatPanel;
