import React from 'react';

function LocationMap({ location, coordinates }) {
  // Use OpenStreetMap embed with iframe
  const mapUrl = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.2},${coordinates.lat - 0.2},${coordinates.lng + 0.2},${coordinates.lat + 0.2}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`
    : null;

  return (
    <div className="w-full h-full relative group">
      {coordinates ? (
        <div className="w-full h-full relative overflow-hidden bg-stone-50">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={mapUrl}
            title={location}
            style={{
              border: 0,
              filter: 'grayscale(0.2) contrast(1.1)',
              width: '100%',
              height: '102%' // Slightly over 100% to hide potential gaps or attributions if needed
            }}
            allowFullScreen
          />
          <div className="absolute bottom-6 left-6 z-20">
            <div className="glass-card bg-[#030a06]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border-white/10 flex items-center gap-3 transform transition-transform group-hover:scale-110">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Station Location</span>
                <span className="block text-sm font-black text-white tracking-tight">{location}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-stone-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📍</span>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Coordinates not found</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationMap;

