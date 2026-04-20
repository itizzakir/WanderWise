import React from 'react';
import SectionTitle from '../shared/SectionTitle';

const statusStyles = {
  PENDING_PAYMENT: 'bg-orange-100 text-orange-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const RecentBookingsTable = ({ bookings = [] }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <SectionTitle
        title="Recent Bookings"
        actions={
          <div className="text-xs text-gray-400">
            {bookings.length} requests
          </div>
        }
      />
      <table className="w-full text-left text-sm">
        <thead className="text-gray-400 border-b">
          <tr>
            <th className="pb-2 font-medium">Booking ID</th>
            <th className="pb-2 font-medium">Traveler</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="py-3 text-gray-500">{booking.id}</td>
              <td className="py-3 font-medium text-gray-700">{booking.travelerName}</td>
              <td className="py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    statusStyles[booking.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 ? (
        <p className="text-xs text-gray-500 mt-3">No bookings yet.</p>
      ) : null}
    </div>
  );

export default RecentBookingsTable;
