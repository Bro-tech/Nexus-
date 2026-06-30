import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan, Pill, CheckCircle2, Clock, ChevronRight, AlarmClock,
  Camera, CameraOff, Plus, X, Trash2, Video, VideoOff, Stethoscope
} from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';

const GLASS = 'panel-soft';

// ── localStorage helpers ────────────────────────────────────────────────────
const MEDS_KEY = 'serene_medicines';
const loadMeds = () => {
  try { return JSON.parse(localStorage.getItem(MEDS_KEY)) || []; }
  catch { return []; }
};
const saveMeds = (meds) => localStorage.setItem(MEDS_KEY, JSON.stringify(meds));

// ── Default medicines (used as initial seed if empty) ───────────────────────
const defaults = [
  { id: '1', time: '8:00 AM',  name: 'Amoxicillin', dosage: '500mg',  frequency: '3× daily', status: 'taken',    color: 'cyan'    },
  { id: '2', time: '12:00 PM', name: 'Vitamin D',    dosage: '1000IU', frequency: '1× daily', status: 'taken',    color: 'emerald' },
  { id: '3', time: '6:00 PM',  name: 'Ibuprofen',    dosage: '200mg',  frequency: '2× daily', status: 'upcoming', color: 'violet'  },
  { id: '4', time: '10:00 PM', name: 'Melatonin',    dosage: '5mg',    frequency: '1× daily', status: 'upcoming', color: 'rose'    },
];

// ── Week calendar data ──────────────────────────────────────────────────────
const today = new Date();
const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const week = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - today.getDay() + i);
  return { label: weekDays[d.getDay()], date: d.getDate(), isToday: d.toDateString() === today.toDateString() };
});
const pillColors = ['bg-cyan-400', 'bg-emerald-400', 'bg-violet-400', 'bg-rose-400', 'bg-amber-400'];

