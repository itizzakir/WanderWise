import React from 'react';
import { motion } from 'framer-motion';

const MotionCard = motion.div;

const StatCard = ({ title, value, subtext, icon, color }) => (
  <MotionCard
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm"
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-[#4f7df0] to-accent/80" aria-hidden="true" />
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <h3 className="mt-2 font-primary text-3xl font-semibold text-slate-900">{value}</h3>
      </div>
      {icon ? (
        <div className={`rounded-xl border border-white/70 bg-white/80 p-2 text-lg ${color || 'text-primary'}`}>
          {icon}
        </div>
      ) : null}
    </div>
    <div className="mt-4 text-xs text-slate-500">{subtext}</div>
  </MotionCard>
);

export default StatCard;
