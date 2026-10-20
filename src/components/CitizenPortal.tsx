import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Volume2, 
  Layers, 
  Camera, 
  Globe, 
  Flame, 
  Droplet, 
  Zap, 
  Building2, 
  Truck, 
  HelpCircle,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  VolumeX,
  Type
} from 'lucide-react';
import { CitizenUser, IncidentCategory, IncidentReport } from '../types';
import { analyzeIncidentNLP } from '../utils/aiTriageEngine';
import { MUNICIPAL_DISTRICTS } from '../data/mockData';

interface CitizenPortalProps {
  currentUser: CitizenUser;
  onOpenSsnModal: () => void;
  onSubmitReport: (report: IncidentReport) => void;
  onFalseAlarmRedirect: (flaggedIncidentId: string) => void;
  existingIncidents: IncidentReport[];
  piiRedactionEnabled: boolean;
}

const COMMON_ISSUES = [
  {
    id: 'gas',
    label: 'Gas Leak / Fire Risk',
    icon: Flame,
    color: 'border-red-400 bg-red-50 text-red-700 hover:border-red-600',
    defaultText: 'Strong natural gas smell and hissing noise coming from sidewalk valve near children playground.',
    category: 'Gas & Hazard' as IncidentCategory,
    district: 'District 3 - Metro Transit Corridor',
    location: 'Lincoln Ave & 4th Street (School Zone)',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80',
    urgency: 'CRITICAL',
  },
  {
    id: 'water',
    label: 'Water Main / Flooding',
    icon: Droplet,
    color: 'border-blue-400 bg-blue-50 text-blue-700 hover:border-blue-600',
    defaultText: 'Major water pipe break flooding street lanes and sidewalk. Water pouring towards shop basements.',
    category: 'Water & Sewage' as IncidentCategory,
    district: 'District 1 - Downtown Civic Core',
    location: 'Market Street & 8th Crossing',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    urgency: 'HIGH',
  },
  {
    id: 'power',
    label: 'Downed Wire / Sparks',
    icon: Zap,
    color: 'border-amber-400 bg-amber-50 text-amber-800 hover:border-amber-600',
    defaultText: 'Broken electrical wire hanging down across guardrail near pedestrian path with sparks flying.',
    category: 'Electrical Grid' as IncidentCategory,
    district: 'District 4 - South Riverside Industrial',
    location: 'Bay Greenway Bike Path Mile 3.2',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
    urgency: 'CRITICAL',
  },
  {
    id: 'road',
    label: 'Deep Pothole / Road Damage',
    icon: Truck,
    color: 'border-emerald-400 bg-emerald-50 text-emerald-800 hover:border-emerald-600',
    defaultText: 'Large pothole about 6 inches deep in the middle of driving lane causing cars to swerve.',
    category: 'Road & Transit' as IncidentCategory,
    district: 'District 2 - North Oakridge Suburbs',
    location: '241 Elmwood Terrace',
    image: '',
    urgency: 'ROUTINE',
  },
  {
    id: 'fake',
    label: '⚠️ Test False Alarm (Prank / Hoax)',
    icon: AlertTriangle,
    color: 'border-purple-400 bg-purple-50 text-purple-800 hover:border-purple-600',
    defaultText: 'There is a giant alien godzilla monster with green lasers destroying City Hall stairs right now lol just kidding haha.',
    category: 'Structural & Bridge' as IncidentCategory,
    district: 'District 1 - Downtown Civic Core',
    location: 'City Hall Plaza West Steps',
    image: '',
    urgency: 'FALSE_ALARM',
  },
];

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  currentUser,
  onOpenSsnModal,
  onSubmitReport,
  onFalseAlarmRedirect,
  existingIncidents,
  piiRedactionEnabled,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<string>('gas');
  const [description, setDescription] = useState(COMMON_ISSUES[0].defaultText);
  const [district, setDistrict] = useState(currentUser.district || MUNICIPAL_DISTRICTS[0]);
  const [locationName, setLocationName] = useState('Lincoln Ave & 4th Street (School Zone)');
  const [selectedImage, setSelectedImage] = useState<string>(COMMON_ISSUES[0].image);
  
  // Voice recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasVoiceAudio, setHasVoiceAudio] = useState(false);

  // Senior / Low Tech Accessibility
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [isSpeakingInstruction, setIsSpeakingInstruction] = useState(false);

  // Real-time analysis
  const [analysis, setAnalysis] = useState(() => 
    analyzeIncidentNLP(description, district, currentUser.reputationScore, existingIncidents)
  );

  useEffect(() => {
    const res = analyzeIncidentNLP(description, district, currentUser.reputationScore, existingIncidents);
    setAnalysis(res);
  }, [description, district, currentUser.reputationScore, existingIncidents]);

  // Recording counter
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasVoiceAudio(true);
      if (!description || description === COMMON_ISSUES[0].defaultText) {
        setDescription('Recorded Voice Message: "Hello city hall, there is a dangerous gas leak hissing near the school sidewalk. It smells very strong and we need an emergency repair team."');
      }
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
    }
  };

  const handleSelectIssue = (issue: typeof COMMON_ISSUES[0]) => {
    setSelectedIssue(issue.id);
    setDescription(issue.defaultText);
    setDistrict(issue.district);
    setLocationName(issue.location);
    setSelectedImage(issue.image);
    setHasVoiceAudio(issue.id === 'gas' || issue.id === 'fake');
  };

  // Check neighbor duplicate count
  const duplicateMatches = existingIncidents.filter(
    inc => inc.district === district && inc.category === analysis.category && inc.status !== 'RESOLVED'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const isFalseAlarm = analysis.isFalseAlarmSuspected;
    const ticketNumber = `CP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident: IncidentReport = {
      id: `inc-${Date.now()}`,
      ticketNumber,
      title: description.slice(0, 50) + (description.length > 50 ? '...' : ''),
      description: description,
      originalLanguage: 'English',
      category: analysis.category,
      priorityLevel: analysis.priorityLevel,
      priorityScore: analysis.priorityScore,
      communityPressureScore: analysis.communityPressureScore,
      duplicateCount: duplicateMatches.length + 1,
      duplicateClusterId: duplicateMatches.length > 0 ? duplicateMatches[0].duplicateClusterId || `cluster-${Date.now()}` : undefined,
      citizenSsn: currentUser.maskedSsn,
      citizenName: currentUser.fullName,
      ssnHash: `HASH_${currentUser.ssn.slice(-4)}`,
      reporterReputationScore: currentUser.reputationScore,
      locationName: locationName,
      district: district,
      coordinates: {
        x: Math.floor(25 + Math.random() * 50),
        y: Math.floor(25 + Math.random() * 50),
        lat: 37.7749 + (Math.random() - 0.5) * 0.04,
        lng: -122.4194 + (Math.random() - 0.5) * 0.04,
      },
      hasVoiceAudio: hasVoiceAudio,
      audioDurationSeconds: hasVoiceAudio ? (recordingSeconds || 14) : undefined,
      imageUrl: selectedImage || undefined,
      isFalseAlarmSuspected: isFalseAlarm,
      falseAlarmConfidence: analysis.falseAlarmConfidence,
      falseAlarmReason: analysis.falseAlarmReason,
      status: isFalseAlarm ? 'FLAGGED_MANUAL_REVIEW' : 'DISPATCH_READY',
      assignedDepartment: analysis.assignedDepartment,
      shapFactors: analysis.shapFactors,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmitReport(newIncident);

    if (isFalseAlarm) {
      // Crucial requirement: "in case the user reports false alarm it should redirect the system to a review page for manual verification"
      onFalseAlarmRedirect(newIncident.id);
    }
  };

  // Simple Text-to-speech simulation for non-tech citizens
  const toggleSpeechGuidance = () => {
    setIsSpeakingInstruction(!isSpeakingInstruction);
  };

  return (
    <div className={`max-w-5xl mx-auto space-y-6 ${
      fontSizeScale === 'large' ? 'text-lg' : fontSizeScale === 'xlarge' ? 'text-xl' : 'text-base'
    }`}>
      {/* Friendly Top Welcome & Senior Accessibility Helper */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Report a City Problem
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Free 24/7 City Service
            </span>
          </div>
          <p className="text-base text-slate-600 mt-1">
            Easy 3-step report for roads, water, gas, electricity, and safety hazards.
          </p>
        </div>

        {/* Accessibility Tools: Font size & Read Aloud */}
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 uppercase px-1">Text Size:</span>
          <button
            type="button"
            onClick={() => setFontSizeScale('normal')}
            className={`w-9 h-9 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              fontSizeScale === 'normal' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700'
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSizeScale('large')}
            className={`w-9 h-9 rounded-xl font-bold text-base transition-all cursor-pointer ${
              fontSizeScale === 'large' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700'
            }`}
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => setFontSizeScale('xlarge')}
            className={`w-9 h-9 rounded-xl font-bold text-lg transition-all cursor-pointer ${
              fontSizeScale === 'xlarge' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700'
            }`}
          >
            A++
          </button>

          <button
            type="button"
            onClick={toggleSpeechGuidance}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeakingInstruction ? 'bg-amber-500 text-white animate-pulse' : 'bg-white text-slate-700'
            }`}
          >
            {isSpeakingInstruction ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
            <span>{isSpeakingInstruction ? 'Stop Voice' : 'Read to Me'}</span>
          </button>
        </div>
      </div>

      {/* Voice Guidance Banner if active */}
      {isSpeakingInstruction && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900 animate-in fade-in">
          <Volume2 className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-base block">Voice Assistant Active:</span>
            <p className="text-sm mt-0.5 leading-relaxed">
              "Step 1: Tap the big icon for the problem you see. Step 2: Press the big red microphone to speak, or write a description. Step 3: Check your street address and press Submit. The city will handle the rest!"
            </p>
          </div>
        </div>
      )}

      {/* Verified Citizen SSN Badge */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-xs">
            {currentUser.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-lg">
                Logged in as: {currentUser.fullName}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-blue-800 border border-blue-300">
                SSN: {piiRedactionEnabled ? currentUser.maskedSsn : currentUser.ssn}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">
              Identity Confirmed • Resident Standing: <span className="font-bold text-emerald-700">{currentUser.reputationScore}% Verified</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSsnModal}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-sm rounded-xl border-2 border-blue-300 transition-colors shadow-2xs cursor-pointer"
        >
          Change SSN / Citizen
        </button>
      </div>

      {/* Main Guided Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Select Problem Type (Big Friendly Cards) */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg">
              1
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                What type of problem did you see?
              </h3>
              <p className="text-sm text-slate-500">
                Tap the card that matches your situation best
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {COMMON_ISSUES.map((issue) => {
              const Icon = issue.icon;
              const isSelected = selectedIssue === issue.id;

              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => handleSelectIssue(issue)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-4 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 ring-3 ring-blue-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-extrabold text-base text-slate-900 block">
                      {issue.label}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {issue.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Describe or Speak (Super Easy Speech Option) */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg">
              2
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Tell us what happened
              </h3>
              <p className="text-sm text-slate-500">
                You can talk into your microphone or write a few words
              </p>
            </div>
          </div>

          {/* Big Friendly Microphone Button */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 text-center space-y-3">
            <button
              type="button"
              onClick={toggleRecording}
              className={`inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-extrabold text-lg text-white shadow-md transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-red-600 animate-pulse ring-4 ring-red-400' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-6 h-6" />
                  <span>Listening... Tap to Stop ({recordingSeconds}s)</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  <span>🎙️ Tap to Speak (Voice Message)</span>
                </>
              )}
            </button>

            {hasVoiceAudio && !isRecording && (
              <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Voice message recorded and ready for city review</span>
              </p>
            )}

            <p className="text-xs text-slate-400">
              Ideal for seniors or anyone on mobile: just press, describe the danger, and release.
            </p>
          </div>

          {/* Text Description Box */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Written Description:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Water is pouring onto the street from a cracked underground pipe..."
              className="w-full text-base sm:text-lg border-2 border-slate-200 rounded-2xl p-4 bg-white text-slate-900 focus:outline-none focus:border-blue-600 leading-relaxed"
              required
            />
          </div>

          {/* Optional Photo Attachment */}
          {selectedImage && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={selectedImage} alt="Hazard evidence" className="w-16 h-16 object-cover rounded-xl border border-slate-300" />
                <div>
                  <span className="font-bold text-sm text-slate-800 block">Photo Evidence Attached</span>
                  <span className="text-xs text-slate-500">Helps municipal workers bring the right tools</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage('')}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                Remove Photo
              </button>
            </div>
          )}
        </div>

        {/* STEP 3: Location Confirmation */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg">
              3
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Where is this located?
              </h3>
              <p className="text-sm text-slate-500">
                Check the street or select your neighborhood
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                City District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-base border-2 border-slate-200 rounded-xl p-3 bg-white text-slate-800 font-medium focus:border-blue-600"
              >
                {MUNICIPAL_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Street Address or Cross-Street
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full text-base border-2 border-slate-200 rounded-xl p-3 bg-white text-slate-800 font-medium focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Neighbor Duplicate Notice (Innovative Civic Reassurance) */}
          {duplicateMatches.length > 0 && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-start gap-3 text-blue-900">
              <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-base block text-blue-950">
                  Good news: {duplicateMatches.length} neighbors on your block already reported this!
                </span>
                <p className="text-sm text-blue-800 mt-0.5">
                  Your SSN report has been linked to ticket <strong>#{duplicateMatches[0].ticketNumber}</strong>. This elevates the city priority score to <strong>{analysis.communityPressureScore}%</strong> so trucks arrive faster without jamming dispatch queues.
                </p>
              </div>
            </div>
          )}

          {/* False Alarm Notice (Direct requirement from user) */}
          {analysis.isFalseAlarmSuspected && (
            <div className="p-5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start gap-3 text-amber-950">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-lg block text-amber-950">
                  Officer Review Required
                </span>
                <p className="text-sm text-amber-900 mt-1 leading-relaxed">
                  Our system flagged this report as unusual ({analysis.falseAlarmReason || 'Unconfirmed semantic details'}).
                </p>
                <p className="text-sm text-amber-950 font-bold mt-2">
                  ➔ When you click Submit, you will be redirected to the <strong>Manual Verification Review Page</strong> so an officer can verify it.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Big Submit Button */}
        <div className="space-y-3">
          <button
            type="submit"
            className={`w-full py-5 px-8 rounded-3xl font-extrabold text-xl text-white shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer ${
              analysis.isFalseAlarmSuspected 
                ? 'bg-amber-600 hover:bg-amber-700 ring-4 ring-amber-200' 
                : 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-200'
            }`}
          >
            {analysis.isFalseAlarmSuspected ? (
              <>
                <AlertTriangle className="w-6 h-6" />
                <span>Submit & Go to Officer Review Page</span>
                <ArrowRight className="w-6 h-6" />
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span>Submit Verified City Report</span>
              </>
            )}
          </button>

          <p className="text-center text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-500" />
            <span>If someone is injured or in immediate danger, please dial <strong>911</strong> right away.</span>
          </p>
        </div>
      </form>
    </div>
  );
};
