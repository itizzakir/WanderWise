import React from 'react';
import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p>The requested URL <code>{location.pathname}</code> was not found.</p>
      </div>
    </div>
  );
};

export default NotFound;
