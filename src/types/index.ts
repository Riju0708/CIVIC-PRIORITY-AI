export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ROUTINE';

export type IncidentCategory = 
  | 'Gas & Hazard'
  | 'Water & Sewage'
  | 'Road & Transit'
  | 'Electrical Grid'
  | 'Structural & Bridge'
  | 'Public Sanitation';

export type IncidentStatus = 
  | 'TRIAGE_ANALYZING'
  | 'FLAGGED_MANUAL_REVIEW'
  | 'DISPATCH_READY'
  | 'UNIT_EN_ROUTE'
  | 'ON_SITE_REPAIR'
  | 'RESOLVED'
  | 'REJECTED_FALSE_ALARM';

export interface SHAPFactor {
  name: string;
  weight: number; // positive = raises priority, negative = lowers
  description: string;
  category: 'threat' | 'density' | 'sensor' | 'credibility' | 'sentiment';
}

export interface IncidentReport {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  originalLanguage: string;
  category: IncidentCategory;
  priorityLevel: PriorityLevel;
  priorityScore: number; // 0 - 100
  communityPressureScore: number; // 0 - 100 (based on spatial density)
  duplicateClusterId?: string;
  duplicateCount: number;
  
  // Citizen & SSN Verification
  citizenSsn: string; // tokenized e.g. "XXX-XX-4819"
  citizenName: string; // anonymized in PII mode
  ssnHash: string; // e.g. "HASH_A89F2"
  reporterReputationScore: number; // 0 - 100
  
  // Location
  locationName: string;
  district: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  
  // Audio & Evidence
  hasVoiceAudio: boolean;
  audioDurationSeconds?: number;
  imageUrl?: string;
  
  // False Alarm & Review Tracking
  isFalseAlarmSuspected: boolean;
  falseAlarmConfidence: number; // 0 - 100%
  falseAlarmReason?: string;
  status: IncidentStatus;
  
  // Department & Dispatch
  assignedDepartment: string;
  assignedUnit?: string;
  etaMinutes?: number;
  
  // Explainability
  shapFactors: SHAPFactor[];
  
  createdAt: string;
  updatedAt: string;
  reviewedByOfficer?: string;
  reviewNotes?: string;
}

export interface CitizenUser {
  ssn: string; // format XXX-XX-XXXX
  maskedSsn: string;
  fullName: string;
  district: string;
  phone: string;
  reputationScore: number; // e.g. 96
  priorFalseAlarms: number;
  activeReportsCount: number;
  verifiedIdentity: boolean;
}

export interface MunicipalDepartment {
  id: string;
  name: string;
  code: string;
  category: IncidentCategory;
  activeUnits: number;
  availableUnits: number;
  avgResponseMins: number;
}
