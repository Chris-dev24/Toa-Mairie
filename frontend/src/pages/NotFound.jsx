import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-blue-100 mb-8">Page Not Found</p>
        <p className="text-blue-100 mb-8">La page que vous recherchez n'existe pas.</p>
        <a 
          href="/dashboard" 
          className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
        >
          Retour au Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
