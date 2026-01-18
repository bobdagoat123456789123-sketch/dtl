
import React from 'react';
import { RouteData } from '../types';
import { TrendingUp, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface SidebarProps {
  routes: RouteData[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ routes, selectedRouteId, onSelectRoute, isLoading }) => {
  return (
    <div className="w-full md:w-96 h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Predictive Traffic
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">AI-Powered Route Optimization</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : routes.length > 0 ? (
          routes.map((route) => (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedRouteId === route.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  route.reliability === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {route.reliability} Reliability
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {Math.round(route.distanceMeters / 1609.34)} miles
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-slate-900 mb-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-lg font-bold">
                  {Math.floor(parseInt(route.duration) / 60)} mins
                </span>
                <span className="text-xs text-slate-400 line-through">
                   Hist: {Math.floor(parseInt(route.durationHistorical) / 60)}m
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm text-slate-600">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                <p className="leading-tight">{route.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${route.trendScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{route.trendScore}% Stability</span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
            <MapPin className="w-12 h-12 mb-4 opacity-20" />
            <p>Select an origin and destination to calculate smart routes.</p>
          </div>
        )}
      </div>
    </div>
  );
};
