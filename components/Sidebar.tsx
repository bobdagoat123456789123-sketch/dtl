
import React from 'react';
import { RouteData } from '../types';
import { TrendingUp, Clock, ShieldCheck, MapPin, AlertCircle, Zap } from 'lucide-react';

interface SidebarProps {
  routes: RouteData[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ routes, selectedRouteId, onSelectRoute, isLoading }) => {
  const getTrafficStatus = (route: RouteData) => {
    const current = parseInt(route.duration);
    const historical = parseInt(route.durationHistorical);
    const ratio = current / historical;
    if (ratio > 1.35) return { label: 'Heavy', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
    if (ratio > 1.12) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { label: 'Clear', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
  };

  return (
    <div className="w-full md:w-96 h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden shrink-0">
      <div className="p-6 border-b border-slate-100 bg-white">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          Traffic Pro
        </h1>
        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-black">Bengaluru Predictive Grid</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : routes.length > 0 ? (
          <>
            <div className="px-2 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Best Routes Found</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">LIVE</span>
            </div>
            
            {routes.map((route, idx) => {
              const status = getTrafficStatus(route);
              const isSelected = selectedRouteId === route.id;
              
              return (
                <button
                  key={route.id}
                  onClick={() => onSelectRoute(route.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative ${
                    isSelected
                      ? 'border-blue-500 bg-white shadow-xl shadow-blue-100/40 ring-2 ring-blue-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Option {idx + 1}</span>
                      <div className={`flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase ${status.bg} ${status.border} ${status.color}`}>
                        <AlertCircle className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> FASTEST
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-3xl font-black tracking-tight ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                      {Math.floor(parseInt(route.duration) / 60)}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Mins</span>
                      <span className="text-[10px] font-bold text-slate-500">{(route.distanceMeters / 1000).toFixed(1)} km</span>
                    </div>
                    <div className="ml-auto text-right border-l border-slate-100 pl-3">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Historical</p>
                      <p className="text-xs font-bold text-slate-600">{Math.floor(parseInt(route.durationHistorical) / 60)}m</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${isSelected ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                      {route.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Trend Score</span>
                      <span className={`text-[11px] font-black ${route.reliability === 'High' ? 'text-green-600' : 'text-blue-600'}`}>
                        {route.reliability} ({route.trendScore}%)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div 
                          key={step}
                          className={`w-3.5 h-1.5 rounded-full ${
                            step <= (route.trendScore / 20) 
                              ? (isSelected ? 'bg-blue-600' : 'bg-blue-200') 
                              : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-blue-200" />
            </div>
            <h3 className="text-slate-800 font-bold mb-2">Ready to Route</h3>
            <p className="text-xs text-slate-500 leading-relaxed px-4">
              Enter two locations in Bengaluru to see 3 AI-analyzed traffic options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
