import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Flame, Target, Award, Calendar, Zap, Brain, Star } from 'lucide-react';
import { storage } from '../lib/storage';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const moodEmoji  = ['', '😫', '😕', '😐', '🙂', '😄'];
const moodColor  = ['', '#EE4444', '#FF6B6B', '#FFD166', '#22B05A', '#52D9C0'];
const moodLabels = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great'];

const listContainer = (delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: delay } }
});
const listItem = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};

const INSIGHT_PHOTO = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&auto=format';

// Get the ISO day-of-week (0=Mon...6=Sun) for a date string
function getDayOfWeek(iso) {
  const d = new Date(iso);
  return (d.getDay() + 6) % 7; // shift so Mon=0
}

// Return the start of the current week (Monday)
function startOfWeek() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function AnalyticsView() {
  const moodEntries = storage.getMoodEntries();
  const streak      = storage.getStreak();

  // ── Derived Analytics ──────────────────────────────────────────────────

  // Avg mood from entries (1-5 scale)
  const avgMood = useMemo(() => {
    if (!moodEntries.length) return 0;
    const moodMap = { Awful: 1, Bad: 2, Okay: 3, Good: 4, Great: 5 };
    const total   = moodEntries.reduce((sum, e) => sum + (moodMap[e.mood] || 0), 0);
    return (total / moodEntries.length).toFixed(1);
  }, [moodEntries]);

  // Month progress: unique days logged this calendar month
  const monthProgress = useMemo(() => {
    const now   = new Date();
    const month = now.getMonth();
    const year  = now.getFullYear();
    const days  = new Set(
      moodEntries
        .filter(e => {
          const d = new Date(e.timestamp);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .map(e => new Date(e.timestamp).toDateString())
    );
    return days.size;
  }, [moodEntries]);

  // Days in the current month
  const daysInMonth = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }, []);

  // Check-in map dynamically sized by current month's length
  const checkInMap = useMemo(() => {
    const logged = new Set(moodEntries.map(e => new Date(e.timestamp).toDateString()));
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysInMonth - 1 - i));
      return logged.has(d.toDateString()) ? 1 : 0;
    });
  }, [moodEntries, daysInMonth]);

  // Weekly mood array indexed by Mon-Sun (null = no log)
  const weeklyMoodData = useMemo(() => {
    const week = Array(7).fill(null);
    const weekStart = startOfWeek();
    moodEntries.forEach(e => {
      const entryDate = new Date(e.timestamp);
      if (entryDate >= weekStart) {
        const dow = getDayOfWeek(e.timestamp);
        const moodMap = { Awful: 1, Bad: 2, Okay: 3, Good: 4, Great: 5 };
        week[dow] = moodMap[e.mood] || null;
      }
    });
    return week;
  }, [moodEntries]);

  // ── Per-day emoji selection state ─────────────────────────────────────
  const [selectedDay, setSelectedDay] = useState(null);   // which day picker is open
  const [weekMoods, setWeekMoods]     = useState(weeklyMoodData);

  const pickMood = (dayIdx, moodVal) => {
    const updated = [...weekMoods];
    updated[dayIdx] = moodVal;
    setWeekMoods(updated);
    setSelectedDay(null);
    // Persist as a mood entry for that day
    const moodMap = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great'];
    storage.saveMoodEntry({ mood: moodMap[moodVal], emoji: moodEmoji[moodVal] });
  };

  // ── Stats ─────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Current Streak', value: streak.current, unit: 'days',  icon: Flame,     color: '#FB7185' },
    { label: 'Avg Mood',       value: avgMood,         unit: '/5',   icon: TrendingUp, color: '#84CC16' },
    { label: 'Month Progress', value: monthProgress,   unit: `/ ${daysInMonth}`, icon: Target, color: '#A78BFA' },
    { label: 'Best Streak',    value: streak.longest,  unit: 'days', icon: Award,     color: '#22D3EE' },
  ];

  return (
    <div className="space-y-7 max-w-5xl text-slate-900 dark:text-slate-200">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-slate-900 dark:text-white">
          <BarChart2 size={22} />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-medium text-sm">Track your emotional journey and celebrate progress</p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={listContainer(0.05)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={listItem}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="panel-soft rounded-2xl p-5 h-full">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 border"
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: s.color }}
              >
                <s.icon size={20} />
              </div>
              <div className="flex items-baseline gap-1 mb-0.5">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{s.unit}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {/* Weekly Mood Chart — interactive emoji picker */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="panel rounded-3xl p-6 relative"
        >
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-300" /> This Week's Mood
          </h3>
          <p className="text-xs text-slate-500 mb-4">Tap a day to log your mood</p>

          <div className="flex items-end justify-between gap-2 h-44 px-1">
            {weekDays.map((day, i) => {
              const moodVal = weekMoods[i];
              const hasValue = moodVal !== null && moodVal !== undefined;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 relative">
                  {/* Emoji or placeholder */}
                  <button
                    onClick={() => setSelectedDay(selectedDay === i ? null : i)}
                    className="text-xl focus:outline-none hover:scale-110 transition-transform"
                    title={`Log mood for ${day}`}
                  >
                    {hasValue ? moodEmoji[moodVal] : <span className="text-slate-600 text-base">+</span>}
                  </button>

                  {/* Emoji picker dropdown */}
                  {selectedDay === i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-slate-800 border border-white/10 rounded-2xl p-2 shadow-xl"
                    >
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => pickMood(i, v)}
                          title={moodLabels[v]}
                          className="p-1.5 rounded-xl hover:bg-white/10 text-xl transition-colors"
                        >
                          {moodEmoji[v]}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Bar */}
                  <motion.div
                    className="w-full rounded-t-2xl"
                    initial={{ scaleY: 0, originY: 1 }}
                    animate={{ scaleY: 1 }}
                    whileHover={{ scaleY: 1.06 }}
                    transition={{ delay: 0.35 + i * 0.07, duration: 0.7, type: 'spring', stiffness: 180, damping: 18 }}
                    style={{
                      background: hasValue
                        ? `linear-gradient(180deg, ${moodColor[moodVal]}, ${moodColor[moodVal]}88)`
                        : 'rgba(255,255,255,0.07)',
                      height: hasValue ? `${moodVal * 25}%` : '8%',
                      originY: 1,
                    }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-500 font-bold">{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 28-Day Heatmap — driven by real check-in data */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="panel rounded-3xl p-6"
        >
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-rose-400" /> {daysInMonth}-Day Check-in Map
          </h3>
          {moodEntries.length === 0 && (
            <p className="text-xs text-slate-500 mb-3">Log your mood to start filling in your map!</p>
          )}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {checkInMap.map((checked, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.012, duration: 0.35, type: 'spring', stiffness: 280, damping: 22 }}
                whileHover={{ scale: 1.25 }}
                className={`aspect-square rounded-xl cursor-default transition-shadow ${
                  checked
                    ? 'gradient-vibrant shadow-md shadow-purple-500/30'
                    : 'bg-white/5'
                }`}
                title={`Day ${i + 1}: ${checked ? 'Checked in' : 'Missed'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 gradient-vibrant rounded-md" /> Checked in</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white/10 rounded-md" /> Missed</div>
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl overflow-hidden border border-white/10 shadow-lg flex flex-col lg:flex-row"
      >
        <div
          className="lg:w-64 h-48 lg:h-auto flex-shrink-0 relative"
          style={{ backgroundImage: `url('${INSIGHT_PHOTO}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-purple-900/60 lg:bg-gradient-to-b from-black/20 to-purple-900/70" />
          <div className="absolute inset-0 flex items-end p-5">
            <div>
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mb-2">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-extrabold text-sm">AI Insights</p>
              <p className="text-white/70 text-xs font-medium">Powered by Nexus AI</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-7 panel-soft">
          <motion.div
            variants={listContainer(0.45)}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {[
              { icon: '📈', text: moodEntries.length > 0 ? `You've logged ${moodEntries.length} mood entries — keep it up!` : 'Start logging your mood to unlock personalized insights.' },
              { icon: '🎯', text: monthProgress > 0 ? `${monthProgress} check-in${monthProgress > 1 ? 's' : ''} this month. Consistency is key to wellbeing.` : 'Log your first mood today to begin your wellness journey.' },
              { icon: '🧘', text: 'Your best weeks correlate with meditation use. Keep that habit going!' },
            ].map((insight, i) => (
              <motion.div
                key={i}
                variants={listItem}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-shadow"
              >
                <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{insight.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="panel rounded-3xl p-7"
      >
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-300 fill-amber-300" /> Recommendations
        </h3>
        <motion.div
          variants={listContainer(0.55)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { title: 'Start Your Streak',       desc: 'Log your mood every day to build a powerful healing habit.',                color: 'border-l-purple-500', dot: 'bg-purple-500' },
            { title: 'Try Morning Meditations', desc: 'Users report 23% better moods with morning practice.',                    color: 'border-l-cyan-500',   dot: 'bg-cyan-500'   },
            { title: 'Journal More',            desc: 'Journaling on low days helps process emotions more effectively.',         color: 'border-l-lime-500',   dot: 'bg-lime-500'   },
          ].map((rec, i) => (
            <motion.div
              key={i}
              variants={listItem}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`p-4 rounded-xl bg-white/5 border-l-4 ${rec.color} border border-white/10 hover:bg-white/10 transition-shadow`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${rec.dot}`} />
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{rec.title}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed pl-4">{rec.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
