// localStorage utilities for data persistence

export const storage = {
  // Mood Journal
  getMoodEntries: () => {
    try {
      return JSON.parse(localStorage.getItem('moodEntries')) || [];
    } catch {
      return [];
    }
  },
  saveMoodEntry: (entry) => {
    const entries = storage.getMoodEntries();
    entries.push({ ...entry, id: Date.now(), timestamp: new Date().toISOString() });
    localStorage.setItem('moodEntries', JSON.stringify(entries));
    return entries;
  },
  deleteMoodEntry: (id) => {
    const entries = storage.getMoodEntries().filter(e => e.id !== id);
    localStorage.setItem('moodEntries', JSON.stringify(entries));
    return entries;
  },

  // Meditation History
  getMeditationHistory: () => {
    try {
      return JSON.parse(localStorage.getItem('meditationHistory')) || [];
    } catch {
      return [];
    }
  },
  saveMeditationSession: (session) => {
    const history = storage.getMeditationHistory();
    history.push({ ...session, id: Date.now(), timestamp: new Date().toISOString() });
    localStorage.setItem('meditationHistory', JSON.stringify(history));
    return history;
  },

  // Daily Streak
  getStreak: () => {
    try {
      return JSON.parse(localStorage.getItem('dailyStreak')) || { current: 0, longest: 0, lastDate: null };
    } catch {
      return { current: 0, longest: 0, lastDate: null };
    }
  },
  updateStreak: () => {
    const streak = storage.getStreak();
    const today = new Date().toDateString();
    const lastDate = streak.lastDate ? new Date(streak.lastDate).toDateString() : null;

    if (lastDate === today) {
      return streak; // Already logged in today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate === yesterday.toDateString()) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }

    if (streak.current > streak.longest) {
      streak.longest = streak.current;
    }

    streak.lastDate = today;
    localStorage.setItem('dailyStreak', JSON.stringify(streak));
    return streak;
  },

  // Daily Goals
  getDailyGoals: () => {
    try {
      return JSON.parse(localStorage.getItem('dailyGoals')) || { meditation: 0, journal: 0, breathing: 0 };
    } catch {
      return { meditation: 0, journal: 0, breathing: 0 };
    }
  },
  setDailyGoals: (goals) => {
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
    return goals;
  },

  // Daily Challenge
  getDailyChallenge: () => {
    try {
      const data = JSON.parse(localStorage.getItem('dailyChallenge')) || { challenge: null, completed: false, date: null };
      const today = new Date().toDateString();
      
      // Reset if it's a new day
      if (data.date !== today) {
        data.challenge = generateRandomChallenge();
        data.completed = false;
        data.date = today;
        localStorage.setItem('dailyChallenge', JSON.stringify(data));
      }
      return data;
    } catch {
      const data = { challenge: generateRandomChallenge(), completed: false, date: new Date().toDateString() };
      localStorage.setItem('dailyChallenge', JSON.stringify(data));
      return data;
    }
  },
  completeChallenge: () => {
    const data = storage.getDailyChallenge();
    data.completed = true;
    localStorage.setItem('dailyChallenge', JSON.stringify(data));
    storage.updateStreak();
    return data;
  },

  // User Profile
  getProfile: () => {
    try {
      return JSON.parse(localStorage.getItem('userProfile')) || { name: 'Alex', email: '' };
    } catch {
      return { name: 'Alex', email: '' };
    }
  },
  setProfile: (profile) => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    return profile;
  },

  // Clear all data
  clearAll: () => {
    localStorage.clear();
  },

  // ─── Doctor: Prescriptions ───────────────────────────────────────────────
  getPrescriptions: (patientUid) => {
    try {
      const all = JSON.parse(localStorage.getItem('nexus_prescriptions')) || [];
      if (patientUid) return all.filter(p => p.patientUid === patientUid);
      return all;
    } catch { return []; }
  },
  savePrescription: (prescription) => {
    const all = storage.getPrescriptions();
    all.push({ ...prescription, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem('nexus_prescriptions', JSON.stringify(all));
    return all;
  },
  deletePrescription: (id) => {
    const all = storage.getPrescriptions().filter(p => p.id !== id);
    localStorage.setItem('nexus_prescriptions', JSON.stringify(all));
    return all;
  },

  // ─── Doctor: Aggregate patient data ──────────────────────────────────────
  getAllPatientsData: () => {
    try {
      const users = JSON.parse(localStorage.getItem('serene_mock_db_users')) || [];
      return users
        .filter(u => u.role !== 'doctor')
        .map(u => ({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || u.email,
          createdAt: u.createdAt,
        }));
    } catch { return []; }
  },

  getPatientFullData: (patientUid) => {
    try {
      const users = JSON.parse(localStorage.getItem('serene_mock_db_users')) || [];
      const user = users.find(u => u.uid === patientUid);
      if (!user) return null;
      const moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
      const meditationHistory = JSON.parse(localStorage.getItem('meditationHistory')) || [];
      const streak = JSON.parse(localStorage.getItem('dailyStreak')) || {};
      const medicines = JSON.parse(localStorage.getItem('serene_medicines')) || [];
      const prescriptions = storage.getPrescriptions(patientUid);
      return { user, moodEntries, meditationHistory, streak, medicines, prescriptions };
    } catch { return null; }
  },
};


const challenges = [
  { title: '🧘 Mindful Minute', description: 'Spend 1 minute in complete silence, just observing your thoughts' },
  { title: '🌱 Gratitude Check', description: 'Write down 3 things you\'re grateful for today' },
  { title: '💧 Hydration Boost', description: 'Drink 8 glasses of water throughout the day' },
  { title: '🚶 Nature Walk', description: 'Take a 15-minute walk outside and observe nature' },
  { title: '📱 Digital Detox', description: 'Put your phone away for 2 hours and do something creative' },
  { title: '🤝 Kind Act', description: 'Do one act of kindness for someone today' },
  { title: '🎵 Music Meditation', description: 'Listen to a calming song without distractions' },
  { title: '💪 Stretch Session', description: 'Do 10 minutes of stretching or light yoga' },
  { title: '📝 Journaling', description: 'Write freely for 10 minutes about your feelings' },
  { title: '🧠 Positive Affirmation', description: 'Repeat a positive affirmation 5 times' },
];

function generateRandomChallenge() {
  return challenges[Math.floor(Math.random() * challenges.length)];
}
