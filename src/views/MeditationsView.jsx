import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Play, Pause, Clock, Star, Heart, Download, Volume2, VolumeX } from 'lucide-react';

// Unsplash photo for each meditation session
const sessionPhotos = {
  1: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75&auto=format',  // ocean
  2: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=600&q=75&auto=format',  // forest light
  3: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=600&q=75&auto=format',  // focus study
  4: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&q=75&auto=format',  // zen meditation
  5: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75&auto=format',  // mountain morning
  6: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=75&auto=format',  // forest walk
  7: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=75&auto=format',  // energy
  8: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=75&auto=format',  // night calm
};

const categories = ['All', 'Sleep', 'Anxiety', 'Focus', 'Breathing', 'Morning', 'Energy'];
const sessions = [
  { id: 1, title: 'Ocean Sleep Sounds', category: 'Sleep', duration: '45 min', rating: 4.9, emoji: '🌊', desc: 'Drift off to the gentle rhythm of ocean waves.', downloads: 12500, isFaved: false, audioUrl: '/audios/Ocean Sleep Sounds.mp3' },
  { id: 2, title: 'Anxiety Relief', category: 'Anxiety', duration: '12 min', rating: 4.8, emoji: '🌸', desc: 'A calming guide to release tension and worry.', downloads: 9800, isFaved: true, audioUrl: '/audios/Anxiety Relief.mp3' },
  { id: 3, title: 'Deep Focus Flow', category: 'Focus', duration: '20 min', rating: 4.7, emoji: '🎯', desc: 'Binaural beats tuned for peak concentration.', downloads: 7200, isFaved: false, audioUrl: '/audios/Deep Focus Flow.mp3' },
  { id: 4, title: '4-7-8 Breathing', category: 'Breathing', duration: '8 min', rating: 4.9, emoji: '💨', desc: 'A proven breath-work technique to calm the nervous system.', downloads: 15300, isFaved: true, audioUrl: '/audios/4-7-8 Breathing.mp3' },
  { id: 5, title: 'Morning Energize', category: 'Morning', duration: '10 min', rating: 4.6, emoji: '☀️', desc: 'Gentle stretches and affirmations for a powerful start.', downloads: 6100, isFaved: false, audioUrl: '/audios/Morning Energize.mp3' },
  { id: 6, title: 'Body Scan Relaxation', category: 'Anxiety', duration: '15 min', rating: 4.8, emoji: '🧘', desc: 'Systematically relax every part of your body.', downloads: 8900, isFaved: false, audioUrl: '/audios/Body Scan Relaxation.mp3' },
  { id: 7, title: 'Power Hour Mix', category: 'Energy', duration: '60 min', rating: 4.7, emoji: '⚡', desc: 'Upbeat rhythms combined with motivational affirmations.', downloads: 5400, isFaved: false, audioUrl: '/audios/Power Hour Mix.mp3' },
  { id: 8, title: 'Stress Release Guide', category: 'Anxiety', duration: '25 min', rating: 4.9, emoji: '💜', desc: 'Holistic approach to managing cortisol levels naturally.', downloads: 11200, isFaved: true, audioUrl: '/audios/Stress Release Guide.mp3' },
];

const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } }
};
const listItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};

export default function MeditationsView() {
  const [cat, setCat] = useState('All');
  const [playing, setPlaying] = useState(null);
  const [favorites, setFavorites] = useState(new Set([2, 4, 8]));
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const filtered = cat === 'All' ? sessions : sessions.filter(s => s.category === cat);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (playing && audioRef.current) {
      audioRef.current.play().catch(e => console.warn('Audio blocked by browser:', e));
    } else if (!playing && audioRef.current) {
      audioRef.current.pause();
    }
  }, [playing]);

  const handlePlayPause = (id) => {
    if (playing === id) {
      setPlaying(null);
    } else {
      setPlaying(id);
      setProgress(0);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      // Enforce 3 minute maximum
      if (audioRef.current.currentTime >= 180) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlaying(null);
        setProgress(0);
        return;
      }
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFav = (id) => {
    const updated = new Set(favorites);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setFavorites(updated);
  };

  return (
    <div className="space-y-7 max-w-5xl text-slate-900 dark:text-slate-200">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-slate-900 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-white dark:text-white">
          <Headphones size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Meditations</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-medium text-sm">Guided sessions to find calm, focus, and clarity</p>
        </div>

        {/* Global Volume Control */}
        <div className="ml-auto hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl">
          {volume === 0 ? <VolumeX size={16} className="text-slate-500" /> : <Volume2 size={16} className="text-slate-500" />}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-purple-500 cursor-pointer"
          />
        </div>
      </motion.div>

      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        src={playing ? sessions.find(s => s.id === playing)?.audioUrl : ''}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => setPlaying(null)}
      />

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex gap-2.5 flex-wrap pb-5 border-b border-white/10"
      >
        {categories.map(c => (
          <motion.button
            key={c}
            onClick={() => setCat(c)}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all ${cat === c
                ? 'text-white'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
              }`}
          >
            {cat === c && (
              <motion.div
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-slate-800 dark:bg-white/10 border border-slate-700 dark:border-white/15"
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              />
            )}
            <span className="relative z-10">{c}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Sessions Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cat}
          variants={listContainer}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtered.map((s) => (
            <motion.div
              key={s.id}
              variants={listItem}
              whileHover={{ y: -7, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="group"
            >
              <div className="panel rounded-3xl overflow-hidden h-full flex flex-col">
                {/* Photo banner */}
                <div
                  className="h-40 relative"
                  style={{
                    backgroundImage: `url('${sessionPhotos[s.id]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Fav + category */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-white/15 text-white uppercase tracking-widest border border-white/20">{s.category}</span>
                    <motion.button
                      onClick={() => toggleFav(s.id)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart
                        size={18}
                        className={`transition-all drop-shadow-lg ${favorites.has(s.id) ? 'fill-rose-400 text-rose-400' : 'text-white/70 hover:text-rose-300'}`}
                      />
                    </motion.button>
                  </div>
                  {/* Emoji bottom left */}
                  <div className="absolute bottom-3 left-4 text-3xl drop-shadow-lg">{s.emoji}</div>
                  {/* Play button bottom right */}
                  <motion.button
                    onClick={() => handlePlayPause(s.id)}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="absolute bottom-3 right-4 w-11 h-11 rounded-full bg-white/15 border border-white/20 text-white flex items-center justify-center shadow-xl"
                  >
                    {playing === s.id ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mb-4">
                    {s.desc}
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Clock size={12} /> {s.duration}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < Math.floor(s.rating) ? 'fill-amber-300 text-amber-300' : 'text-slate-600'} />
                        ))}
                        <span className="text-xs font-bold text-slate-400 ml-1">{s.rating}</span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                        <Download size={11} /> {(s.downloads / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <AnimatePresence>
                    {playing === s.id && (
                      <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        style={{ originX: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full bg-white/60 rounded-full text-left"
                            style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-300 mt-1.5 font-bold">
                          <span>{formatTime(progress)}</span>
                          <span>{playing === s.id && duration ? formatTime(duration) : s.duration}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-base text-slate-500 font-medium">No meditations found in this category</p>
        </motion.div>
      )}
    </div>
  );
}
