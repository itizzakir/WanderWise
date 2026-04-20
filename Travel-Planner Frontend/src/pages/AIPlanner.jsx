import AIChatPanel from '../components/ai/AIChatPanel';
import AIRecommendationPanel from '../components/ai/AIRecommendationPanel';
import AITravelModePanel from '../components/ai/AITravelModePanel';

const AIPlanner = () => {
  return (
    <div className="page-shell py-20 pt-32">
      <div className="page-container space-y-8">
        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,250,0.88))] px-6 py-10 shadow-[0_25px_80px_rgba(113,42,133,0.12)] md:px-10">
          <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Full-Stack AI Travel Planner
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              Database-first travel intelligence with AI on top.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 md:text-lg">
              Explore hotel and tour answers through the chatbot, generate destination-based recommendations,
              and compare transport options in one place. The UI is powered by the new Spring Boot AI endpoints:
              <span className="font-semibold text-primary"> /api/chat</span>,
              <span className="font-semibold text-primary"> /api/recommend</span>, and
              <span className="font-semibold text-primary"> /api/travel-mode</span>.
            </p>
          </div>
        </section>

        <AIChatPanel />
        <AIRecommendationPanel />
        <AITravelModePanel />
      </div>
    </div>
  );
};

export default AIPlanner;
