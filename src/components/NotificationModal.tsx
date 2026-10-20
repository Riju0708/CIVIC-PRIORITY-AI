import React from 'react';
import { Smartphone, CheckCircle, Clock, MapPin, Send, BellRing, MessageSquare } from 'lucide-react';
import { IncidentReport } from '../types';

interface NotificationModalProps {
  incident: IncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  incident,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden my-6">
        {/* Smartphone Header mockup */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mb-3"></div>
          <div className="flex items-center justify-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Citizen Mobile Alert (Automated SMS)</span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1">
            Real-Time Citizen Update
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Slide 5: Automated WhatsApp & SMS Push Gateway
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 bg-slate-100">
          {/* SMS Bubble */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
              <span className="font-extrabold text-blue-600 flex items-center gap-1.5 text-sm">
                <MessageSquare className="w-4 h-4" />
                CITY 311 DISPATCH
              </span>
              <span className="font-bold">Just now</span>
            </div>

            <p className="text-sm font-semibold text-slate-900">
              Hello <strong>{incident.citizenName}</strong>, update on your report for <strong>#{incident.ticketNumber}</strong> ({incident.category}):
            </p>

            <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 text-sm text-blue-950 font-bold leading-relaxed">
              {incident.status === 'DISPATCH_READY' && 'Your report has been verified by the City Priority Matrix and queued for municipal team dispatch.'}
              {incident.status === 'UNIT_EN_ROUTE' && `City Emergency Alert: ${incident.assignedUnit || 'Emergency Unit'} has been dispatched to ${incident.locationName}. ETA: ~${incident.etaMinutes || 5} mins.`}
              {incident.status === 'ON_SITE_REPAIR' && `Field Update: ${incident.assignedUnit || 'Municipal Crew'} has arrived on site at ${incident.locationName} and commenced repair.`}
              {incident.status === 'RESOLVED' && 'Incident Closed: Municipal repairs are complete and the hazard is neutralized. Thank you for keeping our neighborhood safe!'}
              {incident.status === 'FLAGGED_MANUAL_REVIEW' && 'Notice: Your submission is undergoing certified Field Officer verification.'}
              {incident.status === 'REJECTED_FALSE_ALARM' && 'Verification Complete: Incident was investigated and archived as a false alarm.'}
            </div>

            <div className="pt-1 text-xs text-slate-400 flex items-center justify-between">
              <span>Track live: city.gov/track/{incident.ticketNumber}</span>
              <span className="text-emerald-600 font-bold">Delivered ✓✓</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl transition-colors cursor-pointer shadow-sm"
          >
            Close Notification Preview
          </button>
        </div>
      </div>
    </div>
  );
};
