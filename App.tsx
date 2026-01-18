
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { AutocompleteInput } from './components/AutocompleteInput';
import { LatLng, RouteData } from './types';
import { fetchRoutesV2 } from './services/googleMapsService';
import { analyzeTrafficTrends } from './services/geminiService';
import { AlertTriangle, Map as MapIcon } from 'lucide-react';

const BENGALURU_CENTER: LatLng = { lat: 12.9716, lng: 77.5946 };

const App: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [startPoint, setStartPoint] = useState<LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<LatLng | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async () => {
    if (!origin || !destination) return;

    setLoading(true);
    setError(null);
    try {
      const { routes: rawRoutes, start, end } = await fetchRoutesV2(origin, destination);
      setStartPoint(start);
      setEndPoint(end);
      
      const analyzedRoutes = await analyzeTrafficTrends(rawRoutes, origin, destination);
      
      setRoutes(analyzedRoutes);
      if (analyzedRoutes.length > 0) {
        const bestRoute = analyzedRoutes.reduce((prev, current) => 
          (prev.trendScore > current.trendScore) ? prev : current
        );
        setSelectedRouteId(bestRoute.id);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Try checking locations.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [origin, destination]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-inter">
      <Sidebar 
        routes={routes} 
        selectedRouteId={selectedRouteId} 
        onSelectRoute={setSelectedRouteId}
        isLoading={loading}
      />

      <main className="flex-1 relative flex flex-col">
        <div className="absolute top-0 left-0 right-0 z-[2000] p-4 md:p-6 flex justify-center pointer-events-none">
          <div className="w-full max-w-3xl pointer-events-auto">
            <form 
              onSubmit={handleSubmit}
              className="bg-white/90 backdrop-blur-lg p-2 rounded-2xl shadow-2xl border border-white flex flex-col md:flex-row gap-2 ring-1 ring-slate-200"
            >
              <AutocompleteInput 
                value={origin}
                onChange={setOrigin}
                placeholder="From: e.g. Indiranagar"
                icon="navigation"
              />
              <div className="hidden md:flex items-center text-slate-300">
                <div className="w-px h-8 bg-slate-200" />
              </div>
              <AutocompleteInput 
                value={destination}
                onChange={setDestination}
                placeholder="To: e.g. Kempegowda Airport"
                icon="search"
              />
              <button 
                type="submit"
                disabled={loading || !origin || !destination}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 min-w-[140px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <MapIcon className="w-4 h-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 mx-auto flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs shadow-lg max-w-md">
                <AlertTriangle className="w-4 h-4" />
                <p className="font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 relative bg-slate-100">
          <MapView 
            routes={routes} 
            selectedRouteId={selectedRouteId} 
            center={BENGALURU_CENTER}
            startMarker={startPoint}
            endMarker={endPoint}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
