import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Bell, Shield, Moon, Sun, ChevronRight, Check, Eye, EyeOff, Loader2, Lock, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../lib/storage';

const GLASS = 'panel-soft';

const accentThemes = {
  violet: {
    label: 'Violet',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #4C1D95 100%)',
    ring: '#8B5CF6',
    soft: 'rgba(139, 92, 246, 0.14)',
    glow: 'rgba(139, 92, 246, 0.22)',
    pillBorder: 'rgba(139, 92, 246, 0.35)',
  },
  cyan: {
    label: 'Cyan',
    gradient: 'linear-gradient(135deg, #22D3EE 0%, #0E7490 100%)',
    ring: '#22D3EE',
    soft: 'rgba(34, 211, 238, 0.14)',
    glow: 'rgba(34, 211, 238, 0.2)',
    pillBorder: 'rgba(34, 211, 238, 0.35)',
  },
  rose: {
    label: 'Rose',
    gradient: 'linear-gradient(135deg, #FB7185 0%, #BE123C 100%)',
    ring: '#FB7185',
    soft: 'rgba(251, 113, 133, 0.14)',
    glow: 'rgba(251, 113, 133, 0.2)',
    pillBorder: 'rgba(251, 113, 133, 0.35)',
  },
  lime: {
    label: 'Lime',
    gradient: 'linear-gradient(135deg, #84CC16 0%, #22B05A 100%)',
    ring: '#84CC16',
    soft: 'rgba(132, 204, 22, 0.14)',
    glow: 'rgba(132, 204, 22, 0.2)',
    pillBorder: 'rgba(132, 204, 22, 0.35)',
  },
};

