import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Stethoscope, FileText, LogOut, ChevronRight,
  Activity, Moon, Pill, CheckCircle2,
  BookHeart, Plus, X, Loader2,
  Calendar, Edit2, Save, User
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Logo, LogoIcon } from '../components/ui/Logo';

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ doctor, onClose, onSave }) {
  const [name, setName] = useState(doctor.displayName || '');
  const [specialty, setSpecialty] = useState(doctor.specialty || '');
  const [hospital, setHospital] = useState(doctor.hospital || '');
  const [bio, setBio] = useState(doctor.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    // Update in mock DB
    const users = JSON.parse(localStorage.getItem('serene_mock_db_users') || '[]');
    const idx = users.findIndex(u => u.uid === doctor.uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], displayName: name, specialty, hospital, bio };
      localStorage.setItem('serene_mock_db_users', JSON.stringify(users));
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onSave({ ...doctor, displayName: name, specialty, hospital, bio });
      onClose();
    }, 700);
  };

  const inputCls = 'w-full bg-white/5 dark:bg-white/5 bg-slate-100 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-purple-400 dark:focus:border-purple-400 transition-all';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl z-10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit2 size={18} className="text-purple-500" /> Edit Profile
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {saved ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-900 dark:text-white font-bold text-lg">Profile Updated!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Name" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Specialty</label>
              <input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g. General Physician" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Hospital / Clinic</label>
              <input value={hospital} onChange={e => setHospital(e.target.value)} placeholder="e.g. Apollo Hospital" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Short Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="A few words about yourself..." className={`${inputCls} resize-none`} />
            </div>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Profile</>}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Prescription Writer Modal ────────────────────────────────────────────────
