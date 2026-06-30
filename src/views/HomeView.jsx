import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Flame, CheckCircle2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';

const moods = [
  { label: 'Awful', emoji: '😫', accent: '#FB7185' },
  { label: 'Bad', emoji: '😕', accent: '#F59E0B' },
  { label: 'Okay', emoji: '😐', accent: '#FCD34D' },
  { label: 'Good', emoji: '🙂', accent: '#84CC16' },
  { label: 'Great', emoji: '😄', accent: '#22D3EE' },
];
const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const listItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomeView({ onBreathe }) {
  const { currentUser } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const [selectedMood, setSelectedMood] = useState(null);
  const [streak, setStreak] = useState(storage.getStreak());
  const [dailyChallenge, setDailyChallenge] = useState(storage.getDailyChallenge());
  const [moodEntries, setMoodEntries] = useState(storage.getMoodEntries());

  const logMood = (idx) => {
    setSelectedMood(idx);
    setMoodEntries(storage.saveMoodEntry({ mood: moods[idx].label, emoji: moods[idx].emoji }));
    storage.updateStreak();
    setStreak(storage.getStreak());
  };

  const completeChallenge = () => {
    storage.completeChallenge();
    setDailyChallenge(storage.getDailyChallenge());
    setStreak(storage.getStreak());
  };
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome */}
      <motion.div variants={listContainer} initial="hidden" animate="visible">
        <motion.p variants={listItem} className="text-slate-500 text-xs uppercase tracking-[0.3em] mb-2">
          {today.toUpperCase()}
        </motion.p>
        <motion.h1 variants={listItem} className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Welcome back{currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}
          <span className="text-purple-500 dark:text-purple-300">✷</span>
        </motion.h1>
        <motion.p variants={listItem} className="text-slate-400 mt-2 text-sm font-medium italic">
          “Progress, not perfection.”
        </motion.p>
      </motion.div>

      {/* Streak & Challenge */}
      <motion.div variants={listContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Streak card */}
        <motion.div variants={listItem}>
          <div
            className="rounded-3xl overflow-hidden relative p-6 h-full border border-white/10 shadow-2xl"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=70&auto=format')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 dark:text-amber-300" /> Daily Streak
                </h3>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{streak.current}</span>
              </div>
              <p className="text-slate-700 dark:text-white/70 mb-4 text-sm">Keep it going. Longest: {streak.longest} days</p>
              <div className="w-full bg-slate-900/10 dark:bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-400 to-cyan-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((streak.current / 30) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Challenge card */}
        <motion.div variants={listItem}>
          <div
            className={`panel rounded-3xl p-6 h-full border ${
              dailyChallenge.completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-500/20'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚶</span>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">Today’s Challenge</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{dailyChallenge.challenge?.title}</p>
                </div>
              </div>
              {dailyChallenge.completed && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            </div>
            <p className="text-sm text-slate-300 mb-5">{dailyChallenge.challenge?.description}</p>
            {!dailyChallenge.completed ? (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={completeChallenge}
                className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-200 font-semibold text-sm border border-emerald-500/40"
              >
                Mark as Complete
              </motion.button>
            ) : (
              <div className="text-center py-2 rounded-xl bg-emerald-500/10 text-emerald-300 text-sm font-semibold">
                Completed
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Mood Tracker & Breathe */}
      <motion.div variants={listContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.div variants={listItem} className="lg:col-span-2 panel rounded-3xl p-4 sm:p-6 px-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 sm:mb-5 px-3">How are you feeling? ☁️</h3>
          <div className="grid grid-cols-5 gap-2 sm:gap-3 px-3">
            {moods.map((mood, idx) => {
              const isActive = selectedMood === idx;
              return (
                <motion.button
                  key={mood.label}
                  onClick={() => logMood(idx)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-2xl px-2 py-4 border text-center transition-all ${
                    isActive ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:border-white/25'
                  }`}
                  style={isActive ? { boxShadow: `0 0 0 1px ${mood.accent}55, 0 12px 24px ${mood.accent}25` } : undefined}
                >
                  <div className="text-3xl">{mood.emoji}</div>
                  <div className="text-xs mt-2 font-semibold text-slate-300">{mood.label}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.button
          variants={listItem}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBreathe}
          className="rounded-3xl overflow-hidden relative border border-white/10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=75&auto=format')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-slate-900/50 to-cyan-900/60" />
          <div className="relative z-10 h-full p-6 flex flex-col justify-between text-left">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xl">
              🌬️
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-1">Breathe</h3>
              <p className="text-slate-300 text-sm">A calming 1-minute break</p>
              <p className="text-slate-400 text-xs mt-3 tracking-[0.3em]">INHALE · EXHALE</p>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Recent Moods */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        <div className="panel rounded-3xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-300" /> Recent Moods
            </h3>
            <button className="text-xs text-slate-400 hover:text-white">View All</button>
          </div>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {moodEntries.length > 0 ? (
              moodEntries
                .slice(-5)
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                      <span className="text-lg">{entry.emoji}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{entry.mood}</p>
                  </div>
                ))
            ) : (
              <p className="text-sm text-slate-500">No entries yet. Log your first mood.</p>
            )}
          </div>
        </div>


      </div>


    </div>
  );
}
