
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { LatLng, RouteData } from './types';
import { fetchRoutesV2 } from './services/googleMapsService';
import { analyzeTrafficTrends } from './services/geminiService';
import { Search, Navigation, AlertTriangle, Radio } from 'lucide-react';

const BENGALURU_CENTER: LatLng = { lat: 12.9716, lng: 77.5946 };

const App: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    setLoading(true);
    setError(null);
    try {
      // 1. Fetch from Google Routes V2 (Simulated for Bengaluru context)
      const rawRoutes = await fetchRoutesV2(BENGALURU_CENTER, BENGALURU_CENTER);
      
      // 2. Analyze trends with Gemini
      const analyzedRoutes = await analyzeTrafficTrends(rawRoutes);
      
      setRoutes(analyzedRoutes);
      if (analyzedRoutes.length > 0) {
        const bestRoute = analyzedRoutes.reduce((prev, current) => 
          (prev.trendScore > current.trendScore) ? prev : current
        );
        setSelectedRouteId(bestRoute.id);
      }
    } catch (err) {
      setError('Failed to fetch Bengaluru traffic data. Please check your connectivity.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [origin, destination]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-100 overflow-hidden">
      <Sidebar 
        routes={routes} 
        selectedRouteId={selectedRouteId} 
        onSelectRoute={setSelectedRouteId}
        isLoading={loading}
      />

      <main className="flex-1 relative">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4 text-center">
          <div className="mb-2 inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live Bengaluru Traffic Feed</span>
          </div>
          
          <form 
            onSubmit={handleSearch}
            className="glass p-2 rounded-2xl shadow-2xl border border-white flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              <Navigation className="w-5 h-5 text-blue-500" />
              <input 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin (e.g., Indiranagar)" 
                className="bg-transparent w-full outline-none text-sm font-medium"
              />
            </div>
            <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Dest (e.g., Electronic City)" 
                className="bg-transparent w-full outline-none text-sm font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm inline-block">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <div className="w-full h-full">
          <MapView 
            routes={routes} 
            selectedRouteId={selectedRouteId} 
            center={BENGALURU_CENTER}
          />
        </div>

        <div className="absolute bottom-6 right-6 glass p-4 rounded-xl shadow-lg border border-white hidden md:block">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2">Bengaluru Health</h4>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-800">Live</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Status</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-blue-600">Dynamic</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Routing</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
