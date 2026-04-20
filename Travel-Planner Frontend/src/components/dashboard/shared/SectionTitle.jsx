import React from 'react';

const SectionTitle = ({ title, actions }) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-gray-700 font-bold">{title}</h3>
    {actions && <div className="flex gap-2">{actions}</div>}
  </div>
);

export default SectionTitle;