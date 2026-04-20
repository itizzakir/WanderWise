import React from 'react';
import SectionTitle from '../shared/SectionTitle';

const PopularDestinations = ({ destinations = [] }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <SectionTitle title="Popular Destinations" actions={
           <div className="flex gap-2 text-gray-400">
              <span className="cursor-pointer hover:text-blue-600">{'<'}</span>
              <span className="cursor-pointer hover:text-blue-600">{'>'}</span>
           </div>
      } />
      <div className="space-y-4">
        {destinations.length === 0 ? (
          <p className="text-sm text-gray-500">No destination data available.</p>
        ) : destinations.map((dest, i) => (
              <div key={`${dest.city}-${dest.country}-${i}`} className="relative group overflow-hidden rounded-lg cursor-pointer">
                  <img src={dest.imageUrl} alt={dest.city} className="w-full h-24 object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <div className="text-white">
                        <p className="font-bold">{i + 1}. {dest.city}</p>
                        <p className="text-xs opacity-90">
                          {dest.country} | {dest.bookingsCount} booking(s)
                        </p>
                      </div>
                  </div>
              </div>
          ))}
      </div>
  </div>
);

export default PopularDestinations;
