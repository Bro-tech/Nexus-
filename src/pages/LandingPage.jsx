import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeartPreloader from '../components/ui/HeartPreloader';
import LiquidEther from '../components/LiquidEther';

const organPoints = [
  { id: 'brain', label: 'Brain', x: '50%', y: '16%', value: '60-80 ms', detail: 'Avg synpatic response time' },
  { id: 'lungs', label: 'Lungs', x: '50%', y: '35%', value: '12-20 rpm', detail: 'Avg resting breath rate' },
  { id: 'heart', label: 'Heart', x: '53%', y: '42%', value: '60-100 bpm', detail: 'Avg resting heart rate' },
  { id: 'kidneys', label: 'Kidneys', x: '50%', y: '62%', value: '150-180L', detail: 'Avg daily blood filtered' },
];

const statCards = [
  { label: '95-100%', sub: 'Avg SpO2', x: '82%', y: '16%' },
  { label: '12-20 rpm', sub: 'Resp Rate', x: '18%', y: '30%' },
  { label: '60-100 bpm', sub: 'Heart Rate', x: '85%', y: '45%' },
  { label: '120/80', sub: 'Blood Press.', x: '15%', y: '65%' },
];

export default function LandingPage() {
  const [activeOrgan, setActiveOrgan] = useState(organPoints[2]);
  const [imageFailed, setImageFailed] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const bodyImage = '/assets/hero-body.png';

  const activeMeta = useMemo(() => activeOrgan, [activeOrgan]);

  return (
    <>
      <AnimatePresence>
        {isPreloading && <HeartPreloader key="preloader" onComplete={() => setIsPreloading(false)} />}
      </AnimatePresence>

      <motion.div 
        className="dark min-h-screen bg-charcoal text-white relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
        animate={{ 
          opacity: isPreloading ? 0 : 1, 
          scale: isPreloading ? 0.98 : 1,
          filter: isPreloading ? "blur(10px)" : "blur(0px)"
        }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-60">
          <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <LiquidEther
              colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
              mouseForce={20}
              cursorSize={100}
              isViscous
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              isBounce={false}
              autoDemo
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
              color0="#5227FF"
              color1="#FF9FFC"
              color2="#B19EEF"
            />
          </div>
        </div>
        <div className="absolute inset-0 grid-fade opacity-30" />
        <div className="absolute -top-32 -left-20 w-[520px] h-[520px] rounded-full blur-[120px] bg-purple-500/15" />
        <div className="absolute top-10 right-0 w-[420px] h-[420px] rounded-full blur-[110px] bg-blue-500/10" />
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-purple-200">
              <Sparkles size={12} className="text-purple-300" />
              Decentralized Health Future
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Your Health.
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text sm:ml-2 lg:ml-0" style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                Your Control.
              </span>
            </h1>
            <p className="text-slate-300 max-w-xl text-xs sm:text-sm md:text-base px-4 lg:px-0">
              An AI-powered health record system where patients control their medical data. Privacy-first, intelligence-driven,
              quantum-secured.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 w-full">
              <Link to="/register" className="w-full sm:w-auto">
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn bp blg w-full sm:w-auto justify-center text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3">
                  Get Started <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="btn bg blg w-full sm:w-auto justify-center text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 border-slate-700">
                  Explore Dashboard
                </motion.button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-4 w-full px-4 sm:px-0">
              {[
                { label: '256-bit', sub: 'Encryption' },
                { label: 'Real-time', sub: 'AI Analysis' },
                { label: 'Zero', sub: 'Data Leaks' },
              ].map((item) => (
                <div key={item.label} className="panel-soft rounded-xl px-4 py-3 text-center">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0 hidden sm:block">
            <div className="relative p-2 sm:p-6">
              {/* Body image */}
              <div className="relative mx-auto w-full max-w-md aspect-[3/4]">
                {!imageFailed ? (
                  <img
                    src={bodyImage}
                    alt="Human body"
                    className="w-full h-full object-contain"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl border border-white/10 flex items-center justify-center text-slate-500 text-sm">
                    Body model image missing
                  </div>
                )}

                {/* Floating stat cards */}
                {statCards.map((stat) => (
                  <div
                    key={stat.label}
                    className="absolute px-3 py-2 rounded-xl panel-soft text-xs border border-white/10"
                    style={{ left: stat.x, top: stat.y }}
                  >
                    <div className="text-white font-semibold">{stat.label}</div>
                    <div className="text-slate-400 text-[10px]">{stat.sub}</div>
                  </div>
                ))}

                {/* Organ hotspots */}
                {organPoints.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onMouseEnter={() => setActiveOrgan(pt)}
                    onMouseLeave={() => setActiveOrgan(null)}
                    onClick={() => setActiveOrgan(pt)}
                    className="absolute w-4 h-4 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(124,58,237,0.8)] border border-purple-200/60 transition-transform hover:scale-110"
                    style={{ left: pt.x, top: pt.y, transform: 'translate(-50%, -50%)' }}
                    aria-label={pt.label}
                  />
                ))}

                {/* Floating active organ info */}
                <AnimatePresence>
                  {activeMeta && (
                    <motion.div
                      key={activeMeta.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-20 pointer-events-none"
                      style={{ left: activeMeta.x, top: activeMeta.y, transform: 'translate(-50%, calc(-100% - 16px))' }}
                    >
                      <div className="bg-charcoal/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(124,58,237,0.4)] min-w-[140px]">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-purple-300 font-bold mb-1">
                          {activeMeta.label}
                        </div>
                        <div className="text-xl font-bold text-white leading-tight">
                          {activeMeta.value}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {activeMeta.detail}
                        </div>
                        
                        {/* Little triangle arrow pointing to dot */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-charcoal/90 border-r border-b border-purple-500/30 rotate-45 transform origin-center" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Small glow */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-purple-500/20 blur-[80px]" />
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section id="features" className="relative z-10 border-t border-purple-500/20 bg-ocean py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: ShieldCheck, title: 'Private by Design', desc: 'Patient-owned records with end-to-end encryption.' },
            { icon: Cpu, title: 'Real-time AI', desc: 'Continuous analysis with intelligent alerts.' },
            { icon: Sparkles, title: 'Zero Trust', desc: 'Decentralized storage with audit trails.' },
          ].map((f) => (
            <div key={f.title} className="panel-soft rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-3">
                <f.icon size={18} className="text-purple-300" />
              </div>
              <div className="text-base font-semibold">{f.title}</div>
              <div className="text-xs text-slate-400 mt-2">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="relative z-10 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="panel rounded-3xl p-6 sm:p-10 text-center">
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500">Ready to start?</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 sm:mt-3">Take control of your medical data.</h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 sm:mt-3">Build a secure, intelligent health profile in minutes.</p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <button className="btn bp blg w-full sm:w-auto justify-center text-sm sm:text-base">Get Started</button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="btn bg blg w-full sm:w-auto justify-center text-sm sm:text-base border-slate-700">Explore Dashboard</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </motion.div>
    </>
  );
}
