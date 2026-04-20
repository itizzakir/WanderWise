import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../lib/useAuth';
import { getAdminRecommendations } from '../../../lib/adminRecommendations';

const RECOMMENDATION_TABS = {
  destinations: {
    title: 'Destination Recommendations',
    description: 'Rank destinations using bookings trend, conversion rate, and seasonal demand.',
  },
  pricing: {
    title: 'Pricing Recommendations',
    description: 'Review dynamic pricing opportunities based on occupancy and booking velocity.',
  },
  timing: {
    title: 'Travel Timing Recommendations',
    description: 'Identify best travel windows based on demand peaks and forecasted load.',
  },
  all: {
    title: 'All Recommendations',
    description: 'Monitor recommendation signals for destination, pricing, and timing from one view.',
  },
};

const severityStyles = {
  HIGH: 'bg-red-50 border-red-200 text-red-800',
  MEDIUM: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  LOW: 'bg-blue-50 border-blue-200 text-blue-800',
  INFO: 'bg-gray-50 border-gray-200 text-gray-700',
};

const DEFAULT_SUMMARY = {
  totalRecommendations: 0,
  destinationRecommendations: 0,
  pricingRecommendations: 0,
  timingRecommendations: 0,
};

const normalizeTab = (tab) => {
  if (!tab) {
    return 'all';
  }

  return RECOMMENDATION_TABS[tab] ? tab : 'all';
};

const formatGeneratedAt = (value) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return parsedDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminRecommendationsPanel = () => {
  const { tab } = useParams();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const activeTab = normalizeTab(tab);
  const content = RECOMMENDATION_TABS[activeTab];

  const [recommendationData, setRecommendationData] = useState({
    summary: DEFAULT_SUMMARY,
    destinationRecommendations: [],
    pricingRecommendations: [],
    timingRecommendations: [],
    generatedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      if (!isAdmin || !token) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setFetchError('');

      try {
        const payload = await getAdminRecommendations(token);
        if (isMounted) {
          setRecommendationData({
            summary: payload.summary || DEFAULT_SUMMARY,
            destinationRecommendations: Array.isArray(payload.destinationRecommendations)
              ? payload.destinationRecommendations
              : [],
            pricingRecommendations: Array.isArray(payload.pricingRecommendations)
              ? payload.pricingRecommendations
              : [],
            timingRecommendations: Array.isArray(payload.timingRecommendations)
              ? payload.timingRecommendations
              : [],
            generatedAt: payload.generatedAt || null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(error?.message || 'Unable to load recommendations.');
          setRecommendationData({
            summary: DEFAULT_SUMMARY,
            destinationRecommendations: [],
            pricingRecommendations: [],
            timingRecommendations: [],
            generatedAt: null,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, token]);

  const visibleRecommendations = useMemo(() => {
    if (activeTab === 'destinations') {
      return recommendationData.destinationRecommendations;
    }

    if (activeTab === 'pricing') {
      return recommendationData.pricingRecommendations;
    }

    if (activeTab === 'timing') {
      return recommendationData.timingRecommendations;
    }

    return [
      ...recommendationData.destinationRecommendations,
      ...recommendationData.pricingRecommendations,
      ...recommendationData.timingRecommendations,
    ];
  }, [activeTab, recommendationData]);

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800">Recommendations</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only users with the ADMIN role can view recommendation insights.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Recommendations</h1>
        <p className="text-sm text-gray-500 mt-1">{content.description}</p>
      </div>

      {fetchError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          {fetchError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {recommendationData.summary.totalRecommendations || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Destinations</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {recommendationData.summary.destinationRecommendations || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Pricing</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">
            {recommendationData.summary.pricingRecommendations || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Timing</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {recommendationData.summary.timingRecommendations || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{content.title}</h2>
          <p className="text-xs text-gray-400">
            Generated: {formatGeneratedAt(recommendationData.generatedAt)}
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading recommendations...</p>
        ) : visibleRecommendations.length === 0 ? (
          <p className="text-sm text-gray-500">No recommendations available for this category.</p>
        ) : (
          <div className="space-y-4">
            {visibleRecommendations.map((item) => (
              <article
                key={item.id}
                className={`rounded-lg border p-4 ${severityStyles[item.severity] || 'bg-gray-50 border-gray-200 text-gray-700'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {item.severity}
                  </span>
                </div>
                <p className="text-sm opacity-90">{item.insight}</p>
                <p className="text-sm mt-2 font-medium">Action: {item.action}</p>
                <p className="text-xs mt-2 opacity-80">
                  {item.metricLabel}: {item.metricValue}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminRecommendationsPanel;
