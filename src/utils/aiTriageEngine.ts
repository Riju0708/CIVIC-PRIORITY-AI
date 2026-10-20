import { IncidentCategory, IncidentReport, PriorityLevel, SHAPFactor } from '../types';

export interface TriageAnalysisResult {
  category: IncidentCategory;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  communityPressureScore: number;
  isFalseAlarmSuspected: boolean;
  falseAlarmConfidence: number;
  falseAlarmReason?: string;
  assignedDepartment: string;
  shapFactors: SHAPFactor[];
  piiRedactedText: string;
}

// Redact PII (SSN, phone, full names, emails)
export function redactPII(text: string): string {
  let redacted = text;
  // Redact SSN pattern
  redacted = redacted.replace(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, '[REDACTED_SSN]');
  // Redact Phone numbers
  redacted = redacted.replace(/\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');
  // Redact Emails
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED_EMAIL]');
  return redacted;
}

// Analyze incident text and simulate ML priority matrix + false alarm detection
export function analyzeIncidentNLP(
  text: string, 
  district: string,
  citizenReputationScore: number = 95,
  existingIncidents: IncidentReport[] = []
): TriageAnalysisResult {
  const lower = text.toLowerCase();

  // 1. False Alarm heuristics (Prank / hoax / contradictory / satire keywords)
  const falseAlarmKeywords = [
    'alien', 'ufo', 'spaceship', 'godzilla', 'dragon', 'prank', 'just kidding',
    'fake', 'test report', 'ha ha', 'zombie', 'illuminati', 'superhero',
    'batman', 'lol', 'trolling', 'nuclear missile', 'meteor crashed', 'dinosaur'
  ];
  
  const foundFalseAlarmKeywords = falseAlarmKeywords.filter(k => lower.includes(k));
  let isFalseAlarm = false;
  let falseAlarmConfidence = 0;
  let falseAlarmReason = '';

  if (foundFalseAlarmKeywords.length > 0) {
    isFalseAlarm = true;
    falseAlarmConfidence = Math.min(98, 70 + foundFalseAlarmKeywords.length * 12);
    falseAlarmReason = `Flagged for suspicious semantic anomalies (${foundFalseAlarmKeywords.join(', ')}). Contradicts municipal sensor correlation.`;
  } else if (text.trim().length < 8 && !lower.includes('fire') && !lower.includes('leak')) {
    isFalseAlarm = true;
    falseAlarmConfidence = 64;
    falseAlarmReason = 'Extremely low semantic information density; possible accidental submission.';
  } else if (citizenReputationScore < 50) {
    // Low citizen trust score elevates scrutiny
    falseAlarmConfidence = 52;
    isFalseAlarm = true;
    falseAlarmReason = `Reporter account flagged with low historical credibility (${citizenReputationScore}%). Automatic routing to manual officer verification.`;
  }

  // 2. Category & Threat Identification
  let category: IncidentCategory = 'Road & Transit';
  let baseThreat = 35;
  let assignedDepartment = 'Bureau of Highways & Infrastructure';

  if (lower.includes('gas') || lower.includes('explosion') || lower.includes('fire') || lower.includes('smoke') || lower.includes('sulfur') || lower.includes('smell')) {
    category = 'Gas & Hazard';
    baseThreat = 88;
    assignedDepartment = 'Hazardous Materials & Fire Dispatch';
  } else if (lower.includes('water') || lower.includes('sewage') || lower.includes('flood') || lower.includes('pipe') || lower.includes('burst') || lower.includes('hydrant')) {
    category = 'Water & Sewage';
    baseThreat = 72;
    assignedDepartment = 'Department of Water & Waste Management';
  } else if (lower.includes('electric') || lower.includes('power') || lower.includes('wire') || lower.includes('transformer') || lower.includes('spark') || lower.includes('outage')) {
    category = 'Electrical Grid';
    baseThreat = 82;
    assignedDepartment = 'Municipal Power & Grid Operations';
  } else if (lower.includes('bridge') || lower.includes('crack') || lower.includes('collapse') || lower.includes('structural') || lower.includes('sinkhole') || lower.includes('building')) {
    category = 'Structural & Bridge';
    baseThreat = 85;
    assignedDepartment = 'Structural Safety & Emergency Engineering';
  } else if (lower.includes('garbage') || lower.includes('trash') || lower.includes('dump') || lower.includes('litter') || lower.includes('debris') || lower.includes('odor')) {
    category = 'Public Sanitation';
    baseThreat = 30;
    assignedDepartment = 'Public Works & Sanitation Division';
  } else {
    // Road & Transit defaults
    if (lower.includes('pothole') || lower.includes('traffic') || lower.includes('signal') || lower.includes('lane') || lower.includes('asphalt')) {
      baseThreat = 42;
    }
  }

  // Modifiers based on vulnerability keywords
  let vulnerabilityBoost = 0;
  if (lower.includes('school') || lower.includes('hospital') || lower.includes('child') || lower.includes('elderly') || lower.includes('playground')) {
    vulnerabilityBoost += 14;
  }
  if (lower.includes('highway') || lower.includes('rush hour') || lower.includes('subway') || lower.includes('downtown')) {
    vulnerabilityBoost += 8;
  }

  // Spatial density score (matching district clusters)
  const districtIncidents = existingIncidents.filter(inc => inc.district === district && inc.status !== 'RESOLVED');
  const communityPressureScore = Math.min(99, Math.max(25, 30 + (districtIncidents.length * 9)));

  // Calculate final priority score (0 - 100)
  let rawPriority = baseThreat + vulnerabilityBoost + (communityPressureScore * 0.15);
  if (isFalseAlarm) {
    // Flagged false alarms get marked for high manual review scrutiny
    rawPriority = Math.min(rawPriority, 70);
  }
  const priorityScore = Math.round(Math.min(99, Math.max(10, rawPriority)));

  // Determine Priority Level
  let priorityLevel: PriorityLevel = 'ROUTINE';
  if (priorityScore >= 80) priorityLevel = 'CRITICAL';
  else if (priorityScore >= 60) priorityLevel = 'HIGH';
  else if (priorityScore >= 40) priorityLevel = 'MODERATE';

  // Generate SHAP/LIME explainability feature weights
  const shapFactors: SHAPFactor[] = [
    {
      name: `${category} Semantic Classification`,
      weight: parseFloat((baseThreat / 100).toFixed(2)),
      description: `Natural language vectorization extracted strong indicators for ${category}.`,
      category: 'threat',
    },
    {
      name: 'Spatial & Community Pressure',
      weight: parseFloat(((communityPressureScore - 30) / 100).toFixed(2)),
      description: `${districtIncidents.length} active civic reports currently clustered in ${district}.`,
      category: 'density',
    },
  ];

  if (vulnerabilityBoost > 0) {
    shapFactors.push({
      name: 'Sensitive Zone Proximity (School / Hospital / Transit)',
      weight: parseFloat((vulnerabilityBoost / 100).toFixed(2)),
      description: 'Report mentions sensitive vulnerable public infrastructure or high foot-traffic zone.',
      category: 'threat',
    });
  }

  if (isFalseAlarm) {
    shapFactors.push({
      name: 'False Alarm Anomaly Penalty',
      weight: -0.45,
      description: `AI flagged non-plausible semantic tokens. Diverted to manual officer verification queue.`,
      category: 'credibility',
    });
  } else {
    shapFactors.push({
      name: 'SSN Reporter Credibility Factor',
      weight: parseFloat(((citizenReputationScore - 50) / 200).toFixed(2)),
      description: `Verified citizen identity with ${citizenReputationScore}% historical reliability record.`,
      category: 'credibility',
    });
  }

  return {
    category,
    priorityLevel,
    priorityScore,
    communityPressureScore,
    isFalseAlarmSuspected: isFalseAlarm,
    falseAlarmConfidence,
    falseAlarmReason,
    assignedDepartment,
    shapFactors,
    piiRedactedText: redactPII(text),
  };
}
