import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  BarChart, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'citizen' | 'dispatch' | 'review' | 'map') => void;
}

const SLIDES_MAPPING = [
  {
    slideNumber: 1,
    title: 'CivicPriority AI - Real-Time Civic Triage System',
    track: 'AI & Smart Governance Track',
    summary: 'Transforming raw citizen feedback into prioritized, actionable municipal operations using automated intelligence.',
    prototypeFeature: 'Full Platform Ecosystem',
    targetTab: 'citizen' as const,
  },
  {
    slideNumber: 2,
    title: 'The Challenge: Municipal Bottlenecks & Critical Delays',
    track: 'Problem Statement',
    summary: 'Unstructured Reports flooding channels, Delayed Action trapping hazards in backlogs, Zero Transparency for citizens.',
    prototypeFeature: 'Citizen Voice/Text Intake & Automated Webhook status updates',
    targetTab: 'citizen' as const,
  },
  {
    slideNumber: 3,
    title: 'The Core Innovation: AI-Powered Priority Matrix',
    track: 'Core Engine',
    summary: 'Natural Language Processing for severity/urgency, Dynamic Priority Scoring (0-100), and Automated Dispatch Routing.',
    prototypeFeature: 'Live NLP Priority Matrix & Threat Scoring',
    targetTab: 'citizen' as const,
  },
  {
    slideNumber: 4,
    title: 'Technical Blueprint: End-to-End System Architecture',
    track: 'Architecture Flow',
    summary: 'Citizen Portal (multilingual) ➔ AI Pipeline (intent/geo-dedup) ➔ Triage Engine (community pressure) ➔ Dispatch Panel.',
    prototypeFeature: 'Seamless 4-Stage Operational Pipeline',
    targetTab: 'dispatch' as const,
  },
  {
    slideNumber: 5,
    title: 'Interoperability: Seamless Municipal Integration',
    track: 'Integrations',
    summary: 'Legacy CRM Connectors, GIS Mapping APIs for spatial hotspot density, Automated Webhooks (SMS & WhatsApp notifications).',
    prototypeFeature: 'GIS Interactive Infrastructure Map & Webhook Simulator',
    targetTab: 'map' as const,
  },
  {
    slideNumber: 6,
    title: 'Ethical Framework: Responsible AI & Privacy Safeguards',
    track: 'Ethics & Governance',
    summary: 'PII Redaction (SSN masking), Demographic Bias Mitigation across districts, and Human Verification for critical dispatches.',
    prototypeFeature: 'Manual Verification Review Queue & PII Redaction Filter',
    targetTab: 'review' as const,
  },
  {
    slideNumber: 7,
    title: 'Execution Strategy: Scalable Deployment Roadmap',
    track: 'Roadmap',
    summary: 'Phase 01: Pilot in 2 target municipal districts ➔ Phase 02: City-wide rollout ➔ Phase 03: Predictive infrastructure maintenance.',
    prototypeFeature: 'District Selector & Municipal Scaling Simulation',
    targetTab: 'dispatch' as const,
  },
  {
    slideNumber: 8,
    title: 'Technology Stack: Core ML & Engineering Framework',
    track: 'Tech Stack',
    summary: 'Python & Pandas, Scikit-Learn, TF-IDF NLP processing, SHAP/LIME Explainability weights, Streamlit console, Evaluation metrics (Precision/Recall).',
    prototypeFeature: 'SHAP Feature Weights & Evaluation Diagnostic Matrix',
    targetTab: 'review' as const,
  },
  {
    slideNumber: 9,
    title: 'Next Steps: Building Smarter, Responsive Cities',
    track: 'Vision',
    summary: 'Empowering communities with real-time AI prioritization and transparent public service response.',
    prototypeFeature: 'Interactive Live Citizen Tracking & Transparent Feedback',
    targetTab: 'citizen' as const,
  },
];

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!isOpen) return null;

  const currentSlide = SLIDES_MAPPING[activeSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-300">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Hackathon Presentation Blueprint</h3>
                <p className="text-xs text-slate-300">Interactive Slide-by-Slide Verification Matrix</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg text-lg leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Slide Navigator Dots / Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {SLIDES_MAPPING.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeSlide === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Slide {s.slideNumber}: {s.title.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Active Slide Spotlight */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                Slide #{currentSlide.slideNumber} of 9 • {currentSlide.track}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Corresponds to: <em>final_submition_613dda33.pdf</em>
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              {currentSlide.title}
            </h3>

            <p className="text-sm text-slate-700 leading-relaxed">
              {currentSlide.summary}
            </p>

            <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Prototype Implementation
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {currentSlide.prototypeFeature}
                </span>
              </div>

              <button
                onClick={() => {
                  onNavigateTab(currentSlide.targetTab);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Jump to Live Feature</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Special User Requirements Highlight */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>User Custom Instructions Implemented:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-amber-900">
              <li>
                <strong>SSN Identity Verification:</strong> Citizens log in using Social Security Number to confirm identity, check resident registry, and prevent duplicate spam.
              </li>
              <li>
                <strong>False Alarm Automatic Redirection:</strong> Whenever a report triggers false alarm indicators (such as semantic anomalies, joke tokens, or extreme sensor mismatches), the system immediately diverts it and redirects to the <strong>Manual Verification Review Page</strong> for field officer audit.
              </li>
              <li>
                <strong>Full Presentation Alignment:</strong> All 9 slides from the presentation are fully realized across Citizen Intake, AI Pipeline, Triage Engine, Review Queue, Dispatch Panel, GIS Map, and ML Explainability!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
              disabled={activeSlide === 0}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-30 cursor-pointer"
            >
              Previous Slide
            </button>
            <button
              onClick={() => setActiveSlide(Math.min(SLIDES_MAPPING.length - 1, activeSlide + 1))}
              disabled={activeSlide === SLIDES_MAPPING.length - 1}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-30 cursor-pointer"
            >
              Next Slide
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
