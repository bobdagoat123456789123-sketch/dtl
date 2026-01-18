
import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, MapPin } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: () => void;
  placeholder: string;
  icon: 'navigation' | 'search';
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, onSelect, placeholder, icon }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (val: string) => {
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      // Photon API - OpenStreetMap based geocoding with a bias towards Bengaluru
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5&lat=12.97&lon=77.59`);
      const data = await res.json();
      setSuggestions(data.features || []);
      setShowDropdown(true);
    } catch (e) {
      console.error("Suggestion fetch failed", e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    fetchSuggestions(val);
  };

  const selectSuggestion = (feature: any) => {
    const props = feature.properties;
    const name = props.name + (props.city ? `, ${props.city}` : '') + (props.state ? ` (${props.state})` : '');
    onChange(name);
    setShowDropdown(false);
    if (onSelect) {
      // Small timeout to allow state to propagate before parent might trigger search
      setTimeout(onSelect, 50);
    }
  };

  return (
    <div ref={containerRef} className="flex-1 relative w-full">
      <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
        {icon === 'navigation' ? (
          <Navigation className="w-4 h-4 text-blue-500 shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 2 && setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && suggestions.length > 0 && showDropdown) {
              e.preventDefault();
              selectSuggestion(suggestions[0]);
            }
          }}
          placeholder={placeholder}
          className="bg-transparent w-full outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 bg-slate-50/50 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Suggestions</span>
          </div>
          {suggestions.map((s, i) => (
            <button
              key={`${s.properties.osm_id}-${i}`}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-none group"
            >
              <MapPin className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-700 truncate">{s.properties.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tight truncate">
                  {s.properties.city || s.properties.county} {s.properties.state ? `• ${s.properties.state}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
