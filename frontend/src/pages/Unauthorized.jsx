import React from 'react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">403</h1>
        <p className="text-2xl text-red-100 mb-8">Access Denied</p>
        <p className="text-red-100 mb-8">Vous n'avez pas la permission d'accéder à cette ressource.</p>
        <a 
          href="/dashboard" 
          className="inline-block bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50"
        >
          Retour au Dashboard
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
