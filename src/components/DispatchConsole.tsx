import React, { useState } from 'react';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Search, 
  Filter, 
  Flame, 
  Droplet, 
  Zap, 
  Building2, 
  Layers,
  ShieldCheck,
  BellRing
} from 'lucide-react';
import { IncidentCategory, IncidentReport, MunicipalDepartment } from '../types';

interface DispatchConsoleProps {
  incidents: IncidentReport[];
  onUpdateStatus: (incidentId: string, newStatus: IncidentReport['status'], assignedUnit?: string, etaMinutes?: number) => void;
  onTriggerCitizenWebhook: (incident: IncidentReport) => void;
  departments: MunicipalDepartment[];
  piiRedactionEnabled: boolean;
}

export const DispatchConsole: React.FC<DispatchConsoleProps> = ({
  incidents,
  onUpdateStatus,
  onTriggerCitizenWebhook,
  departments,
  piiRedactionEnabled,
}) => {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');

  const operationalIncidents = incidents.filter(i => 
    i.status !== 'FLAGGED_MANUAL_REVIEW' && i.status !== 'REJECTED_FALSE_ALARM'
  );

  const filteredIncidents = operationalIncidents.filter(inc => {
    if (activeTab === 'active' && inc.status === 'RESOLVED') return false;
    if (activeTab === 'resolved' && inc.status !== 'RESOLVED') return false;

    if (selectedDeptFilter !== 'all' && inc.assignedDepartment !== selectedDeptFilter) return false;
    if (selectedPriorityFilter !== 'all' && inc.priorityLevel !== selectedPriorityFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.ticketNumber.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        inc.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryIcon = (category: IncidentCategory) => {
    switch (category) {
      case 'Gas & Hazard': return <Flame className="w-5 h-5 text-red-500" />;
      case 'Water & Sewage': return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'Electrical Grid': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Structural & Bridge': return <Building2 className="w-5 h-5 text-indigo-500" />;
      default: return <Truck className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* City Emergency Readiness Strip */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">City Department Fleet Status</h3>
            <p className="text-sm text-slate-500">Live operational readiness across municipal districts</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full self-start">
            ● GPS Telemetry Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <span className="font-mono text-xs font-bold text-slate-600 block mb-1">{dept.code}</span>
              <div className="font-bold text-sm text-slate-900 truncate" title={dept.name}>
                {dept.name.split(' ')[0]}
              </div>
              <div className="mt-1 text-xs font-bold text-emerald-700">
                {dept.availableUnits} / {dept.activeUnits} Trucks Ready
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by street or ticket number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active Work Orders ({operationalIncidents.filter(i => i.status !== 'RESOLVED').length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Resolved ({operationalIncidents.filter(i => i.status === 'RESOLVED').length})
            </button>
          </div>
        </div>

        <select
          value={selectedPriorityFilter}
          onChange={(e) => setSelectedPriorityFilter(e.target.value)}
          className="text-sm font-bold border-2 border-slate-200 rounded-2xl p-2.5 bg-white text-slate-800 focus:border-blue-600 cursor-pointer"
        >
          <option value="all">All Priority Levels</option>
          <option value="CRITICAL">Critical Danger (Immediate)</option>
          <option value="HIGH">High Priority</option>
          <option value="MODERATE">Moderate Priority</option>
          <option value="ROUTINE">Routine Maintenance</option>
        </select>
      </div>

      {/* Incident Cards */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-extrabold text-lg text-slate-800">No active work orders</h4>
            <p className="text-sm text-slate-500 mt-1">All dispatched municipal squads have completed repairs!</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isCritical = incident.priorityLevel === 'CRITICAL';
            const isHigh = incident.priorityLevel === 'HIGH';

            return (
              <div
                key={incident.id}
                className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-7 shadow-sm hover:border-blue-300 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-extrabold px-3 py-1 rounded-xl bg-slate-900 text-white">
                      #{incident.ticketNumber}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-sm">
                      {getCategoryIcon(incident.category)}
                      <span>{incident.category}</span>
                    </div>

                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      isCritical ? 'bg-red-100 text-red-800 border border-red-200' :
                      isHigh ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      Urgency Score: {incident.priorityScore}/100 • {incident.priorityLevel}
                    </span>

                    {incident.duplicateCount > 1 && (
                      <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {incident.duplicateCount} Consolidated Citizen Calls
                      </span>
                    )}
                  </div>

                  <span className={`text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full ${
                    incident.status === 'DISPATCH_READY' ? 'bg-amber-100 text-amber-900' :
                    incident.status === 'UNIT_EN_ROUTE' ? 'bg-blue-100 text-blue-900 animate-pulse' :
                    incident.status === 'ON_SITE_REPAIR' ? 'bg-purple-100 text-purple-900' :
                    'bg-emerald-100 text-emerald-900'
                  }`}>
                    {incident.status === 'DISPATCH_READY' && 'TRUCK AWAITING DISPATCH'}
                    {incident.status === 'UNIT_EN_ROUTE' && 'CREW EN ROUTE'}
                    {incident.status === 'ON_SITE_REPAIR' && 'REPAIR SQUAD ON SITE'}
                    {incident.status === 'RESOLVED' && 'RESOLVED & FIXED'}
                  </span>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-8 space-y-2">
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                      {incident.title}
                    </h3>
                    <p className="text-base text-slate-600 leading-relaxed">
                      {incident.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 pt-2 font-medium">
                      <span className="flex items-center gap-1 text-slate-900 font-bold">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {incident.locationName}
                      </span>
                      <span>•</span>
                      <span>{incident.district}</span>
                      <span>•</span>
                      <span className="text-blue-700 font-semibold">
                        SSN Reporter: {incident.citizenName} ({incident.citizenSsn})
                      </span>
                    </div>
                  </div>

                  {/* Actions & Routing */}
                  <div className="lg:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Assigned Municipal Unit:
                      </span>
                      <strong className="text-sm sm:text-base text-slate-900 block">
                        {incident.assignedDepartment}
                      </strong>
                      {incident.assignedUnit && (
                        <div className="mt-2 text-xs font-bold text-blue-900 bg-blue-100 p-2 rounded-xl flex items-center justify-between">
                          <span>{incident.assignedUnit}</span>
                          <span>{incident.etaMinutes === 0 ? 'ON LOCATION' : `ETA ~${incident.etaMinutes} mins`}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 justify-end">
                      {incident.status === 'DISPATCH_READY' && (
                        <button
                          onClick={() => onUpdateStatus(incident.id, 'UNIT_EN_ROUTE', 'Emergency Squad 04', 6)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Dispatch Crew</span>
                        </button>
                      )}

                      {incident.status === 'UNIT_EN_ROUTE' && (
                        <button
                          onClick={() => onUpdateStatus(incident.id, 'ON_SITE_REPAIR', incident.assignedUnit, 0)}
                          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Radio className="w-4 h-4" />
                          <span>Mark Arrived On Site</span>
                        </button>
                      )}

                      {incident.status === 'ON_SITE_REPAIR' && (
                        <button
                          onClick={() => onUpdateStatus(incident.id, 'RESOLVED')}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Fixed</span>
                        </button>
                      )}

                      {/* Citizen SMS Simulation */}
                      <button
                        onClick={() => onTriggerCitizenWebhook(incident)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <BellRing className="w-4 h-4 text-blue-600" />
                        <span>Send Citizen SMS</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