const Toggle = ({ enabled, onChange, accent }) => (
  <button
    onClick={onChange}
    aria-pressed={enabled}
    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${enabled ? '' : 'bg-white/10'}`}
    style={enabled ? { background: accent.gradient } : undefined}
  >
    <motion.div
      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
      animate={{ x: enabled ? 24 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
    />
  </button>
);

export default function SettingsView() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, updateUserProfile, resetPassword, updateUserPassword } = useAuth();
  const [notifs, setNotifs] = useState({ daily: true, streaks: true, tips: false, reminders: true });
  const [security, setSecurity] = useState({ biometric: true, dataShare: false, emergencyShare: true });
  const [saved, setSaved] = useState(false);
  const [accent, setAccent] = useState('violet');

  // ── Profile edit state ──
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.displayName || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }

  // ── Change password state ──
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [exportLoading, setExportLoading] = useState(null); // 'csv' | 'pdf' | null
  const [pwErrors, setPwErrors] = useState({});

  const accentMeta = accentThemes[accent];

  // ── Live stats from localStorage ──
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).getFullYear()
    : new Date().getFullYear();
  const streak = storage.getStreak();
  const moodStreak = streak.current || 0;
  const meditationSessions = (storage.getMeditationHistory?.() || []).length;

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Save profile handler ──
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateUserProfile({ displayName: editName, email: editEmail });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setIsEditingProfile(false), 1500); // Wait a moment so user sees success message
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  // ── Change password handler ──
  const handleChangePassword = async () => {
    const e = {};
    if (!/(?=.*[A-Z])(?=.*[!@#$&*]).{8,}/.test(newPw)) e.newPw = 'Min 8 chars, 1 uppercase, 1 special character';
    if (newPw !== confirmPw) e.confirmPw = 'Passwords do not match';
    if (Object.keys(e).length) { setPwErrors(e); return; }
    setPwLoading(true);
    setPwMsg(null);
    setPwErrors({});
    try {
      // Request a reset token for the current user's email
      const { resetToken, email } = await resetPassword(currentUser.email);
      await updateUserPassword(email, resetToken, newPw);
      setNewPw('');
      setConfirmPw('');
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(null), 4000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-5xl text-slate-200"
    >
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="p-3 rounded-2xl text-white border border-white/10 bg-white/10">
          <Settings size={22} />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Settings</h1>
          <p className="text-slate-400 text-sm font-medium">Manage your account, privacy, and personalization.</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ background: 'rgba(255,255,255,0.08)', color: accentMeta.ring, borderColor: accentMeta.pillBorder }}>
            Nexus Plus
          </span>
          <span className="text-xs text-slate-500 font-medium">Renews May 12</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile card */}
          <div className={`${GLASS} rounded-3xl p-6 relative overflow-hidden`}>
            <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full blur-3xl" style={{ background: accentMeta.glow }} />
            <div className="relative z-10 flex items-center gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg" style={{ background: accentMeta.gradient }}>
                {(editName || currentUser?.displayName || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white">{editName || currentUser?.displayName || 'Nexus User'}</h3>
                <p className="text-slate-400 text-sm">{editEmail || currentUser?.email || 'user@example.com'}</p>
                <span className="text-xs px-2.5 py-1 rounded-full border inline-flex mt-2" style={{ color: accentMeta.ring, borderColor: accentMeta.pillBorder, background: 'rgba(255,255,255,0.06)' }}>
                  Verified Member
                </span>
              </div>
              <motion.button
                onClick={() => {
                  if (isEditingProfile) {
                    setEditName(currentUser?.displayName || '');
                    setEditEmail(currentUser?.email || '');
                  }
                  setIsEditingProfile(!isEditingProfile);
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-bold border transition-colors"
                style={{ borderColor: accentMeta.pillBorder, color: accentMeta.ring, background: 'rgba(255,255,255,0.06)' }}
              >
                {isEditingProfile ? 'Cancel' : 'Edit profile'} <ChevronRight className={`inline ml-1 transition-transform ${isEditingProfile ? 'rotate-90' : ''}`} size={14} />
              </motion.button>
            </div>

            <AnimatePresence>
              {isEditingProfile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Full Name</label>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Email</label>
                      <input
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                    </div>
                  </div>

                  {profileMsg && (
                    <p className={`text-xs font-semibold mt-3 ${profileMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profileMsg.text}
                    </p>
                  )}

                  <motion.button
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-5 px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 flex items-center gap-2"
                    style={{ background: accentMeta.gradient, boxShadow: `0 8px 24px ${accentMeta.glow}` }}
                  >
                    {profileLoading ? <><Loader2 size={14} className="animate-spin" /> ...Saving...</> : 'Save Profile'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Member Since', value: String(memberSince) },
                { label: 'Mood Streak',  value: `${moodStreak} ${moodStreak === 1 ? 'day' : 'days'}` },
                { label: 'Meditations', value: `${meditationSessions} ${meditationSessions === 1 ? 'session' : 'sessions'}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl p-4 bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg font-extrabold text-white mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password card */}
          <div className={`${GLASS} rounded-3xl p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentMeta.soft, border: `1px solid ${accentMeta.pillBorder}` }}>
                <Lock size={16} style={{ color: accentMeta.ring }} />
              </div>
              <h3 className="font-extrabold text-white text-base">Change Password</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPw}
                    placeholder="Min 8 chars, 1 uppercase, 1 special"
                    onChange={e => { setNewPw(e.target.value); setPwErrors(p => ({ ...p, newPw: '' })); }}
                    className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 pr-10"
                  />
                  <button type="button" onClick={() => setShowNewPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwErrors.newPw && <p className="text-red-400 text-xs mt-1">{pwErrors.newPw}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Confirm New Password</label>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={confirmPw}
                  placeholder="Repeat your new password"
                  onChange={e => { setConfirmPw(e.target.value); setPwErrors(p => ({ ...p, confirmPw: '' })); }}
                  className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
                {pwErrors.confirmPw && <p className="text-red-400 text-xs mt-1">{pwErrors.confirmPw}</p>}
              </div>
              {pwMsg && (
                <p className={`text-xs font-semibold ${pwMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pwMsg.text}
                </p>
              )}
              <motion.button
                onClick={handleChangePassword}
                disabled={pwLoading}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: accentMeta.gradient, boxShadow: `0 8px 24px ${accentMeta.glow}` }}
              >
                {pwLoading ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : 'Update Password'}
              </motion.button>
            </div>
          </div>

          {/* Notifications */}
          <div className={`${GLASS} rounded-3xl p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentMeta.soft, border: `1px solid ${accentMeta.pillBorder}` }}>
                <Bell size={16} style={{ color: accentMeta.ring }} />
              </div>
              <h3 className="font-extrabold text-white text-base">Notifications</h3>
            </div>
            <div className="space-y-4">
              {[
                { key: 'daily', label: 'Daily Check-in Reminder', desc: 'Remind me to log my mood every day' },
                { key: 'streaks', label: 'Streak Milestones', desc: 'Celebrate when I hit streak goals' },
                { key: 'tips', label: 'Wellbeing Tips', desc: 'Weekly mental health tips and articles' },
                { key: 'reminders', label: 'Meditation Reminders', desc: 'Nudge me to meditate regularly' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <p className="font-semibold text-white text-sm">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <Toggle enabled={notifs[key]} onChange={() => setNotifs((p) => ({ ...p, [key]: !p[key] }))} accent={accentMeta} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Appearance */}
          <div className={`${GLASS} rounded-3xl p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentMeta.soft, border: `1px solid ${accentMeta.pillBorder}` }}>
                {theme === 'dark' ? <Moon size={16} style={{ color: accentMeta.ring }} /> : <Sun size={16} style={{ color: accentMeta.ring }} />}
              </div>
              <h3 className="font-extrabold text-white text-base">Appearance</h3>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-sm">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs text-slate-500">Switch the interface theme</p>
              </div>
              <Toggle enabled={theme === 'dark'} onChange={toggleTheme} accent={accentMeta} />
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Accent Color</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(accentThemes).map(([key, meta]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAccent(key)}
                    className="relative h-10 rounded-xl border"
                    style={{ background: meta.gradient, borderColor: accent === key ? meta.ring : 'transparent' }}
                  >
                    {accent === key && (
                      <div className="absolute inset-0 rounded-xl ring-2 ring-white/70 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className={`${GLASS} rounded-3xl p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentMeta.soft, border: `1px solid ${accentMeta.pillBorder}` }}>
                <Shield size={16} style={{ color: accentMeta.ring }} />
              </div>
              <h3 className="font-extrabold text-white text-base">Privacy & Security</h3>
            </div>
            <div className="space-y-4">
              {[
                { key: 'biometric', label: 'Biometric Lock', desc: 'Use Face ID or fingerprint to unlock' },
                { key: 'dataShare', label: 'Anonymous Insights', desc: 'Share anonymized data to improve AI' },
                { key: 'emergencyShare', label: 'Emergency Sharing', desc: 'Share location with trusted contacts' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <p className="font-semibold text-white text-sm">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <Toggle enabled={security[key]} onChange={() => setSecurity((p) => ({ ...p, [key]: !p[key] }))} accent={accentMeta} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Export User Data ── */}
          <div className={`${GLASS} rounded-3xl p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentMeta.soft, border: `1px solid ${accentMeta.pillBorder}` }}>
                <Download size={16} style={{ color: accentMeta.ring }} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Export Your Data</h3>
                <p className="text-xs text-slate-500 mt-0.5">Download all your health records, mood entries, and prescriptions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* CSV Export */}
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(34,211,238,0.2)' }}
                whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  setExportLoading('csv');
                  await new Promise(r => setTimeout(r, 600));
                  const moodEntries = storage.getMoodEntries();
                  const medHistory = storage.getMeditationHistory();
                  const streak = storage.getStreak();
                  const prescriptions = storage.getPrescriptions(currentUser?.uid);
                  let csv = '\uFEFF'; // BOM for Excel
                  csv += 'NEXUS HEALTH EXPORT\n';
                  csv += `User,${currentUser?.displayName || currentUser?.email}\n`;
                  csv += `Exported,${new Date().toLocaleString()}\n\n`;
                  csv += 'MOOD JOURNAL\n';
                  csv += 'Date,Mood,Entry\n';
                  moodEntries.forEach(e => {
                    csv += `"${new Date(e.timestamp).toLocaleDateString()}","${e.mood || ''}","${(e.text || '').replace(/"/g, '""')}"\n`;
                  });
                  csv += `\nMEDITATION HISTORY\n`;
                  csv += 'Date,Duration (min)\n';
                  medHistory.forEach(m => {
                    csv += `"${new Date(m.timestamp).toLocaleDateString()}","${m.duration || ''}"\n`;
                  });
                  csv += `\nSTREAK\nCurrent Streak,${streak.current || 0} days\nLongest Streak,${streak.longest || 0} days\n`;
                  if (prescriptions.length) {
                    csv += `\nDOCTOR PRESCRIPTIONS\n`;
                    csv += 'Medicine,Dosage,Frequency,Time,Doctor,Notes,Date\n';
                    prescriptions.forEach(rx => {
                      csv += `"${rx.name}","${rx.dosage}","${rx.frequency}","${rx.time}","${rx.doctorName || ''}","${(rx.notes || '').replace(/"/g, '""')}","${new Date(rx.createdAt).toLocaleDateString()}"\n`;
                    });
                  }
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `nexus-health-export-${Date.now()}.csv`; a.click();
                  URL.revokeObjectURL(url);
                  setExportLoading(null);
                }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center flex-shrink-0">
                  {exportLoading === 'csv' ? <Loader2 size={18} className="text-cyan-400 animate-spin" /> : <FileSpreadsheet size={18} className="text-cyan-400" />}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Export as CSV</p>
                  <p className="text-slate-500 text-xs">Open in Excel / Google Sheets</p>
                </div>
                {exportLoading !== 'csv' && <Download size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors ml-auto" />}
              </motion.button>

              {/* PDF Export */}
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(139,92,246,0.2)' }}
                whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  setExportLoading('pdf');
                  await new Promise(r => setTimeout(r, 600));
                  const moodEntries = storage.getMoodEntries();
                  const medHistory = storage.getMeditationHistory();
                  const streak = storage.getStreak();
                  const prescriptions = storage.getPrescriptions(currentUser?.uid);

                  const html = `
                    <!DOCTYPE html>
                    <html><head><meta charset="UTF-8">
                    <title>Nexus Health Export</title>
                    <style>
                      body { font-family: Arial, sans-serif; color: #1e293b; margin: 40px; }
                      h1 { color: #7c3aed; font-size: 26px; margin-bottom: 4px; }
                      .sub { color: #64748b; font-size: 13px; margin-bottom: 32px; }
                      h2 { color: #4f46e5; font-size: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; }
                      table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
                      th { background: #f1f5f9; text-align: left; padding: 8px 12px; color: #475569; font-weight: 600; }
                      td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
                      .stat { display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 20px; margin: 6px 8px 6px 0; }
                      .stat-val { font-size: 22px; font-weight: 700; color: #7c3aed; }
                      .stat-lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
                    </style></head><body>
                    <h1>🩺 Nexus Health Report</h1>
                    <p class="sub">Patient: <strong>${currentUser?.displayName || currentUser?.email}</strong> &nbsp;·&nbsp; Exported: ${new Date().toLocaleString()}</p>

                    <h2>📊 Overview</h2>
                    <div class="stat"><div class="stat-val">${moodEntries.length}</div><div class="stat-lbl">Mood Entries</div></div>
                    <div class="stat"><div class="stat-val">${medHistory.length}</div><div class="stat-lbl">Meditations</div></div>
                    <div class="stat"><div class="stat-val">${streak.current || 0}d</div><div class="stat-lbl">Current Streak</div></div>
                    <div class="stat"><div class="stat-val">${prescriptions.length}</div><div class="stat-lbl">Prescriptions</div></div>

                    <h2>😊 Mood Journal (${moodEntries.length} entries)</h2>
                    ${moodEntries.length === 0 ? '<p style="color:#94a3b8">No entries yet.</p>' : `
                    <table><thead><tr><th>Date</th><th>Mood</th><th>Entry</th></tr></thead><tbody>
                    ${moodEntries.slice(-20).reverse().map(e => `<tr><td>${new Date(e.timestamp).toLocaleDateString()}</td><td>${e.mood || ''}</td><td>${e.text || ''}</td></tr>`).join('')}
                    </tbody></table>`}

                    <h2>🧘 Meditation History (${medHistory.length} sessions)</h2>
                    ${medHistory.length === 0 ? '<p style="color:#94a3b8">No sessions yet.</p>' : `
                    <table><thead><tr><th>Date</th><th>Duration</th></tr></thead><tbody>
                    ${medHistory.slice(-20).reverse().map(m => `<tr><td>${new Date(m.timestamp).toLocaleDateString()}</td><td>${m.duration || '-'} min</td></tr>`).join('')}
                    </tbody></table>`}

                    ${prescriptions.length > 0 ? `
                    <h2>🩺 Doctor Prescriptions (${prescriptions.length})</h2>
                    <table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Time</th><th>Doctor</th><th>Notes</th><th>Date</th></tr></thead><tbody>
                    ${prescriptions.map(rx => `<tr><td>${rx.name}</td><td>${rx.dosage}</td><td>${rx.frequency}</td><td>${rx.time}</td><td>${rx.doctorName || ''}</td><td>${rx.notes || ''}</td><td>${new Date(rx.createdAt).toLocaleDateString()}</td></tr>`).join('')}
                    </tbody></table>` : ''}

                    </body></html>`;

                  const printWin = window.open('', '_blank', 'width=900,height=700');
                  printWin.document.write(html);
                  printWin.document.close();
                  printWin.focus();
                  setTimeout(() => { printWin.print(); setExportLoading(null); }, 500);
                }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                  {exportLoading === 'pdf' ? <Loader2 size={18} className="text-purple-400 animate-spin" /> : <FileText size={18} className="text-purple-400" />}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Export as PDF</p>
                  <p className="text-slate-500 text-xs">Print-ready health report</p>
                </div>
                {exportLoading !== 'pdf' && <Download size={14} className="text-slate-500 group-hover:text-purple-400 transition-colors ml-auto" />}
              </motion.button>
            </div>
          </div>

          {/* Save */}
          <motion.button
            onClick={save}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-2xl text-white font-extrabold shadow-lg"
            style={{ background: accentMeta.gradient, boxShadow: `0 12px 30px ${accentMeta.glow}` }}
          >
            {saved ? (
              <span className="inline-flex items-center gap-2">
                <Check size={18} /> Saved
              </span>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
