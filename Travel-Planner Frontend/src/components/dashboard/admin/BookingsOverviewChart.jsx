import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import SectionTitle from '../shared/SectionTitle';

const MotionDiv = motion.div;

const BookingsOverviewChart = ({ chartData = [] }) => (
  <MotionDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0"
  >
      <SectionTitle title="Bookings Overview" />
      <div className="h-64 w-full min-w-0 min-h-[256px]">
          <ResponsiveContainer width="100%" height={256} minWidth={280} minHeight={256}>
              <BarChart data={chartData.length > 0 ? chartData : [{ name: 'N/A', bookings: 0 }]} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
          </ResponsiveContainer>
      </div>
  </MotionDiv>
);

export default BookingsOverviewChart;
