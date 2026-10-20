import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, AlertCircle, Sparkles, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { CitizenUser } from '../types';
import { SAMPLE_CITIZENS } from '../data/mockData';

interface SSNAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CitizenUser;
  onSelectUser: (user: CitizenUser) => void;
}

export const SSNAuthModal: React.FC<SSNAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [inputSsn, setInputSsn] = useState('');
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  // Format SSN input with dashes: XXX-XX-XXXX
  const handleSsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 9) val = val.slice(0, 9);
    
    let formatted = val;
    if (val.length > 5) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 5)}-${val.slice(5)}`;
    } else if (val.length > 3) {
      formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
    }
    setInputSsn(formatted);
    setError(null);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = inputSsn.replace(/\D/g, '');
    if (cleanDigits.length !== 9) {
      setError('Please enter a standard 9-digit Social Security Number (like 000-00-0000).');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const existing = SAMPLE_CITIZENS.find(c => c.ssn === inputSsn);
      if (existing) {
        onSelectUser(existing);
      } else {
        const newUser: CitizenUser = {
          ssn: inputSsn,
          maskedSsn: `***-**-${cleanDigits.slice(5)}`,
          fullName: inputName.trim() || 'Verified Citizen',
          district: 'District 1 - Downtown Civic Core',
          phone: '+1 (555) 789-0123',
          reputationScore: 95,
          priorFalseAlarms: 0,
          activeReportsCount: 0,
          verifiedIdentity: true,
        };
        onSelectUser(newUser);
      }
      setIsVerifying(false);
      onClose();
    }, 500);
  };

  const handleSelectPreset = (user: CitizenUser) => {
    setIsVerifying(true);
    setTimeout(() => {
      onSelectUser(user);
      setIsVerifying(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-6">
        {/* Friendly Top Header */}
        <div className="bg-blue-600 text-white p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Citizen Identity Check
                </h3>
                <p className="text-sm text-blue-100 mt-0.5">
                  Safe, private login to prevent duplicate reports
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-blue-200 hover:text-white p-2 rounded-xl text-xl leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Simple Explanation for non-tech citizens */}
          <div className="mt-4 bg-white/10 rounded-2xl p-4 text-xs sm:text-sm text-blue-50 flex items-start gap-3 border border-white/20">
            <Info className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-white text-sm">Why is your SSN needed?</strong>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5 leading-relaxed">
                1. <strong>Stops duplicate tickets:</strong> If 5 neighbors report the same broken pipe, the city groups them together so repair trucks arrive faster.<br/>
                2. <strong>Prevents false alarms:</strong> Confirms genuine residents and prevents hoax calls from wasting emergency fire and medical crews.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick 1-Click Demo Profiles */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Choose a Test Citizen Profile (1-Click)
            </label>
            <div className="grid grid-cols-1 gap-3">
              {SAMPLE_CITIZENS.map((citizen) => {
                const isCurrent = currentUser.ssn === citizen.ssn;
                const isRisky = citizen.reputationScore < 50;

                return (
                  <button
                    key={citizen.ssn}
                    type="button"
                    onClick={() => handleSelectPreset(citizen)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      isCurrent 
                        ? 'border-blue-600 bg-blue-50/80 shadow-sm' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                        isRisky ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {citizen.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base text-slate-900">{citizen.fullName}</span>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-200/80 rounded-md text-slate-700">
                            SSN: {citizen.maskedSsn}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {citizen.district}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isRisky ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {citizen.reputationScore}% Good Standing
                      </span>
                      {citizen.priorFalseAlarms > 0 && (
                        <div className="text-xs text-rose-600 font-bold mt-0.5">
                          {citizen.priorFalseAlarms} False Alarms
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-bold">
              Or Type Custom Number
            </span>
          </div>

          {/* Simple Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                placeholder="e.g. Maria Gonzalez"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-0"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Social Security Number (9 Digits)
              </label>
              <input
                type="text"
                placeholder="000-00-0000"
                value={inputSsn}
                onChange={handleSsnChange}
                maxLength={11}
                className="w-full px-4 py-3 text-lg font-mono tracking-widest border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-0"
                required
              />
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Protected by City Privacy Law. Never shared or sold.</span>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Checking City Registry...</span>
              ) : (
                <>
                  <span>Confirm My Identity</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
