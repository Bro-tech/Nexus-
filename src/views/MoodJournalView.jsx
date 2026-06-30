import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookHeart, Plus, X, Check, Trash2, Tag, PenLine } from 'lucide-react';
import { storage } from '../lib/storage';

const JOURNAL_BG = 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&q=80&auto=format';

const moodBorderColor = {
  '😫': 'border-white/10',
  '😕': 'border-white/10',
  '😐': 'border-white/10',
  '🙂': 'border-white/10',
  '😄': 'border-white/10',
};

const moodGradient = {
  '😫': 'from-red-500 to-rose-600',
  '😕': 'from-orange-400 to-red-500',
  '😐': 'from-yellow-400 to-orange-500',
  '🙂': 'from-lime-400 to-teal-500',
  '😄': 'from-cyan-400 to-blue-500',
};

const moodEmojis = ['😫', '😕', '😐', '🙂', '😄'];

const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};
const listItem = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } }
};
const statContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }
};

export default function MoodJournalView() {
  const [entries, setEntries] = useState([]);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [selectedMood, setSelectedMood] = useState('🙂');
  const [tags, setTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setEntries(storage.getMoodEntries().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }, []);

  const submit = () => {
    if (!draft.trim()) return;
    const updated = storage.saveMoodEntry({
      mood: selectedMood,        // e.g. '🙂'
      emoji: selectedMood,       // keep emoji consistent
      text: draft,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
    });
    setEntries(updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    setDraft(''); setTags(''); setComposing(false);
    storage.updateStreak();
  };

  const deleteEntry = (id) => {
    const updated = storage.deleteMoodEntry(id);
    setEntries(updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const filteredEntries = entries.filter(e =>
    e.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.mood?.includes(searchQuery)
  );

  const getMoodStats = () => {
    const c = {};
    entries.forEach(e => { c[e.mood] = (c[e.mood] || 0) + 1; });
    return c;
  };
  const stats = getMoodStats();

  return (
    <div className="space-y-7 max-w-4xl text-slate-200">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl overflow-hidden relative"
        style={{
          backgroundImage: `url('${JOURNAL_BG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          minHeight: '180px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-purple-900/60 to-black/40" />
        <div className="relative z-10 p-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white">
                <BookHeart size={20} />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Mood Journal</h1>
            </div>
            <p className="text-slate-300 font-medium text-sm">Capture your emotions and reflect on your day</p>
          </div>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setComposing(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm flex-shrink-0"
          >
            <Plus size={17} /> New Entry
          </motion.button>
        </div>
      </motion.div>

      {/* Mood Stats — always shown, zeros until data exists */}
      <motion.div
        variants={statContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 sm:grid-cols-5 gap-2.5"
      >
        {moodEmojis.map(mood => (
          <motion.div
            key={mood}
            variants={listItem}
            whileHover={{ y: -4, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="text-center p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="text-3xl mb-1.5">{mood}</div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats[mood] || 0}</p>
            <p className="text-xs text-slate-700 dark:text-slate-500 mt-0.5 font-medium">entries</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Composer */}
      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <div className="panel rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <PenLine size={20} className="text-purple-300" /> New Journal Entry
                </h3>
                <button
                  onClick={() => setComposing(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mood selector */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-3">How are you feeling?</label>
                <div className="flex gap-3 justify-between">
                  {moodEmojis.map(mood => (
                    <motion.button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className={`text-4xl transition-all p-2.5 rounded-2xl flex-1 ${
                        selectedMood === mood
                          ? 'scale-125 shadow-xl bg-white/10 ring-2 ring-purple-400'
                          : 'opacity-50 hover:opacity-90 hover:bg-white/10'
                      }`}
                    >
                      {mood}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">What's on your mind?</label>
                <textarea
                  rows={5}
                  placeholder="Write freely... no judgment here."
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  className="w-full resize-none bg-white/5 border border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-sm font-medium"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Tag size={14} /> Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. work, mindfulness, grateful..."
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setComposing(false)}
                  className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={submit}
                  disabled={!draft.trim()}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm disabled:opacity-50"
                >
                  <Check size={16} /> Save Entry
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      {entries.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <input
            type="text"
            placeholder="🔍 Search entries..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
          />
        </motion.div>
      )}

      {/* Entry List */}
      <div className="space-y-3.5">
        {filteredEntries.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center text-4xl shadow-xl"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1517842645767-c639042777db?w=200&q=60&auto=format')",
                backgroundSize: 'cover',
              }}
            />
            <p className="text-slate-500 text-base font-medium">
              {entries.length === 0 ? "No entries yet. Start journaling to track your mood!" : "No entries match your search."}
            </p>
          </motion.div>
        ) : (
          <motion.div variants={listContainer} initial="hidden" animate="visible">
            <AnimatePresence>
              {filteredEntries.map(entry => (
                <motion.div
                  key={entry.id}
                  variants={listItem}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-3.5"
                >
                  <div className={`rounded-2xl overflow-hidden bg-white/5 border ${moodBorderColor[entry.mood] || 'border-white/10'} group cursor-default`}>
                    {/* Mood accent strip */}
                    <div className={`h-1.5 bg-gradient-to-r ${moodGradient[entry.mood] || 'from-purple-500 to-cyan-400'}`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-4xl flex-shrink-0">{entry.mood}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-500 mb-2">
                              {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                weekday: 'short', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                            {entry.text && <p className="text-slate-700 dark:text-slate-300 text-sm mb-3 leading-relaxed">{entry.text}</p>}
                            {entry.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {entry.tags.map(tag => (
                                  <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 dark:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-300/30 dark:border-white/10">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteEntry(entry.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
