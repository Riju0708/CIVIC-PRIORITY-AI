import React, { useState } from 'react';
import { CitizenUser, IncidentReport } from './types';
import { INITIAL_INCIDENTS, MUNICIPAL_DEPARTMENTS, SAMPLE_CITIZENS } from './data/mockData';
import { Header } from './components/Header';
import { CitizenPortal } from './components/CitizenPortal';
import { ReviewQueue } from './components/ReviewQueue';
import { DispatchConsole } from './components/DispatchConsole';
import { GISMap } from './components/GISMap';
import { SSNAuthModal } from './components/SSNAuthModal';
import { PresentationModal } from './components/PresentationModal';
import { MLArchitectureModal } from './components/MLArchitectureModal';
import { NotificationModal } from './components/NotificationModal';
import { AlertCircle, CheckCircle, ShieldAlert, Sparkles, X } from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [departments, setDepartments] = useState(MUNICIPAL_DEPARTMENTS);
  const [currentUser, setCurrentUser] = useState<CitizenUser>(SAMPLE_CITIZENS[0]);
  
  // Navigation tabs: 'citizen' | 'dispatch' | 'review' | 'map'
  const [activeTab, setActiveTab] = useState<'citizen' | 'dispatch' | 'review' | 'map'>('citizen');
  
  // Modals & Inspection States
  const [isSsnModalOpen, setIsSsnModalOpen] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [isMlModalOpen, setIsMlModalOpen] = useState(false);
  const [webhookIncident, setWebhookIncident] = useState<IncidentReport | null>(null);
  const [highlightIncidentId, setHighlightIncidentId] = useState<string | null>(null);
  const [piiRedactionEnabled, setPiiRedactionEnabled] = useState(true);

  // Global Toast Alert banner (e.g. when false alarm redirect occurs)
  const [toastMessage, setToastMessage] = useState<{
    type: 'warning' | 'success' | 'info';
    title: string;
    description: string;
  } | null>(null);

  const showToast = (type: 'warning' | 'success' | 'info', title: string, description: string) => {
    setToastMessage({ type, title, description });
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  // Citizen submits report
  const handleSubmitReport = (newReport: IncidentReport) => {
    setIncidents(prev => [newReport, ...prev]);

    if (!newReport.isFalseAlarmSuspected) {
      showToast(
        'success',
        `Civic Ticket #${newReport.ticketNumber} Logged`,
        `AI Priority Matrix scored threat at ${newReport.priorityScore}/100. Dispatched to ${newReport.assignedDepartment}.`
      );
    }
  };

  // Explicit user requirement:
  // "in case the user reports false alarm it should redirect the system to a review page for manual verification"
  const handleFalseAlarmRedirect = (flaggedIncidentId: string) => {
    setHighlightIncidentId(flaggedIncidentId);
    setActiveTab('review');
    showToast(
      'warning',
      'Suspected False Alarm Diverted to Review',
      'The AI Priority Matrix flagged anomalous or prank indicators. System automatically redirected to Manual Verification Review Page.'
    );
  };

  // Field Officer approves incident from review queue
  const handleApproveIncident = (incidentId: string, notes: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'DISPATCH_READY',
          reviewedByOfficer: 'Field Officer Ramirez (#FO-81)',
          reviewNotes: notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return inc;
    }));

    const target = incidents.find(i => i.id === incidentId);
    if (target) {
      setWebhookIncident({
        ...target,
        status: 'DISPATCH_READY',
      });
    }

    showToast(
      'success',
      'Report Approved for Dispatch',
      'Field Officer verified validity. Status set to DISPATCH_READY and queued for municipal crew assignment.'
    );
  };

  // Field Officer confirms false alarm and issues penalty to citizen SSN
  const handleRejectFalseAlarm = (incidentId: string, notes: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'REJECTED_FALSE_ALARM',
          reviewedByOfficer: 'Field Officer Ramirez (#FO-81)',
          reviewNotes: notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return inc;
    }));

    // Penalize current citizen's SSN trust score
    setCurrentUser(prev => ({
      ...prev,
      reputationScore: Math.max(10, prev.reputationScore - 15),
      priorFalseAlarms: prev.priorFalseAlarms + 1,
    }));

    showToast(
      'warning',
      'False Alarm Confirmed & Penalized',
      'Incident dismissed. 15 reputation points deducted from citizen SSN record in Municipal Registry.'
    );
  };

  // Field Officer requests rapid physical pre-check
  const handleRequestFieldPreCheck = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          reviewNotes: 'Rapid Scout 02 dispatched to physical location for sensor cross-examination.',
          updatedAt: new Date().toISOString(),
        };
      }
      return inc;
    }));

    showToast(
      'info',
      'Rapid Scout Dispatched for Pre-Check',
      'Field inspector dispatched for physical on-site verification prior to heavy emergency crew mobilization.'
    );
  };

  // Dispatch operations status updates
  const handleUpdateStatus = (
    incidentId: string, 
    newStatus: IncidentReport['status'], 
    assignedUnit?: string, 
    etaMinutes?: number
  ) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const updated = {
          ...inc,
          status: newStatus,
          assignedUnit: assignedUnit || inc.assignedUnit,
          etaMinutes: etaMinutes !== undefined ? etaMinutes : inc.etaMinutes,
          updatedAt: new Date().toISOString(),
        };
        // Auto trigger webhook notification simulation for transparency
        setWebhookIncident(updated);
        return updated;
      }
      return inc;
    }));

    showToast(
      'info',
      `Work Order Updated: ${newStatus}`,
      `Municipal team telemetry updated and automated webhook SMS notification triggered.`
    );
  };

  // Citizen webhook test trigger
  const handleTriggerCitizenWebhook = (incident: IncidentReport) => {
    setWebhookIncident(incident);
  };

  // Inspect incident from map
  const handleSelectIncidentFromMap = (incident: IncidentReport) => {
    if (incident.status === 'FLAGGED_MANUAL_REVIEW' || incident.status === 'REJECTED_FALSE_ALARM') {
      setHighlightIncidentId(incident.id);
      setActiveTab('review');
    } else {
      setActiveTab('dispatch');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenSsnModal={() => setIsSsnModalOpen(true)}
        onOpenPresentationGuide={() => setIsPresentationModalOpen(true)}
        onOpenMlBlueprint={() => setIsMlModalOpen(true)}
        incidents={incidents}
        piiRedactionEnabled={piiRedactionEnabled}
        onTogglePiiRedaction={() => setPiiRedactionEnabled(!piiRedactionEnabled)}
      />

      {/* Global Interactive Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
            toastMessage.type === 'warning' ? 'bg-amber-900/95 border-amber-600 text-amber-50' :
            toastMessage.type === 'success' ? 'bg-emerald-950/95 border-emerald-600 text-emerald-50' :
            'bg-slate-900/95 border-blue-600 text-blue-50'
          }`}>
            {toastMessage.type === 'warning' && <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toastMessage.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toastMessage.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <h5 className="font-bold text-sm leading-snug">{toastMessage.title}</h5>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toastMessage.description}</p>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'citizen' && (
          <CitizenPortal
            currentUser={currentUser}
            onOpenSsnModal={() => setIsSsnModalOpen(true)}
            onSubmitReport={handleSubmitReport}
            onFalseAlarmRedirect={handleFalseAlarmRedirect}
            existingIncidents={incidents}
            piiRedactionEnabled={piiRedactionEnabled}
          />
        )}

        {activeTab === 'review' && (
          <ReviewQueue
            incidents={incidents}
            highlightIncidentId={highlightIncidentId}
            onApproveIncident={handleApproveIncident}
            onRejectFalseAlarm={handleRejectFalseAlarm}
            onRequestFieldPreCheck={handleRequestFieldPreCheck}
            piiRedactionEnabled={piiRedactionEnabled}
          />
        )}

        {activeTab === 'dispatch' && (
          <DispatchConsole
            incidents={incidents}
            onUpdateStatus={handleUpdateStatus}
            onTriggerCitizenWebhook={handleTriggerCitizenWebhook}
            departments={departments}
            piiRedactionEnabled={piiRedactionEnabled}
          />
        )}

        {activeTab === 'map' && (
          <GISMap
            incidents={incidents}
            onSelectIncident={handleSelectIncidentFromMap}
            piiRedactionEnabled={piiRedactionEnabled}
          />
        )}
      </main>

      {/* Footer with Hackathon Attribution */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CivicPriority AI</span>
            <span>•</span>
            <span>AI & Smart Governance Track</span>
            <span>•</span>
            <span className="text-slate-400">Real-Time Civic Triage System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsPresentationModalOpen(true)}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              View Slide Mapping
            </button>
            <button
              onClick={() => setIsMlModalOpen(true)}
              className="text-slate-600 hover:underline cursor-pointer"
            >
              SHAP & Ethics Metrics
            </button>
            <span>SSN Identity Deduplication Active</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SSNAuthModal
        isOpen={isSsnModalOpen}
        onClose={() => setIsSsnModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
      />

      <PresentationModal
        isOpen={isPresentationModalOpen}
        onClose={() => setIsPresentationModalOpen(false)}
        onNavigateTab={setActiveTab}
      />

      <MLArchitectureModal
        isOpen={isMlModalOpen}
        onClose={() => setIsMlModalOpen(false)}
        piiRedactionEnabled={piiRedactionEnabled}
        onTogglePiiRedaction={() => setPiiRedactionEnabled(!piiRedactionEnabled)}
      />

      <NotificationModal
        incident={webhookIncident}
        isOpen={!!webhookIncident}
        onClose={() => setWebhookIncident(null)}
      />
    </div>
  );
}
