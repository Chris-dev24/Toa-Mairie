import React from 'react';

const ActivityList = ({ items = [] }) => {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-gray-500">Aucune activité récente.</div>
      ) : (
        items.map((it) => (
          <div key={it.id} className="flex items-start gap-3 bg-white p-3 rounded shadow">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {it.initials}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{it.title}</div>
              <div className="text-xs text-gray-500">{it.subtitle}</div>
            </div>
            <div className="text-xs text-gray-400">{it.time}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default ActivityList;
