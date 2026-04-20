import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaPlane, FaSuitcase, FaWallet } from 'react-icons/fa';
import { formatInr } from '../../../lib/pricing';

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1800&q=70';
const MotionSection = motion.div;

const formatDateLabel = (value) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '--';
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const UpcomingTripHero = ({ upcomingTrip }) => {
  if (!upcomingTrip) {
    return (
      <MotionSection
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative flex min-h-[500px] flex-col justify-center overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:col-span-2"
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-14 -left-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Upcoming Trip
          </span>
          <h2 className="mt-4 font-primary text-3xl font-semibold text-slate-900">No Upcoming Trip</h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Start a new journey from the tours page and your next trip will appear here.
          </p>
          <Link
            to="/tours"
            className="mt-6 inline-flex w-max items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Explore Tours
          </Link>
        </div>
      </MotionSection>
    );
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group relative min-h-[500px] overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.14)] lg:col-span-2"
    >
      <img
        src={upcomingTrip.imageUrl || FALLBACK_HERO_IMAGE}
        alt={`${upcomingTrip.destination}, ${upcomingTrip.country}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/75" />

      <div className="absolute left-8 top-8 text-white">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <FaCalendarAlt className="text-[11px]" />
          {upcomingTrip.daysLeft} {upcomingTrip.daysLeft === 1 ? 'Day' : 'Days'} Left
        </span>
        <h2 className="mt-3 font-primary text-3xl font-semibold">
          {upcomingTrip.destination}, {upcomingTrip.country}
        </h2>
      </div>

      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/40 bg-white/92 p-5 shadow-xl backdrop-blur-sm">
        <div className="mb-5 grid grid-cols-1 gap-4 border-b border-slate-200/70 pb-5 md:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Booking</p>
            <p className="mt-0.5 text-lg font-semibold text-slate-900">{upcomingTrip.bookingId}</p>
            <p className="mt-1 text-xs text-slate-500">Status: {upcomingTrip.bookingStatus}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Travel Dates</p>
            <p className="mt-0.5 text-lg font-semibold text-slate-900">
              {formatDateLabel(upcomingTrip.startDate)} - {formatDateLabel(upcomingTrip.endDate)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Transport: {upcomingTrip.transportation}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to={`/user/dashboard/my-trips/${upcomingTrip.id}`}
            className="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            View Itinerary
          </Link>
          <Link
            to="/user/dashboard/my-trips"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <FaSuitcase size={12} /> My Trips
          </Link>
          <div className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700">
            <FaPlane size={12} /> {upcomingTrip.status}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <FaWallet /> Budget
          </div>
          <span className="font-primary text-lg font-semibold text-slate-900">
            {formatInr(upcomingTrip.spentBudget)} / {formatInr(upcomingTrip.totalBudget)}
          </span>
        </div>
      </div>
    </MotionSection>
  );
};

export default UpcomingTripHero;
