import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const TabButton = ({ text, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`pb-2 text-sm font-medium transition-colors relative ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
  >
    {text}
    {active && (
      <MotionDiv
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
      />
    )}
  </button>
);

export default TabButton;
