import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Volume2, 
  User, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Play,
  Pause,
  Filter,
  Check,
  ShieldCheck,
  Info
} from 'lucide-react';
import { IncidentReport } from '../types';

interface ReviewQueueProps {
  incidents: IncidentReport[];
  highlightIncidentId?: string | null;
  onApproveIncident: (incidentId: string, notes: string) => void;
  onRejectFalseAlarm: (incidentId: string, notes: string) => void;
  onRequestFieldPreCheck: (incidentId: string) => void;
  piiRedactionEnabled: boolean;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  incidents,
  highlightIncidentId,
  onApproveIncident,
  onRejectFalseAlarm,
  onRequestFieldPreCheck,
  piiRedactionEnabled,
}) => {
  const [filterType, setFilterType] = useState<'pending' | 'rejected' | 'all'>('pending');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    highlightIncidentId || incidents.find(i => i.status === 'FLAGGED_MANUAL_REVIEW')?.id || null
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  React.useEffect(() => {
    if (highlightIncidentId) {
      setSelectedIncidentId(highlightIncidentId);
    }
  }, [highlightIncidentId]);

  const flaggedList = incidents.filter(i => {
    if (filterType === 'pending') return i.status === 'FLAGGED_MANUAL_REVIEW';
    if (filterType === 'rejected') return i.status === 'REJECTED_FALSE_ALARM';
    return true;
  });

  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || flaggedList[0];

  const handleApprove = () => {
    if (!activeIncident) return;
    onApproveIncident(activeIncident.id, reviewNotes || 'Human Officer confirmed report is genuine. Dispatched to field units.');
    setReviewNotes('');
  };

  const handleReject = () => {
    if (!activeIncident) return;
    onRejectFalseAlarm(activeIncident.id, reviewNotes || 'Human Officer confirmed False Alarm. Warning strike recorded to citizen SSN.');
    setReviewNotes('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner with Clear Human-Friendly Description */}
      <div className="bg-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Officer Review Desk
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-amber-900">
                  Manual Verification
                </span>
              </div>
              <p className="text-sm sm:text-base text-amber-100 mt-1 max-w-2xl leading-relaxed">
                When a report is flagged for suspected false alarm, unusual details, or high-risk infrastructure, a city officer must review it here before sending emergency crews.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/20 text-center">
            <div className="px-3">
              <span className="text-xs text-amber-100 uppercase tracking-wider block font-bold">
                Awaiting Review
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {incidents.filter(i => i.status === 'FLAGGED_MANUAL_REVIEW').length}
              </span>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="px-3">
              <span className="text-xs text-amber-100 uppercase tracking-wider block font-bold">
                Dismissed
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {incidents.filter(i => i.status === 'REJECTED_FALSE_ALARM').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Flagged Items */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-slate-200">
            <button
              onClick={() => setFilterType('pending')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                filterType === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Needs Review ({incidents.filter(i => i.status === 'FLAGGED_MANUAL_REVIEW').length})
            </button>
            <button
              onClick={() => setFilterType('rejected')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                filterType === 'rejected'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Dismissed ({incidents.filter(i => i.status === 'REJECTED_FALSE_ALARM').length})
            </button>
          </div>

          <div className="space-y-3">
            {flaggedList.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-extrabold text-slate-800 text-lg">All Clear!</h4>
                <p className="text-sm text-slate-500 mt-1">No reports currently waiting for manual officer verification.</p>
              </div>
            ) : (
              flaggedList.map((inc) => {
                const isSelected = inc.id === activeIncident?.id;
                const isPending = inc.status === 'FLAGGED_MANUAL_REVIEW';

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        #{inc.ticketNumber}
                      </span>
                      {isPending ? (
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Needs Officer Review
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Dismissed False Alarm
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 line-clamp-1">
                      {inc.title}
                    </h4>

                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                      {inc.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Resident: {inc.citizenName}</span>
                      <span className="font-bold text-red-600">{inc.falseAlarmConfidence}% Suspicion</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Dossier for Selected Item */}
        <div className="lg:col-span-7">
          {activeIncident ? (
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <span className="font-mono text-sm font-extrabold px-3 py-1 bg-slate-900 text-white rounded-xl">
                    Ticket #{activeIncident.ticketNumber}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    activeIncident.status === 'FLAGGED_MANUAL_REVIEW'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-red-100 text-red-900 border border-red-300'
                  }`}>
                    {activeIncident.status === 'FLAGGED_MANUAL_REVIEW' ? 'PENDING DECISION' : 'CONFIRMED FALSE ALARM'}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  {activeIncident.title}
                </h3>

                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{activeIncident.locationName} ({activeIncident.district})</span>
                </p>
              </div>

              {/* Citizen SSN Authenticity Record */}
              <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-extrabold text-sm text-blue-950 uppercase tracking-wider">
                      Reporting Citizen SSN Profile
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Identity Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 bg-white rounded-xl border border-blue-200">
                    <span className="text-xs text-slate-500 block">Citizen Name:</span>
                    <strong className="text-slate-900 text-base">{activeIncident.citizenName}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-blue-200">
                    <span className="text-xs text-slate-500 block">Social Security:</span>
                    <strong className="text-slate-900 font-mono text-base">{activeIncident.citizenSsn}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-blue-200">
                    <span className="text-xs text-slate-500 block">Trust Record:</span>
                    <strong className={`text-base ${activeIncident.reporterReputationScore < 50 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {activeIncident.reporterReputationScore}% Good Standing
                    </strong>
                  </div>
                </div>
              </div>

              {/* Why Flagged (Explained in Plain English) */}
              <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Why was this flagged by the system?</span>
                </div>
                <p className="text-sm text-amber-950 leading-relaxed font-medium">
                  {activeIncident.falseAlarmReason || 'Report contains prank keywords or anomalous claims that do not correlate with neighborhood municipal sensors.'}
                </p>
                <div className="text-xs text-amber-800 pt-1">
                  💡 <strong>City Sensor Check:</strong> Cameras and traffic sensors at this location show normal conditions. No 911 overlap reported.
                </div>
              </div>

              {/* Citizen Audio Recording Player */}
              {activeIncident.hasVoiceAudio && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
                    >
                      {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <div>
                      <span className="font-extrabold text-base text-white block">
                        Citizen Audio Note ({activeIncident.audioDurationSeconds || 12}s)
                      </span>
                      <span className="text-xs text-slate-400">
                        {isPlayingAudio ? 'Playing voice recording...' : 'Tap to listen to citizen intake audio'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 h-6">
                    {[12, 22, 14, 28, 16, 24, 10, 20, 15, 26, 12].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full ${isPlayingAudio ? 'bg-blue-400 animate-pulse' : 'bg-slate-700'}`}
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-sm font-extrabold text-slate-800 block mb-1">
                  Full Report Transcript:
                </label>
                <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base text-slate-900 leading-relaxed">
                  "{activeIncident.description}"
                </div>
              </div>

              {/* Officer Decision Controls */}
              <div className="pt-4 border-t-2 border-slate-100 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1.5">
                    Officer Decision Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified by phone call, or prank confirmed with camera feed..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full text-base p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleReject}
                    disabled={activeIncident.status === 'REJECTED_FALSE_ALARM'}
                    className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Dismiss as False Alarm</span>
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={activeIncident.status === 'DISPATCH_READY'}
                    className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve Real Report</span>
                  </button>

                  <button
                    onClick={() => onRequestFieldPreCheck(activeIncident.id)}
                    className="p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Eye className="w-5 h-5 text-blue-400" />
                    <span>Send Scout Pre-Check</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  * Dismissing a false alarm deducts 15 points from the citizen's SSN trust score in the municipal registry to prevent future hoax reports.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 text-center text-slate-500">
              <Eye className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <p className="text-base font-bold text-slate-700">Select any report from the left list to review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
