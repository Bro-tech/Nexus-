import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, AlertTriangle, ChevronRight, Brain, FileText, Stethoscope } from 'lucide-react';

const GLASS = 'panel-soft';

const PATIENT = {
  id: 'PT-7721-ANON',
  age: 34, sex: 'Male',
  vitals: { bp: '148/92 mmHg', hr: '102 bpm', temp: '38.7°C', rr: '22/min', spo2: '96%' },
  hpi: 'Patient presents with 3-day history of progressive shortness of breath, dry cough, and low-grade fever. Denies smoking. No recent travel. No known drug allergies. PMH: Type 2 DM (controlled).',
  labs: [
    { name: 'CBC – WBC',   value: '14.2 × 10³/μL', flag: 'HIGH', color: '#FB923C' },
    { name: 'CRP',         value: '87 mg/L',         flag: 'HIGH', color: '#F87171' },
    { name: 'Procalcitonin', value: '0.8 ng/mL',    flag: 'HIGH', color: '#FB923C' },
    { name: 'D-Dimer',     value: '0.6 μg/mL',       flag: 'NORM', color: '#34D399' },
    { name: 'LDH',         value: '310 U/L',          flag: 'HIGH', color: '#FB923C' },
  ],
  imaging: 'CXR: Bilateral lower zone patchy infiltrates. No pleural effusion. No pneumothorax.',
  ddx: [
    { dx: 'Community-Acquired Pneumonia', prob: 72, color: '#22D3EE' },
    { dx: 'COVID-19 Pneumonitis',         prob: 55, color: '#A78BFA' },
    { dx: 'Hospital-Acquired Pneumonia',  prob: 28, color: '#FB923C' },
    { dx: 'Pulmonary Embolism',           prob: 12, color: '#F87171' },
  ],
};

const entrance = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function SandboxMode() {
  const [enabled, setEnabled] = useState(false);

  const accent = enabled ? '#8B5CF6' : '#22D3EE';
  const accentBg = enabled ? 'rgba(139,92,246,0.15)' : 'rgba(34,211,238,0.15)';
  const accentBorder = enabled ? 'rgba(139,92,246,0.35)' : 'rgba(34,211,238,0.35)';

  return (
    <motion.div variants={entrance} initial="hidden" animate="visible" className="space-y-6 max-w-4xl text-slate-900 dark:text-slate-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span className="p-2.5 rounded-xl" style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
            <GraduationCap className="w-6 h-6" style={{ color: accent }} />
          </span>
          Student Doctor Sandbox
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Practice clinical reasoning on anonymized synthetic cases</p>
      </div>

      {/* Master toggle */}
      <motion.div
        animate={{ borderColor: enabled ? '#8B5CF644' : '#22D3EE44', background: enabled ? 'rgba(139,92,246,0.08)' : 'rgba(34,211,238,0.05)' }}
        transition={{ duration: 0.5 }}
        className={`${GLASS} rounded-2xl p-6 flex items-center justify-between`}
        style={{ border: `1px solid ${accentBorder}` }}
      >
        <div>
          <p className="text-slate-900 dark:text-white font-bold text-base">Enable Student Training Mode</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-0.5">
            Access anonymized synthetic patient cases for diagnostic practice
          </p>
        </div>
        {/* Toggle switch */}
        <motion.div
          onClick={() => setEnabled(!enabled)}
          className="relative w-16 h-9 rounded-full cursor-pointer flex-shrink-0 border transition-all duration-400"
          animate={{
            backgroundColor: enabled ? '#8B5CF6' : '#1e293b',
            borderColor: enabled ? '#8B5CF6aa' : '#334155',
          }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="absolute top-1 w-7 h-7 rounded-full bg-white shadow-lg"
            animate={{ x: enabled ? 28 : 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            key="sandbox-content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-5"
          >
            {/* Warning banner */}
            <motion.div
              className="flex items-start gap-3 p-4 rounded-2xl border"
              style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.3)' }}
              animate={{ borderColor: ['rgba(251,191,36,0.2)', 'rgba(251,191,36,0.5)', 'rgba(251,191,36,0.2)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-bold text-sm">Viewing Anonymized Synthetic Patient Data</p>
                <p className="text-amber-400/70 text-xs mt-0.5 font-medium">All cases are AI-generated for educational purposes only. No real patient data is used.</p>
              </div>
            </motion.div>

            {/* Patient case card */}
            <div className={`${GLASS} rounded-2xl overflow-hidden`} style={{ borderColor: '#8B5CF622' }}>
              {/* Case header */}
              <div className="p-5 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#8B5CF622', border: '1px solid #8B5CF644' }}>
                    <Stethoscope className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-extrabold text-sm">Case #{PATIENT.id}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">Age {PATIENT.age} · {PATIENT.sex} · Emergency Dept</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-bold">🎓 Training Case</span>
              </div>

              <div className="p-5 space-y-5">
                {/* Vitals */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vital Signs</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.entries(PATIENT.vitals).map(([k, v], i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/8 text-center shadow-sm">
                        <p className="text-slate-900 dark:text-white font-extrabold text-sm">{v}</p>
                        <p className="text-slate-600 dark:text-slate-500 text-[10px] font-bold uppercase">{k.replace('bp','BP').replace('hr','HR').replace('temp','Temp').replace('rr','RR').replace('spo2','SpO₂')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HPI */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> History of Present Illness</p>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium">{PATIENT.hpi}</p>
                </div>

                {/* Labs */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lab Results</p>
                  <div className="space-y-2">
                    {PATIENT.labs.map((lab, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8 shadow-sm">
                        <div className="flex-1">
                          <p className="text-slate-900 dark:text-white text-sm font-bold">{lab.name}</p>
                        </div>
                        <p className="text-slate-900 dark:text-white font-extrabold text-sm tabular-nums">{lab.value}</p>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: lab.color, background: `${lab.color}18`, border: `1px solid ${lab.color}33` }}>{lab.flag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Imaging */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Imaging</p>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium">{PATIENT.imaging}</p>
                </div>

                {/* Differential Diagnosis */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-violet-400" /> Differential Diagnosis</p>
                  <div className="space-y-2.5">
                    {PATIENT.ddx.map((d, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-slate-900 dark:text-white text-sm font-bold">{d.dx}</p>
                          <p className="text-xs font-extrabold" style={{ color: d.color }}>{d.prob}%</p>
                        </div>
                        <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${d.prob}%` }}
                            transition={{ delay: 0.4 + i * 0.07, duration: 0.8, ease: 'easeOut' }}
                            style={{ background: `linear-gradient(90deg, ${d.color}aa, ${d.color})` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