const entrance = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Add Medicine Modal ──────────────────────────────────────────────────────
function AddMedicineModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('1× daily');
  const [time, setTime] = useState('08:00');
  const [errors, setErrors] = useState({});

  const freqOptions = ['1× daily', '2× daily', '3× daily', 'Every 8h', 'As needed'];

  const handleSubmit = () => {
    const e = {};
    if (!name.trim()) e.name = 'Medicine name is required';
    if (!dosage.trim()) e.dosage = 'Dosage is required';
    if (Object.keys(e).length) { setErrors(e); return; }

    // Convert 24h time input to 12h string
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const timeStr = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;

    onAdd({
      id: Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      time: timeStr,
      status: 'upcoming',
      color: ['cyan', 'emerald', 'violet', 'rose', 'amber'][Math.floor(Math.random() * 5)],
    });
    setName(''); setDosage(''); setFrequency('1× daily'); setTime('08:00'); setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Pill size={20} className="text-cyan-400" /> Add Medicine
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Medicine name */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Medicine Name</label>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                placeholder="e.g. Amoxicillin"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 ${errors.name ? 'border-red-400 ring-2 ring-red-400/20' : 'border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Dosage */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Dosage</label>
              <input
                value={dosage}
                onChange={e => { setDosage(e.target.value); setErrors(p => ({ ...p, dosage: '' })); }}
                placeholder="e.g. 500mg"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 ${errors.dosage ? 'border-red-400 ring-2 ring-red-400/20' : 'border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'}`}
              />
              {errors.dosage && <p className="text-red-400 text-xs mt-1">{errors.dosage}</p>}
            </div>

            {/* Frequency */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Frequency</label>
              <div className="flex flex-wrap gap-2">
                {freqOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFrequency(opt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${frequency === opt ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
            </div>
          </div>

          <motion.button
            onClick={handleSubmit}
            whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(34,211,238,0.35)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add to Schedule
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main AI Lens View ───────────────────────────────────────────────────────
export default function AILensView() {
  const { currentUser } = useAuth();
  const [medicines, setMedicines] = useState(() => {
    const saved = loadMeds();
    return saved.length ? saved : defaults;
  });
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedResult, setScannedResult] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Persist medicines whenever they change
  useEffect(() => { saveMeds(medicines); }, [medicines]);

  // Load doctor prescriptions
  useEffect(() => {
    if (currentUser?.uid) {
      setDoctorPrescriptions(storage.getPrescriptions(currentUser.uid));
    }
  }, [currentUser?.uid]);

  // ── Camera management ──
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera device found on this device.');
      } else {
        setCameraError('Could not access camera: ' + err.message);
      }
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    // Simulate scanning — show a mock result
    setScannedResult({
      name: 'Paracetamol',
      dosage: '650mg',
      type: 'Analgesic / Antipyretic',
      instructions: 'Take with water · Up to 3× daily',
    });
  };

  const addScannedToSchedule = () => {
    if (!scannedResult) return;
    const newMed = {
      id: Date.now().toString(),
      name: scannedResult.name,
      dosage: scannedResult.dosage,
      frequency: '3× daily',
      time: '8:00 AM',
      status: 'upcoming',
      color: ['cyan', 'emerald', 'violet', 'rose', 'amber'][Math.floor(Math.random() * 5)],
    };
    setMedicines(prev => [...prev, newMed]);
    setScannedResult(null);
  };

  const addMedicine = (med) => {
    setMedicines(prev => [...prev, med]);
  };

  const removeMedicine = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const toggleStatus = (id) => {
    setMedicines(prev => prev.map(m =>
      m.id === id ? { ...m, status: m.status === 'taken' ? 'upcoming' : 'taken' } : m
    ));
  };

  return (
    <motion.div variants={entrance} initial="hidden" animate="visible" className="space-y-6 max-w-5xl text-slate-900 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30"><Scan className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /></span>
            AI Lens & Medication Calendar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Scan prescriptions or add medicines manually. Never miss a dose.</p>
        </div>

        {/* Add Medicine Button */}
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(34,211,238,0.3)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg"
        >
          <Plus size={16} /> Add Medicine
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Camera Scanner ── */}
        <div className={`${GLASS} rounded-2xl overflow-hidden`}>
          {/* Camera viewfinder */}
          <div
            className="relative h-72 select-none"
            style={{ background: cameraActive ? '#000' : 'linear-gradient(135deg, #0a1628 0%, #0f2240 100%)' }}
          >
            {/* Live video feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Corner brackets (always shown) */}
            {[['top-4 left-4','border-t-2 border-l-2'], ['top-4 right-4','border-t-2 border-r-2'], ['bottom-4 left-4','border-b-2 border-l-2'], ['bottom-4 right-4','border-b-2 border-r-2']].map(([pos, border], i) => (
              <div key={i} className={`absolute ${pos} w-8 h-8 ${border} border-cyan-400/80 rounded-sm z-10`} />
            ))}

            {/* Scanning laser line (only when camera is active) */}
            {cameraActive && (
              <motion.div
                className="absolute left-6 right-6 h-0.5 rounded-full z-10"
                style={{ background: 'linear-gradient(90deg, transparent, #22D3EE, #22D3EE, transparent)', boxShadow: '0 0 12px 3px rgba(34,211,238,0.6)' }}
                animate={{ y: [0, 240, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Camera start/stop button + status */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
              {!cameraActive && !cameraError && (
                <>
                  <motion.button
                    onClick={startCamera}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Camera size={28} className="text-cyan-400" />
                  </motion.button>
                  <p className="text-cyan-400/70 text-xs font-bold uppercase tracking-widest">Tap to open camera</p>
                </>
              )}

              {cameraError && (
                <div className="text-center px-6">
                  <CameraOff size={32} className="text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 text-xs font-semibold">{cameraError}</p>
                  <button onClick={startCamera} className="mt-3 text-xs text-cyan-400 underline font-bold">Try Again</button>
                </div>
              )}
            </div>

            {/* Top bar — Live indicator + toggle camera */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              {cameraActive && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Live</span>
                </div>
              )}
              {cameraActive && (
                <button
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/30 transition-colors"
                >
                  <VideoOff size={13} /> Stop
                </button>
              )}
            </div>

            {/* Capture button */}
            {cameraActive && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                <motion.button
                  onClick={handleCapture}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-white border-4 border-cyan-400 shadow-lg shadow-cyan-500/30 flex items-center justify-center"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-400" />
                </motion.button>
              </div>
            )}
          </div>

          {/* Scan result / instructions */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {scannedResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest mb-1">Scanned Result</p>
                      <p className="text-slate-900 dark:text-white font-extrabold text-lg">{scannedResult.name} {scannedResult.dosage}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 font-medium">{scannedResult.type} · {scannedResult.instructions}</p>
                      <div className="flex gap-2 mt-3">
                        <motion.button
                          onClick={addScannedToSchedule}
                          whileTap={{ scale: 0.96 }}
                          className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                        >
                          + Add to schedule
                        </motion.button>
                        <button
                          onClick={() => setScannedResult(null)}
                          className="px-3 py-1.5 rounded-full bg-white/8 text-slate-400 text-xs font-bold border border-white/10 hover:bg-white/15 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/8">
                  <Scan className="w-4 h-4 text-slate-500" />
                  <p className="text-slate-500 text-sm font-medium">
                    {cameraActive ? 'Point at a prescription label, then tap the capture button' : 'Open camera to scan a prescription, or add medicines manually'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Medicine Calendar ── */}
        <div className={`${GLASS} rounded-2xl p-5 space-y-5`}>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <AlarmClock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Medication Schedule
          </h3>

          {/* Weekly pill calendar */}
          <div className="grid grid-cols-7 gap-1.5">
            {week.map((day, i) => (
              <div key={i} className={`flex flex-col items-center rounded-xl p-2 ${day.isToday ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-white/5 border border-white/8'}`}>
                <span className="text-xs font-bold text-slate-400 mb-1">{day.label}</span>
                <span className={`text-sm font-extrabold ${day.isToday ? 'text-cyan-300' : 'text-white'}`}>{day.date}</span>
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {medicines.slice(0, 2).map((med, j) => (
                    <div key={j} className={`w-2 h-2 rounded-full bg-${med.color}-400 shadow-sm`} />
                  ))}
                  {medicines.length > 2 && (
                    <span className="text-[8px] text-slate-500 font-bold">+{medicines.length - 2}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dose timeline */}
          <div className="space-y-2.5">
            {/* ── Doctor Prescriptions Section ── */}
            {doctorPrescriptions.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Stethoscope size={12} /> Doctor Prescriptions ({doctorPrescriptions.length})
                </p>
                {doctorPrescriptions.map((rx, i) => (
                  <motion.div
                    key={rx.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-violet-500/30 bg-violet-500/10"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-500/20">
                      <Stethoscope className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {rx.name} <span className="text-slate-500 font-normal">{rx.dosage}</span>
                      </p>
                      <p className="text-[10px] text-violet-400 font-bold uppercase tracking-tighter mt-0.5">
                        {rx.time} · {rx.frequency}
                      </p>
                      {rx.notes && <p className="text-[10px] text-slate-500 mt-0.5 italic">{rx.notes}</p>}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 flex-shrink-0">
                      🩺 Prescribed
                    </span>
                  </motion.div>
                ))}
                <div className="border-t border-white/10 pt-2" />
              </div>
            )}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today's Doses ({medicines.length})</p>
            {medicines.length === 0 && (
              <div className="p-6 text-center rounded-xl bg-white/5 border border-white/8">
                <Pill size={24} className="text-slate-500 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-medium">No medicines yet. Scan or add one!</p>
              </div>
            )}
            {medicines.map((med, i) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.35, ease: 'easeOut' }}
                className={`flex items-center gap-3 p-3 rounded-xl border group ${
                  med.status === 'taken'
                    ? 'bg-emerald-500/8 border-emerald-500/20'
                    : 'bg-white/5 border-white/8'
                }`}
              >
                <button
                  onClick={() => toggleStatus(med.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    med.status === 'taken' ? 'bg-emerald-500/20 hover:bg-emerald-500/30' : 'bg-white/8 hover:bg-white/15'
                  }`}
                >
                  {med.status === 'taken'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    : <Clock className="w-4 h-4 text-slate-500" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${med.status === 'taken' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {med.name} {med.dosage}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{med.time} · {med.frequency}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  med.status === 'taken'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-white/8 text-slate-500'
                }`}>
                  {med.status === 'taken' ? 'Taken' : 'Upcoming'}
                </span>
                <button
                  onClick={() => removeMedicine(med.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-all"
                  title="Remove medicine"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <AddMedicineModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addMedicine}
      />
    </motion.div>
  );
}
