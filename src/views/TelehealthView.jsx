import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Star, Wifi, ChevronRight, Stethoscope, Loader2, AlertCircle } from 'lucide-react';

const GLASS = 'panel-soft';

const doctors = [
  { name: 'Dr. Priya Sharma',    specialty: 'General Physician',  rating: 4.9, wait: 'Available Now',  avatar: 'PS', color: '#22D3EE', live: true,  exp: '12 yrs' },
  { name: 'Dr. Arjun Mehta',     specialty: 'Cardiologist',       rating: 4.8, wait: '~8 min wait',    avatar: 'AM', color: '#34D399', live: true,  exp: '18 yrs' },
  { name: 'Dr. Ananya Singh',    specialty: 'Dermatologist',      rating: 4.7, wait: '~15 min wait',   avatar: 'AS', color: '#A78BFA', live: false, exp: '9 yrs'  },
  { name: 'Dr. Rohan Kapoor',    specialty: 'Neurologist',        rating: 4.9, wait: 'Available Now',  avatar: 'RK', color: '#FB923C', live: true,  exp: '22 yrs' },
  { name: 'Dr. Meera Nair',      specialty: 'Psychiatrist',       rating: 4.8, wait: '~5 min wait',    avatar: 'MN', color: '#F472B6', live: true,  exp: '15 yrs' },
  { name: 'Dr. Kabir Verma',     specialty: 'Orthopedist',        rating: 4.6, wait: '~30 min wait',   avatar: 'KV', color: '#FBBF24', live: false, exp: '11 yrs' },
];

function DoctorAvatar({ doc }) {
  return (
    <div
      className="relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${doc.color}30, ${doc.color}10)`, border: `2px solid ${doc.color}50` }}
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full opacity-15 rounded-2xl" fill="none">
        <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="2.5" />
        <path d="M14 14 Q8 24 8 30 Q8 36 14 36 Q20 36 20 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="31" r="3" fill="currentColor" />
      </svg>
      <span className="font-extrabold text-sm" style={{ color: doc.color }}>{doc.avatar}</span>
      {doc.live && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      )}
    </div>
  );
}

