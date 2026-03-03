import React from 'react';

function LocationMap({ location, coordinates }) {
  // Use OpenStreetMap embed with iframe
  const mapUrl = coordinates 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.2},${coordinates.lat - 0.2},${coordinates.lng + 0.2},${coordinates.lat + 0.2}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-emerald-100 p-4">
      <h3 className="text-lg font-semibold text-stone-800 mb-3">Location Map</h3>
      {coordinates ? (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-emerald-100 bg-stone-50">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={mapUrl}
            title={location}
            style={{ border: 0 }}
            allowFullScreen
          />
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-95 px-3 py-1.5 rounded shadow text-sm font-medium text-stone-800 border border-emerald-100">
            📍 {location}
          </div>
        </div>
      ) : (
        <div className="w-full h-64 bg-stone-50 rounded-lg flex items-center justify-center text-stone-500">
          Map unavailable - coordinates not found
        </div>
      )}
    </div>
  );
}

export default LocationMap;

