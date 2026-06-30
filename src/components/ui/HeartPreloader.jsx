import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function HeartPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // We want it to reach 100 in about 2.5 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 4) + 1;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 600); // 600ms pause at 100%
          return 100;
        }
        return next;
      });
    }, 45); // roughly ~2.5s to reach 100

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Heart Container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12">
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{
              scale: 0.8 + (progress / 100) * 0.7 // Grows larger as progress increases
            }}
            transition={{ type: "spring", bounce: 0.1 }}
            className="relative z-10 drop-shadow-[0_0_50px_rgba(239,68,68,0.6)]"
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1, 1.25, 1], // Heartbeat pattern (lub-dub)
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img src="/assets/heart.png" alt="Real Beating Heart" className="w-40 h-40 object-contain drop-shadow-2xl" />
            </motion.div>
          </motion.div>
          
          {/* Beating Rings */}
          <motion.div 
            className="absolute z-0 rounded-full border border-red-500/50 w-[120px] h-[120px]"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute z-0 rounded-full border border-red-400/30 w-[120px] h-[120px]"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 3.8, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
          />
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl font-black tracking-tighter text-transparent bg-clip-text drop-shadow-[0_2px_10px_rgba(220,38,38,0.3)]" style={{ backgroundImage: 'linear-gradient(135deg, #fecaca, #ef4444, #991b1b)' }}>
            {progress}%
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-purple-200/50 font-semibold min-h-[20px]">
            <AnimatePresence mode="wait">
              <motion.span
                key={progress < 30 ? "init" : progress < 70 ? "link" : progress < 100 ? "decrypt" : "ready"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {progress < 30 && "Initializing Core"}
                {progress >= 30 && progress < 70 && "Establishing Secure Link"}
                {progress >= 70 && progress < 100 && "Decrypting Profile"}
                {progress === 100 && "System Ready"}
              </motion.span>
            </AnimatePresence>
          </div>
          
          {/* EKG Progress Line Container */}
          <div className="relative w-64 h-12 mt-4 flex items-center justify-start">
            {/* Faded Background Line */}
            <svg viewBox="0 0 256 40" className="absolute top-0 left-0 w-64 h-12 opacity-20 pointer-events-none" preserveAspectRatio="none">
              <path fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                d="M0,20 L40,20 L50,5 L60,35 L70,15 L75,25 L85,20 L170,20 L180,5 L190,35 L200,15 L205,25 L215,20 L256,20" />
            </svg>
            
            {/* Active Foreground Line masked by width */}
            <motion.div 
              className="absolute top-0 left-0 bottom-0 overflow-hidden"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              <svg viewBox="0 0 256 40" className="w-64 h-12 text-red-500 absolute top-0 left-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" preserveAspectRatio="none">
                <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                  d="M0,20 L40,20 L50,5 L60,35 L70,15 L75,25 L85,20 L170,20 L180,5 L190,35 L200,15 L205,25 L215,20 L256,20" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
