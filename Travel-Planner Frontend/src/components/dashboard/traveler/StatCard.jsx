import React from 'react';
import { motion } from 'framer-motion';

const MotionCard = motion.div;

const StatCard = ({ children, className = '' }) => (
  <MotionCard
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.12)] ${className}`}
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-[#4f7df0] to-accent/80" aria-hidden="true" />
    <div className="relative">{children}</div>
  </MotionCard>
);

export default StatCard;
