import React from 'react';
import { useRouteError } from 'react-router-dom';

const ErrorBoundary = ({ error, resetError }) => {
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700 mb-6">{error.message || 'Une erreur est survenue'}</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-600 font-semibold">
                Détails techniques
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 text-gray-800">
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={resetError || (() => window.location.href = '/')}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retour à l'accueil
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ErrorBoundary;
