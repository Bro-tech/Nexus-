import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import Scene from '../components/3d/Scene';
import BreathingSphere from '../components/3d/BreathingSphere';
import HomeView from '../views/HomeView';
import MoodJournalView from '../views/MoodJournalView';
import MeditationsView from '../views/MeditationsView';
import AnalyticsView from '../views/AnalyticsView';
import SettingsView from '../views/SettingsView';
import AILensView from '../views/AILensView';
import ClinicLocatorView from '../views/ClinicLocatorView';
import TelehealthView from '../views/TelehealthView';
import WellnessHubView from '../views/WellnessHubView';
import BiometricsWidget from '../views/BiometricsWidget';
import SandboxMode from '../views/SandboxMode';
import AIChatView from '../views/AIChatView';

import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const viewMap = {
  home:        HomeView,
  journal:     MoodJournalView,
  meditations: MeditationsView,
  analytics:   AnalyticsView,
  settings:    SettingsView,
  ailens:      AILensView,
  clinic:      ClinicLocatorView,
  telehealth:  TelehealthView,
  wellness:    WellnessHubView,
  biometrics:  BiometricsWidget,
  sandbox:     SandboxMode,
  aichat:      AIChatView,
};

// Physics-based page swap variants
const pageVariants = {
  initial: { opacity: 0, y: 28 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24, opacity: { duration: 0.3 } }
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.18, ease: 'easeIn' }
  },
};

export default function DashboardPage() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [showSOS, setShowSOS] = useState(false);
  const [showBreathe, setShowBreathe] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, loading, navigate]);

  if (loading || !currentUser) return null;

  const ActiveView = viewMap[activeTab] || HomeView;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full relative overflow-hidden bg-slate-50 dark:bg-charcoal text-slate-900 dark:text-slate-200 transition-colors duration-300">
      {/* Dynamic Anatomy Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-slate-50 dark:bg-charcoal transition-colors duration-500">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 opacity-40 mix-blend-multiply dark:opacity-30 dark:mix-blend-screen"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2000&auto=format&fit=crop')" }} 
        />
        {/* Soft fading overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#CCC9E7]/60 via-[#CCC9E7]/80 to-[#CCC9E7]/90 dark:from-transparent dark:via-charcoal/60 dark:to-charcoal/95" />
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onSosClick={() => {}} />

      {/* Main content */}
      <main className="relative z-10 flex-1 px-6 md:px-12 py-10 pb-28 md:pb-10 h-full overflow-y-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <ActiveView onBreathe={() => setShowBreathe(true)} />
          </motion.div>
        </AnimatePresence>
      </main>



      {/* ── Breath Modal ── */}
      <AnimatePresence>
        {showBreathe && (
          <motion.div
            key="breathe-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/55 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setShowBreathe(false); }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative h-[520px] w-full max-w-xl bg-gradient-to-br from-purple-900/90 to-indigo-900/80 backdrop-blur-2xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col items-center justify-between p-12 text-white"
            >
              <h2 className="text-3xl font-light tracking-wide opacity-90">Breathe deeply...</h2>
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <motion.img 
                  src="/assets/lungs.png" 
                  alt="Breathing Lungs"
                  className="w-56 h-56 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]"
                  style={{ mixBlendMode: 'screen', filter: 'brightness(1.5) contrast(1.2)' }}
                  animate={{ 
                    scale: [1, 1.4, 1.4, 1], // Inhale, Hold, Exhale, Hold
                    opacity: [0.6, 1, 1, 0.6]
                  }}
                  transition={{
                    duration: 8, // 8 second full breath cycle
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.4, 0.5, 1] // timing for inhale (0-40%), hold (40-50%), exhale (50-100%)
                  }}
                />
              </div>
              <div className="z-10 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                <span className="text-white/80 font-semibold tracking-widest uppercase text-xs">Inhale · Hold · Exhale</span>
              </div>
              <motion.button
                onClick={() => setShowBreathe(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="z-10 px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-semibold border border-white/20 transition-colors"
              >
                End Session
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
