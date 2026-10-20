import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Flame, 
  Droplet, 
  Zap, 
  Building2, 
  Truck, 
  Radio, 
  AlertTriangle, 
  Activity,
  Crosshair
} from 'lucide-react';
import { IncidentCategory, IncidentReport } from '../types';

interface GISMapProps {
  incidents: IncidentReport[];
  onSelectIncident: (incident: IncidentReport) => void;
  piiRedactionEnabled: boolean;
}

export const GISMap: React.FC<GISMapProps> = ({
  incidents,
  onSelectIncident,
  piiRedactionEnabled,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [hoveredIncident, setHoveredIncident] = useState<IncidentReport | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  const displayedIncidents = incidents.filter(inc => {
    if (showCriticalOnly && inc.priorityLevel !== 'CRITICAL' && inc.priorityLevel !== 'HIGH') {
      return false;
    }
    return true;
  });

  const getMarkerColor = (incident: IncidentReport) => {
    if (incident.status === 'FLAGGED_MANUAL_REVIEW') return '#f59e0b'; // Amber
    if (incident.status === 'REJECTED_FALSE_ALARM') return '#94a3b8'; // Slate
    if (incident.priorityLevel === 'CRITICAL') return '#ef4444'; // Red
    if (incident.priorityLevel === 'HIGH') return '#f97316'; // Orange
    if (incident.priorityLevel === 'MODERATE') return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Map Control Bar with Clear Text */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-extrabold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Live City Incident Map</h3>
            <p className="text-sm text-slate-500">Slide 5: Spatial Heatmap & Neighborhood Density</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              showHeatmap 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Heatmap: {showHeatmap ? 'ACTIVE' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              showCriticalOnly 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Urgent Emergencies Only</span>
          </button>
        </div>
      </div>

      {/* Main Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl border-2 border-slate-800 overflow-hidden relative shadow-xl min-h-[500px]">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>MUNICIPAL GPS FEED: LIVE</span>
          </div>

          <svg
            className="w-full h-[520px] select-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <radialGradient id="heatCritical" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatCluster" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Roads & River */}
            <path d="M 0 45 Q 30 50, 55 42 T 100 35" fill="none" stroke="#0f3d64" strokeWidth="3" opacity="0.7" />
            <path d="M 25 0 Q 35 45, 45 100" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,1" opacity="0.5" />
            <path d="M 0 75 Q 50 65, 100 85" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="3,1" opacity="0.5" />

            {/* District Labels */}
            <text x="10" y="15" fill="#64748b" fontSize="3.2" fontWeight="bold">D2: North Suburbs</text>
            <text x="45" y="20" fill="#64748b" fontSize="3.2" fontWeight="bold">D3: Transit Corridor</text>
            <text x="40" y="65" fill="#64748b" fontSize="3.2" fontWeight="bold">D1: Downtown Core</text>
            <text x="65" y="85" fill="#64748b" fontSize="3.2" fontWeight="bold">D4: Riverside District</text>

            {/* Heatmaps */}
            {showHeatmap && displayedIncidents.map((inc) => (
              <circle
                key={`heat-${inc.id}`}
                cx={inc.coordinates.x}
                cy={inc.coordinates.y}
                r={inc.priorityScore > 85 ? 18 : inc.priorityScore > 65 ? 14 : 9}
                fill={inc.priorityLevel === 'CRITICAL' ? 'url(#heatCritical)' : inc.priorityLevel === 'HIGH' ? 'url(#heatHigh)' : 'url(#heatCluster)'}
              />
            ))}

            {/* Markers */}
            {displayedIncidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              const isHovered = hoveredIncident?.id === inc.id;
              const color = getMarkerColor(inc);

              return (
                <g
                  key={inc.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedIncident(inc);
                    onSelectIncident(inc);
                  }}
                  onMouseEnter={() => setHoveredIncident(inc)}
                  onMouseLeave={() => setHoveredIncident(null)}
                >
                  {(inc.priorityLevel === 'CRITICAL' || inc.status === 'FLAGGED_MANUAL_REVIEW') && (
                    <circle
                      cx={inc.coordinates.x}
                      cy={inc.coordinates.y}
                      r="4.8"
                      fill="none"
                      stroke={color}
                      strokeWidth="0.5"
                      className="animate-ping"
                      style={{ transformOrigin: `${inc.coordinates.x}% ${inc.coordinates.y}%` }}
                    />
                  )}

                  <circle
                    cx={inc.coordinates.x}
                    cy={inc.coordinates.y}
                    r={isSelected || isHovered ? "3.5" : "2.6"}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />

                  <text
                    x={inc.coordinates.x}
                    y={inc.coordinates.y - 4}
                    fill="#ffffff"
                    fontSize="2.4"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    #{inc.ticketNumber.slice(-4)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Critical Danger</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span>High Priority</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Review / False Alarm</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Fixed / Normal</span>
              </span>
            </div>
            <span className="text-slate-400 font-medium">Click any pin to inspect</span>
          </div>
        </div>

        {/* Selected Details */}
        <div className="lg:col-span-4">
          {selectedIncident || hoveredIncident ? (
            (() => {
              const inc = selectedIncident || hoveredIncident!;
              return (
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono text-sm font-extrabold px-3 py-1 rounded-xl bg-slate-900 text-white">
                      #{inc.ticketNumber}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      inc.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      inc.priorityLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      Score: {inc.priorityScore}/100
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900">
                      {inc.title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {inc.description}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Location:</span>
                      <strong className="text-slate-800">{inc.locationName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">District:</span>
                      <strong className="text-slate-800">{inc.district}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Citizen SSN:</span>
                      <strong className="text-slate-800 font-mono">{inc.citizenSsn}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Community Pressure:</span>
                      <strong className="text-blue-700 font-extrabold">{inc.communityPressureScore}%</strong>
                    </div>
                  </div>

                  {inc.isFalseAlarmSuspected && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm text-amber-900">
                      <strong className="block font-bold">⚠️ Flagged for Officer Review</strong>
                      <p className="mt-0.5">{inc.falseAlarmReason}</p>
                    </div>
                  )}

                  <button
                    onClick={() => onSelectIncident(inc)}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-extrabold transition-colors cursor-pointer"
                  >
                    Open Incident Workspace ➔
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-10 text-center text-slate-500">
              <Crosshair className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <h4 className="font-extrabold text-base text-slate-800">Tap Any Location Pin</h4>
              <p className="text-sm text-slate-500 mt-1">
                View neighborhood hazard reports, neighbor duplicates, and live truck dispatches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