function PrescriptionModal({ patient, doctorUid, doctorName, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('1× daily');
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const freqOptions = ['1× daily', '2× daily', '3× daily', 'Every 8h', 'As needed', 'Before meals', 'After meals'];

  const inputCls = (hasErr) => `w-full bg-slate-100 dark:bg-white/5 border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all ${hasErr ? 'border-red-400' : 'border-slate-200 dark:border-white/10 focus:border-purple-400'}`;

  const handleSave = async () => {
    const e = {};
    if (!name.trim()) e.name = 'Medicine name is required';
    if (!dosage.trim()) e.dosage = 'Dosage is required';
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    storage.savePrescription({
      patientUid: patient.uid,
      patientName: patient.displayName,
      doctorUid,
      doctorName,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      time: `${h12}:${String(m).padStart(2, '0')} ${ampm}`,
      notes: notes.trim(),
      status: 'prescribed',
      color: 'violet',
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 800);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 shadow-2xl z-10"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill size={20} className="text-purple-500" /> Write Prescription
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">For: {patient.displayName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        {saved ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-900 dark:text-white font-bold text-lg">Prescription Saved!</p>
            <p className="text-slate-500 text-sm mt-1">Patient can now view it in their Medication Calendar.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Medicine Name *</label>
              <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} placeholder="e.g. Amoxicillin" className={inputCls(errors.name)} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Dosage *</label>
              <input value={dosage} onChange={e => { setDosage(e.target.value); setErrors(p => ({ ...p, dosage: '' })); }} placeholder="e.g. 500mg" className={inputCls(errors.dosage)} />
              {errors.dosage && <p className="text-red-500 text-xs mt-1">{errors.dosage}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Frequency</label>
              <div className="flex flex-wrap gap-2">
                {freqOptions.map(opt => (
                  <button key={opt} onClick={() => setFrequency(opt)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${frequency === opt ? 'bg-purple-500/20 border-purple-400/40 text-purple-600 dark:text-purple-300' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls(false)} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">Doctor's Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="e.g. Take with warm water." className={`${inputCls(false)} resize-none`} />
            </div>
            <motion.button onClick={handleSave} disabled={saving} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={16} /> Save Prescription</>}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Panel card style ─────────────────────────────────────────────────────────
const PANEL = 'bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl';

// ─── Patient Detail View ──────────────────────────────────────────────────────
function PatientDetailView({ patient, doctorUid, doctorName, onBack }) {
  const [data, setData] = useState(null);
  const [showRx, setShowRx] = useState(false);

  const loadData = () => { setData(storage.getPatientFullData(patient.uid)); };
  useEffect(() => { loadData(); }, [patient.uid]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-purple-500" /></div>;

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ChevronRight size={18} className="rotate-180" />
        </button>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
          {(patient.displayName || '?').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{patient.displayName}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{patient.email}</p>
        </div>
        <motion.button onClick={() => setShowRx(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm shadow-lg">
          <Plus size={16} /> Write Prescription
        </motion.button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Mood Entries', value: data.moodEntries.length, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Meditations', value: data.meditationHistory.length, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Streak', value: `${data.streak.current || 0}d`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Prescriptions', value: data.prescriptions.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map(s => (
          <div key={s.label} className={`${PANEL} p-4`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`${PANEL} p-5`}>
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
          <Stethoscope size={15} className="text-purple-500" /> Doctor Prescriptions
        </h3>
        {data.prescriptions.length === 0 ? (
          <p className="text-slate-500 text-sm">No prescriptions yet.</p>
        ) : (
          <div className="space-y-2">
            {data.prescriptions.map(rx => (
              <div key={rx.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{rx.name} <span className="text-slate-500 font-normal">{rx.dosage}</span></p>
                  <p className="text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wide">{rx.frequency} · {rx.time}</p>
                  {rx.notes && <p className="text-slate-500 text-xs mt-0.5">{rx.notes}</p>}
                </div>
                <span className="text-[9px] text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.moodEntries.length > 0 && (
        <div className={`${PANEL} p-5`}>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
            <BookHeart size={15} className="text-rose-500" /> Recent Mood Entries
          </h3>
          <div className="space-y-2">
            {data.moodEntries.slice(0, 5).map(e => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-2xl flex-shrink-0">{e.mood}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed line-clamp-2">{e.text || '(No text)'}</p>
                  <p className="text-slate-400 text-[10px] mt-1">{new Date(e.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showRx && <PrescriptionModal patient={patient} doctorUid={doctorUid} doctorName={doctorName} onClose={() => setShowRx(false)} onSaved={loadData} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Patient List View ────────────────────────────────────────────────────────
function PatientListView({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { setPatients(storage.getAllPatientsData()); }, []);

  const filtered = patients.filter(p =>
    (p.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20"><Users className="w-6 h-6 text-purple-500" /></span>
          All Patients
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage all registered patient records</p>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-purple-400 transition-all" />
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{patients.length === 0 ? 'No patients registered yet.' : 'No results found.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const rxCount = storage.getPrescriptions(p.uid).length;
            return (
              <motion.div key={p.uid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ x: 4 }} onClick={() => onSelectPatient(p)}
                className={`${PANEL} flex items-center gap-4 p-4 cursor-pointer hover:border-purple-400/40 transition-all`}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-base flex-shrink-0">
                  {(p.displayName || '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{p.displayName}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{p.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {rxCount > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-400/30">{rxCount} Rx</span>}
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── Doctor Overview ──────────────────────────────────────────────────────────
function DoctorOverview({ doctor, onGoToPatients }) {
  const patients = storage.getAllPatientsData();
  const allRx = storage.getPrescriptions();
  const myRx = allRx.filter(r => r.doctorUid === doctor.uid);
  const today = new Date().toLocaleDateString();
  const todayRx = myRx.filter(r => new Date(r.createdAt).toLocaleDateString() === today);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className={`${PANEL} p-6 relative overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">Good Morning</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{doctor.displayName}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{doctor.specialty || 'Doctor'}{doctor.hospital ? ` · ${doctor.hospital}` : ' · Nexus Health Panel'}</p>
          {doctor.bio && <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 italic">"{doctor.bio}"</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-blue-500' },
          { label: 'My Prescriptions', value: myRx.length, icon: FileText, color: 'text-purple-500' },
          { label: "Today's Rx", value: todayRx.length, icon: Calendar, color: 'text-emerald-500' },
        ].map(s => (
          <div key={s.label} className={`${PANEL} p-5 flex flex-col`}>
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <motion.button onClick={onGoToPatients} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-base shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3">
        <Users size={20} /> View All Patients
      </motion.button>

      {myRx.length > 0 && (
        <div className={`${PANEL} p-5`}>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
            <FileText size={14} className="text-purple-500" /> Recent Prescriptions
          </h3>
          <div className="space-y-2">
            {myRx.slice(-5).reverse().map(rx => (
              <div key={rx.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{rx.name} {rx.dosage}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">For: {rx.patientName} · {rx.frequency}</p>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Doctor Dashboard ────────────────────────────────────────────────────
export default function DoctorPage({ currentUser, onLogout }) {
  const [activeView, setActiveView] = useState('home');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [doctor, setDoctor] = useState(currentUser);

  const navItems = [
    { id: 'home', label: 'Overview', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
  ];

  const allRx = storage.getPrescriptions();
  const myRx = allRx.filter(r => r.doctorUid === doctor.uid);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-slate-200 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white/80 dark:bg-[#161b22] border-r border-slate-200 dark:border-white/10 p-5 backdrop-blur-sm">
        {/* Nexus logo — matches user panel */}
        <div className="mb-8">
          <Logo link="/doctor" textSize="text-xl" />
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setSelectedPatient(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeView === item.id
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-400/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Doctor profile + Edit */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4 space-y-2">
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-xs flex-shrink-0">
              {(doctor.displayName || 'D').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-slate-900 dark:text-white font-bold text-xs truncate">{doctor.displayName}</p>
              <p className="text-slate-400 text-[10px] truncate">{doctor.specialty || doctor.email}</p>
            </div>
            <Edit2 size={13} className="flex-shrink-0" />
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#161b22] border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <LogoIcon iconSize={18} />
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">Doctor Panel</span>
        </div>
        <div className="flex gap-1 items-center">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setSelectedPatient(null); }}
              className={`p-2 rounded-lg text-sm transition-colors ${activeView === item.id ? 'bg-purple-500/15 text-purple-500' : 'text-slate-400'}`}>
              <item.icon size={16} />
            </button>
          ))}
          <button onClick={() => setShowEditProfile(true)} className="p-2 rounded-lg text-slate-400">
            <User size={16} />
          </button>
          <button onClick={onLogout} className="p-2 rounded-lg text-rose-400">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 mt-14 md:mt-0">
        <div className="max-w-4xl mx-auto">
          {/* Prescriptions tab */}
          {activeView === 'prescriptions' && !selectedPatient && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20"><FileText className="w-6 h-6 text-purple-500" /></span>
                  All Prescriptions
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">All prescriptions you have written</p>
              </div>
              {myRx.length === 0 ? (
                <div className="text-center py-16"><FileText size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-slate-500">No prescriptions yet.</p></div>
              ) : (
                <div className="space-y-3">
                  {myRx.slice().reverse().map(rx => (
                    <div key={rx.id} className={`${PANEL} p-4`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-slate-900 dark:text-white font-extrabold">{rx.name} <span className="text-slate-500 font-normal">{rx.dosage}</span></p>
                          <p className="text-slate-500 text-sm mt-0.5">Patient: {rx.patientName} · {rx.frequency} at {rx.time}</p>
                          {rx.notes && <p className="text-slate-400 text-xs mt-1 italic">"{rx.notes}"</p>}
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{new Date(rx.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Patients tab */}
          {activeView === 'patients' && (
            selectedPatient
              ? <PatientDetailView patient={selectedPatient} doctorUid={doctor.uid} doctorName={doctor.displayName} onBack={() => setSelectedPatient(null)} />
              : <PatientListView onSelectPatient={setSelectedPatient} />
          )}

          {/* Overview tab */}
          {activeView === 'home' && <DoctorOverview doctor={doctor} onGoToPatients={() => setActiveView('patients')} />}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <EditProfileModal
            doctor={doctor}
            onClose={() => setShowEditProfile(false)}
            onSave={(updated) => {
              setDoctor(updated);
              // Also update current session
              const saved = JSON.parse(localStorage.getItem('serene_mock_user') || '{}');
              localStorage.setItem('serene_mock_user', JSON.stringify({ ...saved, ...updated }));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
