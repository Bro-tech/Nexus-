import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Moon, Activity, Zap, Watch, Bluetooth, TrendingUp, Droplets, BluetoothOff, Check } from 'lucide-react';

const GLASS = 'panel-soft';

const EKG_PATH_UNIT = 'M0,50 L30,50 L38,50 L42,20 L46,80 L50,40 L54,50 L80,50';

// Simulated vitals that animate in after "connecting"
const CONNECTED_STATS = [
  { label: 'Sleep Quality',  value: '88%',   icon: Moon,       color: '#A78BFA', sub: 'Last night · 7h 22m' },
  { label: 'SpO2',           value: '98%',   icon: Activity,   color: '#22D3EE', sub: 'Normal range'        },
  { label: 'Calories',       value: '1,842', icon: Zap,        color: '#FB923C', sub: 'kcal burned today'   },
  { label: 'Hydration',      value: '6 / 8', icon: Droplets,   color: '#34D399', sub: 'glasses today'       },
  { label: 'Stress Score',   value: '32',    icon: TrendingUp,  color: '#F472B6', sub: 'Low stress detected' },
];

const ZERO_STATS = [
  { label: 'Sleep Quality',  value: '—',     icon: Moon,      color: '#A78BFA', sub: 'Awaiting device' },
  { label: 'SpO2',           value: '—',     icon: Activity,  color: '#22D3EE', sub: 'Awaiting device' },
  { label: 'Calories',       value: '—',     icon: Zap,       color: '#FB923C', sub: 'Awaiting device' },
  { label: 'Hydration',      value: '—',     icon: Droplets,  color: '#34D399', sub: 'Awaiting device' },
  { label: 'Stress Score',   value: '—',     icon: TrendingUp, color: '#F472B6', sub: 'Awaiting device' },
];

const BASE_BPM = 72;
function useLiveBPM(active) {
  const [bpm, setBpm] = useState(0);
  useEffect(() => {
    if (!active) { setBpm(0); return; }
    setBpm(BASE_BPM);
    const interval = setInterval(() => {
      setBpm(BASE_BPM + Math.floor(Math.random() * 7 - 3));
    }, 1200);
    return () => clearInterval(interval);
  }, [active]);
  return bpm;
}

const entrance = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function BiometricsWidget() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState('Smartwatch');
  const bpm = useLiveBPM(connected);

  const handleConnect = async () => {
    setConnecting(true);

    try {
      // Use the native Web Bluetooth API to scan for nearby devices!
      // This will pop up the browser's native "Choose a Bluetooth device" dialog.
      // If the user's Bluetooth is physically off, the browser will usually prompt them to turn it on.
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'battery_service']
      });

      // If the user selected a device successfully
      setDeviceName(device.name || 'Unknown Device');
      
      // Simulate connecting to the device's GATT server since we don't know the exact services for every watch
      await new Promise(r => setTimeout(r, 1000));
      
      setConnected(true);
    } catch (error) {
      console.warn("Bluetooth connection failed or cancelled by user:", error);
      // Fallback/Simulate for desktop if no Bluetooth module exists, or user cancelled
      if (error.name === 'NotFoundError' || error.name === 'NotSupportedError') {
          alert('Web Bluetooth is either not supported by your browser/OS, or no devices were found. Ensure Bluetooth is enabled.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setDeviceName('Smartwatch');
  };

  const stats = connected ? CONNECTED_STATS : ZERO_STATS;

  return (
    <motion.div variants={entrance} initial="hidden" animate="visible" className="space-y-6 max-w-4xl text-slate-900 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30"><Watch className="w-6 h-6 text-rose-500 dark:text-rose-400" /></span>
            Smartwatch Sync
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            {connected ? `Real-time biometrics from ${deviceName}` : 'Real-time biometrics from your wrist'}
          </p>
        </div>

        {/* Connection pill */}
        <AnimatePresence mode="wait">
          {connected ? (
            <motion.button
              key="connected"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleDisconnect}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all group"
            >
              <Bluetooth className="w-4 h-4 text-cyan-500 dark:text-cyan-400 group-hover:text-rose-400 transition-colors" />
              <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse group-hover:bg-rose-400 transition-colors" />
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-300 group-hover:text-rose-300 transition-colors line-clamp-1 max-w-[150px]">
                {deviceName}
              </span>
            </motion.button>
          ) : (
            <motion.button
              key="disconnected"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={connecting ? null : handleConnect}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500/30 transition-all group"
            >
              {connecting ? (
                <Activity className="w-4 h-4 text-purple-500 animate-spin" />
              ) : (
                <BluetoothOff className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
              )}
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-purple-300">
                {connecting ? 'Connecting...' : 'Connect Watch'}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Main Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Heart Rate Panel */}
        <div className={`col-span-1 md:col-span-2 ${GLASS} rounded-3xl p-6 border border-slate-200 dark:border-white/10 flex flex-col justify-between min-h-[220px]`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Heart Rate</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-5xl font-black tabular-nums ${connected ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                  {connected ? bpm : '--'}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">bpm</span>
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${connected ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
              <Heart className={connected ? 'animate-pulse' : ''} />
            </div>
          </div>
          
          <div className="mt-4 h-16 w-full bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden relative">
            {connected ? (
              <motion.svg viewBox="0 0 400 100" className="w-full h-full">
                <motion.path
                  d={`${EKG_PATH_UNIT} ${EKG_PATH_UNIT} ${EKG_PATH_UNIT} ${EKG_PATH_UNIT} ${EKG_PATH_UNIT}`}
                  fill="none"
                  stroke="#FB7185"
                  strokeWidth="3"
                  initial={{ x: 0 }}
                  animate={{ x: -160 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </motion.svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect for 24/7 monitoring</p>
              </div>
            )}
          </div>
        </div>

        {/* Other Vitals Grid */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          {stats.slice(0, 4).map((s, i) => (
            <motion.div
              key={s.label}
              variants={entrance}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`${GLASS} rounded-2xl p-4 border border-slate-200 dark:border-white/10`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                  <s.icon size={16} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
              </div>
              <p className={`text-xl font-black ${connected ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>{s.value}</p>
              <p className="text-[9px] font-bold text-slate-400 mt-1 truncate">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Connection Info Banner */}
      <AnimatePresence>
        {!connected && !connecting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-4"
          >
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 flex-shrink-0">
              <Bluetooth size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-purple-300">Bluetooth Device Required</p>
              <p className="text-[11px] text-slate-600 dark:text-purple-400/70 font-medium">To sync your vitals, please ensure your smartwatch is in pairing mode and move it closer to your device.</p>
            </div>
            <button 
              onClick={handleConnect}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all flex-shrink-0"
            >
              Scan Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
