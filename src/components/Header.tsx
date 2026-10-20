import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Truck, 
  ShieldAlert, 
  FileText, 
  Cpu, 
  Home,
  UserCheck,
  Flame,
  ChevronDown
} from 'lucide-react';
import { CitizenUser, IncidentReport } from '../types';

interface HeaderProps {
  activeTab: 'citizen' | 'dispatch' | 'review' | 'map';
  setActiveTab: (tab: 'citizen' | 'dispatch' | 'review' | 'map') => void;
  currentUser: CitizenUser;
  onOpenSsnModal: () => void;
  onOpenPresentationGuide: () => void;
  onOpenMlBlueprint: () => void;
  incidents: IncidentReport[];
  piiRedactionEnabled: boolean;
  onTogglePiiRedaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenSsnModal,
  onOpenPresentationGuide,
  onOpenMlBlueprint,
  incidents,
  piiRedactionEnabled,
  onTogglePiiRedaction,
}) => {
  const pendingReviewCount = incidents.filter(i => i.status === 'FLAGGED_MANUAL_REVIEW').length;
  const criticalCount = incidents.filter(i => i.priorityLevel === 'CRITICAL' && i.status !== 'RESOLVED').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Friendly Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-sm gap-2">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-blue-400 text-sm tracking-wide">
            CivicPriority AI
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 text-xs sm:text-sm font-medium">
            Smart City Governance Platform
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Presentation Guide Button */}
          <button
            onClick={onOpenPresentationGuide}
            className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Presentation Slides</span>
          </button>

          {/* Privacy Safeguard toggle */}
          <button
            onClick={onTogglePiiRedaction}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              piiRedactionEnabled 
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' 
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <span>SSN Masking: {piiRedactionEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-md">
            <Flame className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
              <span>CivicPriority AI</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Live Prototype
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              City Problem Reporting, SSN Verification & False Alarm Triage
            </p>
          </div>
        </div>

        {/* Clear Role Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('citizen')}
            className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'citizen'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Citizen Help Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'dispatch'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>City Dispatch</span>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-extrabold">
                {criticalCount}
              </span>
            )}
          </button>

          {/* False Alarm Review Queue */}
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'review'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>Officer Review</span>
            {pendingReviewCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold animate-pulse">
                {pendingReviewCount} Action
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>City Map</span>
          </button>
        </div>

        {/* Citizen SSN Account Button */}
        <button
          onClick={onOpenSsnModal}
          className="flex items-center gap-3 p-2 pr-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-300 font-extrabold text-sm flex items-center justify-center">
            {currentUser.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-sm font-extrabold text-white leading-tight">
              {currentUser.fullName}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              SSN: {piiRedactionEnabled ? currentUser.maskedSsn : currentUser.ssn}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
        </button>
      </div>
    </header>
  );
};
