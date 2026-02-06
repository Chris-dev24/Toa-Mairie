import React from 'react';

const StatCard = ({ title, value, delta, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        {delta !== undefined && (
          <p className={`text-sm mt-1 ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </p>
        )}
      </div>
      {icon && (
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