const entrance = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function TelehealthView() {
  const [isCalling, setIsCalling] = useState(false);
  const [callingDoctor, setCallingDoctor] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [mediaError, setMediaError] = useState('');

  // Analysis State
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null); // Simulated remote video
  const streamRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isCalling) {
      interval = setInterval(() => setCallTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => stopMediaTracks();
  }, []);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCall = async (doc) => {
    setCallingDoctor(doc);
    setMediaError('');
    setMuted(false);
    setCamOff(false);
    setIsCalling(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      // Delay setting srcObject slightly to ensure ref is mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
      }, 100);

    } catch (err) {
      console.error('Media error:', err);
      setMediaError('Could not access camera or microphone. Please check permissions.');
    }
  };

  const endCall = () => {
    stopMediaTracks();
    setIsCalling(false);
    setCallingDoctor(null);
    setCallTime(0);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setCamOff(prev => !prev);
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));

    // Simple mock analysis logic
    const lower = symptoms.toLowerCase();
    let result = {
      condition: 'General Infection / Fatigue',
      urgency: 'Low',
      specialist: 'General Physician',
      description: 'Your symptoms suggest a common viral infection or general fatigue. Rest and hydration are recommended.'
    };

    if (lower.includes('heart') || lower.includes('chest') || lower.includes('palpitations')) {
      result = { condition: 'Possible Cardiovascular Issue', urgency: 'High', specialist: 'Cardiologist', description: 'Chest pain or heart palpitations require immediate medical evaluation to rule out cardiac conditions.' };
    } else if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch')) {
      result = { condition: 'Dermatitis or Allergic Reaction', urgency: 'Low', specialist: 'Dermatologist', description: 'Skin irritation or rashes are often easily treated with topical ointments or antihistamines.' };
    } else if (lower.includes('headache') || lower.includes('dizzy') || lower.includes('numb')) {
      result = { condition: 'Neurological Symptom Cluster', urgency: 'Medium', specialist: 'Neurologist', description: 'Severe headaches or dizziness should be evaluated to rule out migraines or other neurological disorders.' };
    } else if (lower.includes('anxiety') || lower.includes('stress') || lower.includes('mood')) {
      result = { condition: 'Stress / Anxiety Response', urgency: 'Low', specialist: 'Psychiatrist', description: 'Signs of mental fatigue or anxiety. Speaking with a mental health professional can provide valuable coping strategies.' };
    } else if (lower.includes('bone') || lower.includes('joint') || lower.includes('pain')) {
       result = { condition: 'Musculoskeletal Strain', urgency: 'Medium', specialist: 'Orthopedist', description: 'Joint or bone pain indicates a possible sprain or inflammatory condition requiring orthopedic review.' };
    }

    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <motion.div variants={entrance} initial="hidden" animate="visible" className="space-y-6 max-w-5xl text-slate-900 dark:text-slate-200">
      <AnimatePresence mode="wait">
        {isCalling ? (
          /* ── Video Call Interface ── */
          <motion.div
            key="call"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative rounded-3xl overflow-hidden"
            style={{ height: '75vh', background: 'linear-gradient(135deg, #050d1a, #0a1628)' }}
          >
            {/* Background Gradient/Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-0" />

            {/* Signal quality */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 z-20">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">HD Connected</span>
            </div>

            {/* Call timer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 z-20">
              <span className="text-white font-bold text-sm tabular-nums">
                {callingDoctor?.name} · {formatTime(callTime)}
              </span>
            </div>

            {/* Main Remote View (Simulated Doctor Video) */}
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-950">
              {/* In a real app, this would be a <video> element showing the remote WebRTC stream. We use a mock video. */}
              
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                loop
                muted
                className="w-full h-full object-cover"
                src="https://videos.pexels.com/video-files/4114797/4114797-uhd_2560_1440_25fps.mp4"
                onError={(e) => {
                  e.target.style.display = 'none';
                  document.getElementById('avatar-fallback').style.display = 'block';
                }}
              />
              
              {/* Fallback to Avatar in case the video fails to load or error occurs */}
              <div id="avatar-fallback" className="absolute text-center" style={{ display: 'none' }}>
                <div className="mb-4 inline-flex p-6 rounded-full bg-white/5 border border-white/10 relative overflow-hidden">
                   <div className="absolute inset-0 bg-cyan-500/10 animate-pulse mix-blend-overlay"></div>
                  <DoctorAvatar doc={callingDoctor} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{callingDoctor?.name}</h2>
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">In session</span>
                </div>
              </div>

              {/* Gradient Overlay for aesthetic consistency */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Self View (Local Camera) */}
            <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 w-28 h-36 sm:w-36 sm:h-48 rounded-2xl bg-slate-900 border-2 border-white/20 overflow-hidden shadow-2xl z-30">
               {mediaError ? (
                 <div className="w-full h-full p-2 flex flex-col justify-center items-center text-center bg-slate-800">
                    <AlertCircle className="w-6 h-6 text-red-400 mb-1" />
                    <span className="text-[10px] text-red-400 font-bold leading-tight">{mediaError}</span>
                 </div>
               ) : (
                 <>
                  {/* Local video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted // Always mute local video playback to avoid feedback loop
                    className={`w-full h-full object-cover transform -scale-x-100 ${camOff ? 'opacity-0' : 'opacity-100'}`}
                  />
                  {/* Fallback when video is off */}
                  <div className={`absolute inset-0 w-full h-full bg-slate-800 flex items-center justify-center transition-opacity duration-300 ${camOff ? 'opacity-100' : 'opacity-0'}`}>
                    <VideoOff size={28} className="text-white/40" />
                  </div>
                  {muted && (
                     <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 border border-white/10 shadow-lg backdrop-blur-sm">
                       <MicOff size={12} className="text-rose-400" />
                     </div>
                  )}
                 </>
               )}
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
              <button 
                onClick={toggleMute}
                title={muted ? 'Unmute microphone' : 'Mute microphone'}
                className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center border ${muted ? 'bg-rose-500 border-rose-600' : 'bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md'}`}
              >
                {muted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
              </button>
              <button 
                onClick={endCall}
                title="End Call"
                className="w-16 h-16 rounded-3xl bg-rose-600 border border-rose-500 hover:bg-rose-700 transition-all flex items-center justify-center shadow-xl shadow-rose-900/40"
              >
                <PhoneOff className="text-white" size={28} />
              </button>
              <button 
                onClick={toggleVideo}
                title={camOff ? 'Turn on camera' : 'Turn off camera'}
                className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center border ${camOff ? 'bg-rose-500 border-rose-600' : 'bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md'}`}
              >
                {camOff ? <VideoOff className="text-white" /> : <Video className="text-white" />}
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Doctor Directory ── */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20"><Video className="text-purple-600 dark:text-purple-400 w-6 h-6" /></span>
                Telehealth
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium text-sm">Consult with top medical experts from home</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Doctor List */}
              <div className="lg:col-span-3 space-y-4">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Available Specialists</h2>
                <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                  {doctors.map((doc) => (
                    <motion.div
                      key={doc.name}
                      whileHover={{ x: 6 }}
                      className={`group p-4 rounded-3xl border border-slate-200 dark:border-white/10 ${GLASS} cursor-pointer transition-all hover:border-purple-500/30 hover:shadow-xl`}
                      onClick={() => startCall(doc)}
                    >
                      <div className="flex items-start gap-4">
                        <DoctorAvatar doc={doc} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-slate-900 dark:text-white font-bold text-base truncate pr-2">{doc.name}</p>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex-shrink-0">
                              <Star size={10} className="fill-amber-500" /> {doc.rating}
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-3">{doc.specialty} · {doc.exp} exp</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${doc.live ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-slate-400'}`} />
                              <p className={`text-[11px] font-bold ${doc.live ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{doc.wait}</p>
                            </div>
                            <button className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-300 hover:gap-2 transition-all">
                              Connect Now <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Panel: AI Triage */}
              <div className="lg:col-span-2 space-y-5">
                <div className={`${GLASS} rounded-3xl p-6 border border-slate-200 dark:border-white/10 h-full flex flex-col`}>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 flex-shrink-0">
                    <Stethoscope className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">AI Symptom Check</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium mb-5">
                    Describe your symptoms briefly and our AI will suggest the most relevant specialist for you.
                  </p>
                  
                  <div className="relative mb-5 flex-1 flex flex-col">
                    <textarea
                      value={symptoms}
                      onChange={e => setSymptoms(e.target.value)}
                      className="w-full flex-1 min-h-[120px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium resize-none shadow-inner"
                      placeholder="e.g. Mild headache and fatigue for 2 days..."
                    />
                  </div>

                  {/* Analysis Result */}
                  <AnimatePresence>
                    {analysisResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-5 overflow-hidden"
                      >
                        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">Analysis Complete</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${analysisResult.urgency === 'High' ? 'bg-rose-500/20 text-rose-500' : analysisResult.urgency === 'Medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                              {analysisResult.urgency} Urgency
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">{analysisResult.condition}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-3">
                            {analysisResult.description}
                          </p>
                          <div className="border-t border-purple-500/20 pt-3">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                              <span>Recommended Specialist:</span>
                              <span className="text-purple-600 dark:text-purple-400">{analysisResult.specialist}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !symptoms.trim()}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-purple-600 dark:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                  >
                    {isAnalyzing ? (
                      <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                    ) : (
                      'Analyze Symptoms'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
