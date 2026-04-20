import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import SectionTitle from '../shared/SectionTitle';

const severityStyles = {
  HIGH: 'bg-red-50 border-red-100 text-red-800',
  MEDIUM: 'bg-yellow-50 border-yellow-100 text-yellow-800',
  INFO: 'bg-blue-50 border-blue-100 text-blue-800',
};

const severityIcons = {
  HIGH: <FaExclamationTriangle className="text-red-500 mt-1" />,
  MEDIUM: <FaExclamationTriangle className="text-yellow-500 mt-1" />,
  INFO: <FaInfoCircle className="text-blue-500 mt-1" />,
};

const SystemAlerts = ({ alerts = [] }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <SectionTitle title="System Alerts" actions={
           <div className="flex gap-2 text-gray-400">
              <span className="cursor-pointer hover:text-blue-600">{'<'}</span>
              <span className="cursor-pointer hover:text-blue-600">{'>'}</span>
           </div>
      } />
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <FaCheckCircle className="text-green-500 mt-1" />
            <div>
              <h4 className="text-sm font-semibold text-green-800">All systems operational</h4>
              <p className="text-xs text-green-700 mt-1">No active alerts right now.</p>
            </div>
          </div>
        ) : alerts.map((entry, index) => (
          <div
            key={`${entry.title}-${index}`}
            className={`flex items-start gap-3 p-3 rounded-lg border ${severityStyles[entry.severity] || 'bg-gray-50 border-gray-100 text-gray-800'}`}
          >
            {severityIcons[entry.severity] || <FaInfoCircle className="text-gray-500 mt-1" />}
            <div>
              <h4 className="text-sm font-semibold">{entry.title}</h4>
              <p className="text-xs mt-1 opacity-90">{entry.message}</p>
            </div>
          </div>
        ))}
      </div>
  </div>
);

export default SystemAlerts;
