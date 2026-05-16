import React, { useState, useEffect } from 'react';
import { Shield, Sword, Coins, Trophy, User, LogIn, Swords, Scroll, Timer, CheckCircle, XCircle, Plus, LayoutDashboard, ListOrdered, Flame, Zap, Sparkles, BookOpen, HeartPulse, GraduationCap, RotateCcw, ZapOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { cn } from './lib/utils';
import { ROADMAP_WEEKS, CORE_RULES, DAILY_REHAB } from './roadmapData';

// Types
interface UserProfile {
  displayName: string;
  level: number;
  xp: number;
  gold: number;
  charClass: string;
  challengeDays: number;
  unlockedAchievements: string[];
  stats: {
    str: number;
    int: number;
    dex: number;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (profile: UserProfile, quests: Quest[]) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { 
    id: 'first_quest', 
    name: 'First Blood', 
    description: 'Complete your first quest', 
    icon: '⚔️',
    condition: (_, quests) => quests.some(q => q.status === 'Completed')
  },
  { 
    id: 'gold_hoarder', 
    name: 'Gold Hoarder', 
    description: 'Accumulate 1000 gold', 
    icon: '💰',
    condition: (p) => p.gold >= 1000
  },
  { 
    id: 'master_level', 
    name: 'Ascended', 
    description: 'Reach Level 5', 
    icon: '✨',
    condition: (p) => p.level >= 5
  },
  { 
    id: 'streak_master', 
    name: 'Relentless', 
    description: 'Complete 5 epic quests', 
    icon: '🔥',
    condition: (_, quests) => quests.filter(q => q.status === 'Completed' && q.difficulty === 'Epic').length >= 5
  }
];

interface Quest {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Epic';
  durationMinutes: number;
  remainingSeconds: number;
  status: 'Active' | 'Completed' | 'Failed' | 'In-Progress';
  createdAt: number;
  isTimed?: boolean;
  type?: 'Main' | 'Side';
  category?: 'Might' | 'Arcane' | 'Endurance' | 'Discipline' | 'General';
}

const INITIAL_PROFILE: UserProfile = {
  displayName: 'Dungeon Crawler',
  level: 1,
  xp: 0,
  gold: 0,
  charClass: 'Warrior',
  challengeDays: 1,
  unlockedAchievements: [],
  stats: { str: 10, int: 10, dex: 10 }
};

const CATEGORY_COLORS: Record<string, string> = {
  Might: 'text-orange-500',
  Arcane: 'text-cyan-400',
  Endurance: 'text-emerald-400',
  Discipline: 'text-fuchsia-500',
  General: 'text-indigo-400'
};

const CATEGORY_BG: Record<string, string> = {
  Might: 'bg-orange-500',
  Arcane: 'bg-cyan-400',
  Endurance: 'bg-emerald-400',
  Discipline: 'bg-fuchsia-500',
  General: 'bg-indigo-400'
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-emerald-400',
  Medium: 'text-yellow-400',
  Hard: 'text-orange-500',
  Epic: 'text-red-500 glitch-text'
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quests' | 'leaderboard' | 'roadmap' | 'progress'>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setQuests(prev => prev.map(q => {
        const isTimed = q.isTimed !== false; // Default to timed
        if (q.status === 'In-Progress' && isTimed && q.remainingSeconds > 0) {
          return { ...q, remainingSeconds: q.remainingSeconds - 1 };
        }
        if (q.status === 'In-Progress' && isTimed && q.remainingSeconds === 0) {
          return { ...q, status: 'Active' }; 
        }
        return q;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Achievement Check Effect
  useEffect(() => {
    if (!isInitialized) return;
    
    const newlyUnlocked: string[] = [];
    const currentAchievements = profile.unlockedAchievements || [];
    ACHIEVEMENTS.forEach(ach => {
      if (!currentAchievements.includes(ach.id) && ach.condition(profile, quests)) {
        newlyUnlocked.push(ach.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      setProfile(prev => ({
        ...prev,
        unlockedAchievements: [...(prev.unlockedAchievements || []), ...newlyUnlocked]
      }));
    }
  }, [profile, quests, isInitialized]);

  // Persistence Logic
  useEffect(() => {
    const savedProfile = localStorage.getItem('dq_profile');
    const savedQuests = localStorage.getItem('dq_quests');
    
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && typeof parsed === 'object') {
          setProfile(prev => ({ 
            ...INITIAL_PROFILE, 
            ...parsed,
            stats: { ...INITIAL_PROFILE.stats, ...(parsed.stats || {}) },
            unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements : []
          }));
        }
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
    if (savedQuests) {
      try {
        const parsedQuests = JSON.parse(savedQuests);
        if (Array.isArray(parsedQuests)) {
          setQuests(parsedQuests);
        }
      } catch (e) {
        console.error("Failed to parse quests", e);
      }
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('dq_profile', JSON.stringify(profile));
      localStorage.setItem('dq_quests', JSON.stringify(quests));
    }
  }, [profile, quests, isInitialized]);

  if (!isInitialized) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-fantasy tracking-widest uppercase">INITIALIZING DUNGEON...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white/20 overflow-x-hidden relative">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:4s]" />
      </div>

      {/* Header / HUD */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              <span className="fantasy-title text-sm md:text-xl group-hover:text-neutral-300 transition-colors glitch-text">DUNGEON QUEST</span>
            </div>
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'HUB' },
                { id: 'quests', icon: Scroll, label: 'QUESTS' },
                { id: 'progress', icon: Zap, label: 'PROG' },
                { id: 'roadmap', icon: BookOpen, label: 'ROADMAP' },
                { id: 'leaderboard', icon: Trophy, label: 'SQUAD' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/5 rounded-none border-b-2 border-transparent",
                    activeTab === tab.id && "border-white text-white bg-white/5"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] md:text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                <Flame className="w-2 h-2 md:w-2.5 md:h-2.5 text-white/50" /> {profile.challengeDays} Streak
              </span>
              <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest font-mono">{profile.gold}G</span>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 border border-white/30 overflow-hidden bg-white/5 rounded-none shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.displayName}&backgroundColor=000000`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden sticky top-16 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 p-1 flex items-center justify-around shadow-xl">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'HUB' },
          { id: 'quests', icon: Scroll, label: 'QUESTS' },
          { id: 'progress', icon: Zap, label: 'STATS' },
          { id: 'roadmap', icon: BookOpen, label: 'MAP' },
          { id: 'leaderboard', icon: Trophy, label: 'SQUAD' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all rounded-none min-w-[60px]",
              activeTab === tab.id ? "text-white" : "text-white/30"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]")} />
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && <motion.div layoutId="mobile-nav-indicator" className="w-4 h-0.5 bg-white mt-0.5" />}
          </button>
        ))}
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <Dashboard 
              profile={profile} 
              setProfile={setProfile} 
              quests={quests} 
              setQuests={setQuests}
              setActiveTab={setActiveTab} 
              setShowLevelUp={setShowLevelUp}
            />
          )}
          {activeTab === 'quests' && (
            <QuestBoard 
              profile={profile}
              quests={quests} 
              setQuests={setQuests} 
            />
          )}
          {activeTab === 'roadmap' && <RoadmapView />}
          {activeTab === 'progress' && <ProgressView quests={quests} profile={profile} />}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </AnimatePresence>

        <AnimatePresence>
          {showLevelUp && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowLevelUp(false)}
            >
              <div className="stat-box p-12 text-center space-y-6 rounded-none border-white shadow-[0_0_50px_rgba(255,255,255,0.5)]">
                <Sparkles className="w-24 h-24 text-white mx-auto animate-bounce" />
                <h2 className="fantasy-title text-6xl text-white glitch-text">LEVEL UP!</h2>
                <p className="text-2xl font-bold font-mono tracking-tighter text-white">You have reached Level {profile.level}</p>
                <p className="text-white/40 uppercase tracking-[0.3em] text-xs">Your legend grows in the shadows.</p>
                <button className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-xl shadow-2xl">
                  Accept Reward
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 bg-black/60 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
          <span>OFFLINE LOCAL MODE</span>
          <span>CHALLENGE DAY: {profile.challengeDays}</span>
          <button onClick={() => {
            if(confirm("Wipe all local save data?")) {
              localStorage.clear();
              window.location.reload();
            }
          }} className="hover:text-white transition-colors">RESET ADVENTURE</button>
        </div>
      </footer>
    </div>
  );
}

function Dashboard({ profile, setProfile, quests, setQuests, setActiveTab, setShowLevelUp }: { 
  profile: UserProfile, 
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>,
  quests: Quest[],
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>,
  setActiveTab: (tab: any) => void,
  setShowLevelUp: (show: boolean) => void
}) {
  const [verdict, setVerdict] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  const completedCount = quests.filter(q => q.status === 'Completed').length;
  const activeCount = quests.filter(q => q.status === 'Active' || q.status === 'In-Progress').length;

  const currentWeekNum = Math.min(Math.floor((profile.challengeDays - 1) / 7) + 1, 11);
  const currentWeek = ROADMAP_WEEKS.find(w => w.week === currentWeekNum) || ROADMAP_WEEKS[0];

  const runComparison = async () => {
    setComparing(true);
    try {
      const userTasks = quests.map(q => q.title);
      const res = await fetch('/api/dungeon/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTasks,
          profile,
          standardTasks: [
            ...currentWeek.dsa.map(t => `Advanced ${t} mastery`),
            ...currentWeek.ai_ml.map(t => `Implementation of ${t}`),
            currentWeek.fitness
          ]
        })
      });
      const data = await res.json();
      setVerdict(data);
      
      const xpAwarded = data.xpAwarded || 0;
      const goldAwarded = data.goldAwarded || 0;
      
      const newXp = profile.xp + xpAwarded;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      if (newLevel > profile.level) {
        setShowLevelUp(true);
      }
      
      setProfile(prev => ({
        ...prev,
        xp: newXp,
        gold: prev.gold + goldAwarded,
        level: newLevel
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setComparing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-12 gap-8"
    >
      <div className="col-span-12 lg:col-span-3 space-y-8">
        <motion.div whileHover={{ scale: 1.05 }} className="relative group stat-box rounded-none">
           <div className="p-4 border-b border-white/5 bg-white/5">
             <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest font-black">Week {currentWeekNum}: {currentWeek.title}</span>
           </div>
          <div className="aspect-[3/4] bg-white/5 relative overflow-hidden rounded-none">
             <img 
               src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.displayName}&size=200&backgroundColor=000000`} 
               alt="char" 
               className="w-full h-full object-contain p-32 group-hover:scale-110 transition-transform duration-500" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
             <div className="absolute bottom-6 left-6 right-6">
               <h2 className="fantasy-title text-2xl text-white drop-shadow-lg glitch-text">{profile.displayName}</h2>
               <p className="text-white/40 text-[10px] font-mono tracking-[0.2em] font-bold">Lvl {profile.level} {profile.charClass}</p>
             </div>
          </div>
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-white/20" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-white/20" />
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          <SkillBar label="Might" value={profile.stats.str} color="bg-orange-500" />
          <SkillBar label="Arcane" value={profile.stats.int} color="bg-cyan-400" />
          <SkillBar label="Endurance" value={profile.stats.dex} color="bg-emerald-400" />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-9 space-y-8 pb-24 lg:pb-0">
        <div className="danger-mode p-4 md:p-8 space-y-6 relative overflow-hidden rounded-none">
          <div className="absolute top-0 right-0 p-2 opacity-5 hidden md:block">
            <Shield className="w-48 h-48" />
          </div>
          
          <div className="space-y-4">
            <h3 className="fantasy-title text-xl md:text-3xl text-white glitch-text">Current Phase: {currentWeek.title}</h3>
            <p className="text-white/40 text-[8px] md:text-[10px] font-mono tracking-widest uppercase">75-Day Zero-to-Hero Challenge</p>
            <div className="flex flex-wrap gap-2 pt-2">
               {currentWeek.dsa.slice(0, 3).map((tag, i) => (
                 <span key={i} className="px-2 md:px-3 py-1 bg-white/10 text-white border border-white/20 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-none">{tag}</span>
               ))}
               {currentWeek.ai_ml.slice(0, 2).map((tag, i) => (
                 <span key={i} className="px-2 md:px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-none">{tag}</span>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <StatBox icon={Scroll} label="Quests" value={`${completedCount}/${activeCount + completedCount}`} />
            <StatBox icon={Coins} label="Gold" value={profile.gold.toString()} color="text-white" />
            <StatBox icon={Flame} label="Daily" value={profile.challengeDays.toString()} color="text-neutral-400" />
          </div>

          {!verdict ? (
            <button 
              onClick={runComparison}
              disabled={comparing || quests.length === 0}
              className={cn(
                "w-full h-24 border-2 border-dashed border-white/10 rounded-xl transition-all group flex flex-col items-center justify-center gap-2",
                quests.length > 0 ? "hover:border-white/50 hover:bg-white/5 cursor-pointer shadow-xl" : "opacity-30 cursor-not-allowed"
              )}
            >
              {comparing ? (
                <span className="text-white animate-pulse font-mono uppercase tracking-[0.4em] text-xs">Consulting the Throne...</span>
              ) : (
                <>
                  <Scroll className="w-8 h-8 text-white/20 group-hover:text-white transition-colors" />
                  <span className="fantasy-title text-xs group-hover:text-white">
                    {quests.length === 0 ? "Bounties Required" : "Submit Report"}
                  </span>
                </>
              )}
            </button>
          ) : (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 border-2 border-white/10 p-6 space-y-4 rounded-xl shadow-2xl card-3d"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="fantasy-title text-xs text-white">The Mentor's Counsel</span>
                <div className="flex items-center gap-2">
                   <button onClick={() => setVerdict(null)} className="text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors">Dismiss</button>
                   <span className="px-4 py-1 bg-white text-black text-[10px] font-black uppercase tracking-tighter shadow-lg">Rank {verdict.rank}</span>
                </div>
              </div>
              <p className="text-sm italic text-white/90 leading-relaxed font-serif">"{verdict.verdict}"</p>
              <div className="flex gap-6 text-[10px] font-mono uppercase tracking-widest border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-neutral-300" />
                  <span className="text-neutral-300">+{verdict.xpAwarded} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-3 h-3 text-white" />
                  <span className="text-white">+{verdict.goldAwarded} GOLD</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between border-b border-white/5 pb-2">
             <h4 className="fantasy-title text-sm opacity-50">Active Contracts</h4>
             <button onClick={() => setActiveTab('quests')} className="text-[10px] text-white uppercase tracking-[0.2em] font-bold hover:underline transition-all">Visit the Board</button>
           </div>
           <QuestPreview quests={quests} setQuests={setQuests} />
        </div>

        <div>
           <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
             <h4 className="fantasy-title text-sm opacity-50">Vault of Achievements</h4>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map(ach => {
                const isUnlocked = (profile.unlockedAchievements || []).includes(ach.id);
                return (
                  <div key={ach.id} className={cn(
                    "stat-box p-4 rounded-xl flex flex-col items-center text-center gap-2 transition-all card-3d",
                    isUnlocked ? "border-white/50 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "opacity-30 grayscale"
                  )}>
                    <span className="text-3xl mb-1">{ach.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{ach.name}</span>
                    <span className="text-[8px] text-white/40 leading-tight">{ach.description}</span>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="h-32 stat-box rounded-xl p-6 flex flex-col justify-between border-dashed border-white/20">
          <div className="flex justify-between items-center">
            <span className="fantasy-title text-xs opacity-70">Mastery Progress</span>
            <span className="mono text-xs text-neutral-400">{profile.xp % 100} / 100 XP</span>
          </div>
          <div className="w-full h-8 bg-black/40 rounded border border-white/10 p-1 relative overflow-hidden">
            <div className="h-full bg-gradient-to-r from-white to-neutral-500 rounded flex items-center px-4 overflow-hidden relative z-10 progress-bar-glow" style={{ width: `${profile.xp % 100}%` }}>
              <div className="absolute inset-0 diagonal-stripes opacity-20"></div>
              <span className="text-[10px] font-black tracking-tighter text-black relative z-10 uppercase italic">
                {profile.xp % 100 > 50 ? "Approaching Enlightenment" : "Ascending the Tower"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SkillBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="stat-box p-4 space-y-2 rounded-xl">
      <div className="flex justify-between items-center text-[10px] text-white/30 uppercase font-mono tracking-widest font-bold">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-2 bg-black/40 w-full rounded-full overflow-hidden border border-white/5">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${Math.min(value, 100)}%` }}>
          <div className="w-full h-full diagonal-stripes opacity-10"></div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color = "text-white" }: any) {
  return (
    <div className="stat-box p-4 space-y-1 rounded-xl">
      <div className="flex items-center gap-2 text-white/30">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase font-mono tracking-widest">{label}</span>
      </div>
      <div className={cn("text-2xl font-bold font-mono tracking-tighter drop-shadow", color)}>{value}</div>
    </div>
  );
}

function QuestPreview({ quests, setQuests }: { quests: Quest[], setQuests: React.Dispatch<React.SetStateAction<Quest[]>> }) {
  const displayQuests = quests.slice(0, 3);

  const toggleEmbark = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, status: q.status === 'In-Progress' ? 'Active' : 'In-Progress' };
      }
      return q;
    }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {displayQuests.map(quest => (
        <div key={quest.id} className={cn(
          "stat-box p-4 flex items-center justify-between group transition-all rounded-xl relative",
          (quest.status === 'Active' || quest.status === 'In-Progress') && "active-quest"
        )} style={{ '--accent-color': quest.category ? CATEGORY_COLORS[quest.category]?.replace('text-', '') : 'white' } as any}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_12px_currentColor]",
              DIFFICULTY_COLORS[quest.difficulty]
            )} />
            <div>
              <div className={cn("fantasy-title text-sm group-hover:text-white transition-colors uppercase tracking-tight", quest.category && CATEGORY_COLORS[quest.category])}>{quest.title}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">
                {quest.difficulty} / {quest.status === 'In-Progress' ? formatTime(quest.remainingSeconds) : `${quest.durationMinutes}m`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {quest.status === 'In-Progress' && <span className="text-[10px] font-mono text-white animate-pulse">EMBARKED...</span>}
            {quest.status === 'Completed' ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <button 
                onClick={() => toggleEmbark(quest.id)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  quest.status === 'In-Progress' ? "bg-white/20 text-white" : "bg-neutral-800 text-white"
                )}
              >
                <Timer className={cn("w-4 h-4", quest.status === 'In-Progress' && "animate-spin-slow")} />
              </button>
            )}
          </div>
        </div>
      ))}
      {quests.length === 0 && <div className="text-center p-8 text-white/10 text-xs uppercase tracking-[0.3em] stat-box border-dashed rounded-xl">Empty Board.</div>}
    </div>
  );
}

function QuestBoard({ profile, quests, setQuests }: { profile: UserProfile, quests: Quest[], setQuests: React.Dispatch<React.SetStateAction<Quest[]>> }) {
  const [newTitle, setNewTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Quest['difficulty']>('Medium');
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState<Quest['category']>('General');
  const [isTimed, setIsTimed] = useState(true);

  const addQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newQuest: Quest = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      difficulty,
      durationMinutes: duration,
      remainingSeconds: duration * 60,
      status: 'Active',
      createdAt: Date.now(),
      type: 'Side',
      category,
      isTimed
    };
    setQuests([newQuest, ...quests]);
    setNewTitle('');
  };

  const toggleEmbark = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, status: q.status === 'In-Progress' ? 'Active' : 'In-Progress' };
      }
      return q;
    }));
  };

  const refreshQuest = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, remainingSeconds: q.durationMinutes * 60 };
      }
      return q;
    }));
  };

  const removeTimeLimit = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, isTimed: false };
      }
      return q;
    }));
  };

  const completeQuest = (id: string) => {
    setQuests(quests.map(q => q.id === id ? { ...q, status: 'Completed' } : q));
  };

  const deleteQuest = (id: string) => {
    setQuests(quests.filter(q => q.id !== id));
  };

  const renewQuest = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        return { 
          ...q, 
          status: 'Active', 
          remainingSeconds: q.durationMinutes * 60,
          createdAt: Date.now() 
        };
      }
      return q;
    }));
  };

  const loadRoadmapQuests = async () => {
    const currentWeekNum = Math.min(Math.floor((profile.challengeDays - 1) / 7) + 1, 11);
    const currentWeek = ROADMAP_WEEKS.find(w => w.week === currentWeekNum) || ROADMAP_WEEKS[0];
    
    const newQuests: Quest[] = [
      ...currentWeek.dsa.slice(0, 2).map(task => ({
        id: Math.random().toString(36).substr(2, 9),
        title: `DSA: ${task}`,
        difficulty: 'Medium' as const,
        durationMinutes: 45,
        remainingSeconds: 45 * 60,
        status: 'Active' as const,
        createdAt: Date.now(),
        type: 'Main' as const,
        category: 'Arcane' as const
      })),
       ...currentWeek.ai_ml.slice(0, 1).map(task => ({
        id: Math.random().toString(36).substr(2, 9),
        title: `AI/ML: ${task}`,
        difficulty: 'Hard' as const,
        durationMinutes: 60,
        remainingSeconds: 60 * 60,
        status: 'Active' as const,
        createdAt: Date.now(),
        type: 'Main' as const,
        category: 'Arcane' as const
      })),
      {
        id: Math.random().toString(36).substr(2, 9),
        title: `Rehab: ${DAILY_REHAB[0]}`,
        difficulty: 'Easy' as const,
        durationMinutes: 15,
        remainingSeconds: 15 * 60,
        status: 'Active' as const,
        createdAt: Date.now(),
        type: 'Main' as const,
        category: 'Discipline' as const
      }
    ];
    setQuests([...newQuests, ...quests]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter">Quest Board</h2>
          <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">Accept contracts to forge your destiny.</p>
        </div>
        <button 
          onClick={loadRoadmapQuests}
          className="w-full md:w-auto px-6 py-2 bg-white/10 text-white border border-white/30 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 rounded-lg"
        >
          <BookOpen className="w-4 h-4" />
          Roadmap Bounties
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <form onSubmit={addQuest} className="stat-box p-6 space-y-4 rounded-2xl border-white/20">
            <div className="flex items-center justify-between">
              <h3 className="fantasy-title text-sm text-white">Add Side Quest</h3>
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-bold">Mission Name</label>
                <input 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors uppercase tracking-tight font-bold"
                  placeholder="E.G. STUDY LINKED LISTS..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-bold">Path</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-2 py-3 text-sm focus:outline-none focus:border-white transition-colors uppercase tracking-tight font-bold appearance-none text-center"
                  >
                    <option>Might</option>
                    <option>Arcane</option>
                    <option>Endurance</option>
                    <option>Discipline</option>
                    <option>General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-bold">Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as any)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-2 py-3 text-sm focus:outline-none focus:border-white transition-colors uppercase tracking-tight font-bold appearance-none text-center"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Epic</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-bold">Time (Min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-center font-mono font-bold" />
                </div>
                <div className="flex flex-col items-center gap-1">
                   <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-bold">Timed</label>
                   <input type="checkbox" checked={isTimed} onChange={e => setIsTimed(e.target.checked)} className="w-6 h-6 border-2 border-white/10 bg-black/40 rounded checked:bg-white" />
                </div>
              </div>
              <button className="w-full bg-white hover:bg-neutral-200 text-black font-black uppercase py-4 transition-all flex items-center justify-center gap-2 group shadow-xl rounded-lg">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Sign Side Contract
              </button>
            </div>
          </form>
          
          <div className="wealth-mode p-4 rounded-xl border-dashed border-opacity-30 border-white/20">
            <h4 className="fantasy-title text-xs text-white opacity-70 mb-2">Architect's Guidance</h4>
            <p className="text-[11px] text-white/40 leading-relaxed italic">"A true aristocrat optimizes the morning. Slay your epic contracts before the sun peaks."</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {quests.map(quest => {
            const formatTime = (seconds: number) => {
              const m = Math.floor(seconds / 60);
              const s = seconds % 60;
              return `${m}:${s.toString().padStart(2, '0')}`;
            };

            return (
              <motion.div 
                layout
                key={quest.id} 
                className={cn(
                  "group relative border-l-4 p-6 transition-all rounded-r-2xl stat-box",
                  quest.status === 'Completed' ? "opacity-30 grayscale" : 
                  quest.status === 'In-Progress' ? "active-quest border-white shadow-[0_0_30px_rgba(255,255,255,0.15)]" : 
                  "hover:bg-white/5",
                  quest.type === 'Side' && "border-l-neutral-500"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "fantasy-title text-xl transition-colors",
                        quest.type === 'Side' ? "text-neutral-300 group-hover:text-white" : "text-white group-hover:text-neutral-300"
                      )}>{quest.title}</span>
                      {quest.status === 'Completed' && <CheckCircle className="w-6 h-6 text-white" />}
                      {quest.status === 'In-Progress' && <Flame className="w-5 h-5 text-white animate-bounce" />}
                      {quest.type === 'Side' && <span className="text-[8px] px-2 py-0.5 bg-white/10 text-white border border-white/20 rounded-full font-black uppercase">Side Quest</span>}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                      <span className={cn(
                        "font-black tracking-tighter",
                        DIFFICULTY_COLORS[quest.difficulty]
                      )}>{quest.difficulty}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Timer className={cn("w-3 h-3", quest.status === 'In-Progress' && "animate-spin-slow")} /> 
                        {quest.isTimed === false ? "INFINITE" : (quest.status === 'In-Progress' ? formatTime(quest.remainingSeconds) : `${quest.durationMinutes}m`)}
                      </span>
                      {quest.category && (
                        <>
                          <span>•</span>
                          <span className={cn("font-bold", CATEGORY_COLORS[quest.category])}>{quest.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {quest.status === 'Active' ? (
                      <button onClick={() => toggleEmbark(quest.id)} className={cn(
                        "px-8 py-3 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all rounded-md",
                        quest.type === 'Side' ? "bg-white/10 text-white border border-white/30 hover:bg-white hover:text-black" : "bg-white/5 text-white border border-white/20 hover:bg-white hover:text-black"
                      )}>
                        Embark
                      </button>
                    ) : quest.status === 'In-Progress' ? (
                      <div className="flex items-center gap-2">
                        {quest.isTimed !== false && (
                          <>
                            <button 
                              onClick={() => refreshQuest(quest.id)} 
                              className="p-3 bg-white/5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                              title="Refresh Timer"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeTimeLimit(quest.id)} 
                              className="p-3 bg-white/5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                              title="Remove Time Limit"
                            >
                              <ZapOff className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => completeQuest(quest.id)} className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-neutral-200 transition-all rounded-md">
                          Slay Task
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                         <button 
                          onClick={() => renewQuest(quest.id)} 
                          className="p-3 bg-white/5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                          title="Renew Quest"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteQuest(quest.id)} className="p-3 bg-white/5 rounded-full text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: quest.status === 'Completed' ? '100%' : 
                             quest.status === 'In-Progress' ? (
                               quest.isTimed === false ? '100%' : `${((quest.durationMinutes * 60 - quest.remainingSeconds) / (quest.durationMinutes * 60)) * 100}%`
                             ) : '0%' 
                    }}
                    className={cn(
                      "h-full duration-500 progress-bar-glow shadow-[0_0_15px_currentColor]", 
                      quest.status === 'Completed' ? "bg-white" : (quest.category ? CATEGORY_BG[quest.category] : "bg-neutral-600")
                    )} 
                  >
                     <div className="w-full h-full diagonal-stripes opacity-20"></div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
          {quests.length === 0 && <div className="h-64 border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 gap-4"><Swords className="w-12 h-12" /><span className="text-xs uppercase tracking-[0.3em]">No contracts signed yet.</span></div>}
        </div>
      </div>
    </motion.div>
  );
}

function RoadmapView() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-8 water-flow p-4 md:p-8 rounded-none">
       <div className="text-center space-y-4 max-w-3xl mx-auto pt-6 lg:pt-0">
         <h1 className="fantasy-title text-5xl text-white tracking-tighter glitch-text">75-Day Quest Codex</h1>
         <p className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.3em] font-mono leading-relaxed">
           Transformation is not an event. It is a series of brutal, disciplined repetitions. 
           BTech 2nd Year Mastery Arc: DSA + AI/ML + Physical Ascension.
         </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {CORE_RULES.map((rule, idx) => (
           <motion.div 
             whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.8)' }}
             key={idx} 
             className="stat-box p-6 border-l-4 border-white rounded-none bg-white/5"
           >
             <span className="text-white font-mono text-[10px] font-black uppercase mb-1 block tracking-widest">Commandment {idx + 1}</span>
             <p className="text-xs font-bold leading-relaxed">{rule}</p>
           </motion.div>
         ))}
       </div>

       <div className="space-y-8">
         <div className="flex items-center gap-4">
           <HeartPulse className="w-6 h-6 text-white" />
           <h2 className="fantasy-title text-2xl glitch-text">Daily Spine Rehab & Mobility</h2>
         </div>
         <div className="flex flex-wrap gap-3">
           {DAILY_REHAB.map((ex, i) => (
             <motion.div 
               whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
               key={i} 
               className="px-6 py-3 stat-box rounded-none flex items-center gap-3 transition-all"
             >
               <div className="w-1.5 h-1.5 rounded-none bg-white" />
               <span className="text-[11px] font-black uppercase tracking-widest">{ex}</span>
             </motion.div>
           ))}
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <GraduationCap className="w-8 h-8 text-neutral-400" />
              <h2 className="fantasy-title text-3xl text-neutral-200">The Knowledge Roadmap</h2>
            </div>
            
            <div className="space-y-4 mb-8">
               <motion.div 
                 whileHover={{ skewX: -2 }}
                 className="stat-box p-6 bg-white/5 border-white/10 rounded-none"
               >
                 <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Shadow Tip: Persistent Progress</h4>
                 <p className="text-[10px] text-white/40 leading-relaxed uppercase font-mono">
                   Your progress is automatically saved to your browser. To back up your journey or share your code:
                   <br/><br/>
                   1. Open <b>Settings</b> in the AI Studio sidebar.
                   <br/>
                   2. Click <b>'Export to GitHub'</b> or <b>'Download ZIP'</b>.
                   <br/>
                   3. Push your projects to GitHub to complete the "Shadow Monarch" legacy.
                 </p>
               </motion.div>
            </div>

            <div className="space-y-8">
              {ROADMAP_WEEKS.map((week, idx) => (
                <div key={week.week} className="relative pl-6 md:pl-8 border-l border-white/10 group">
                  <div className={cn(
                    "absolute top-0 -left-[5px] w-[9px] h-[9px] rounded-none shadow-[0_0_15px_currentColor] group-hover:scale-125 transition-transform",
                    idx % 3 === 0 ? "bg-cyan-500 text-cyan-500" : idx % 3 === 1 ? "bg-fuchsia-500 text-fuchsia-500" : "bg-orange-500 text-orange-500"
                  )} />
                  <div className="space-y-2">
                    <span className={cn(
                      "text-[9px] md:text-[10px] font-mono uppercase tracking-[0.3em] font-black",
                      idx % 3 === 0 ? "text-cyan-400" : idx % 3 === 1 ? "text-fuchsia-400" : "text-orange-400"
                    )}>Week {week.week}: {week.title}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.4)' }} className="stat-box p-4 rounded-none border-cyan-500/10">
                        <span className="text-[9px] text-cyan-400/50 uppercase font-bold tracking-widest mb-2 block">DSA Path</span>
                        <ul className="text-[11px] space-y-1">
                          {week.dsa.map((item, i) => <li key={i} className="flex items-center gap-2">
                            <Sword className="w-2.5 h-2.5 text-cyan-500/50" /> {item}
                          </li>)}
                        </ul>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02, borderColor: 'rgba(217, 70, 239, 0.4)' }} className="stat-box p-4 rounded-none border-fuchsia-500/10">
                        <span className="text-[9px] text-fuchsia-400/50 uppercase font-bold tracking-widest mb-2 block">AI/ML Path</span>
                        <ul className="text-[11px] space-y-1">
                          {week.ai_ml.map((item, i) => <li key={i} className="flex items-center gap-2">
                            <Zap className="w-2.5 h-2.5 text-fuchsia-500/50" /> {item}
                          </li>)}
                        </ul>
                      </motion.div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <HeartPulse className="w-8 h-8 text-neutral-400" />
              <h2 className="fantasy-title text-3xl">The Physique Forge</h2>
            </div>
            <div className="stat-box p-8 rounded-none space-y-8 bg-black/40 border-white/10">
               <div className="space-y-2">
                 <h4 className="fantasy-title text-lg text-white">V-Taper Blueprint</h4>
                 <p className="text-[11px] text-white/40 leading-relaxed uppercase tracking-widest font-mono">Focus on Lateral Raises, Lat Pulldowns, and Core. Avoid Spinal Compression.</p>
               </div>

               <div className="space-y-6">
                  {[
                    { day: 'Mon/Thu', muscle: 'Push (Shoulders/Triceps)', tools: 'Lateral Raises, DB Press, Pushdowns' },
                    { day: 'Tue/Fri', muscle: 'Pull (Back/Biceps)', tools: 'Resistance Band Rows, Dead Hangs, Curls' },
                    { day: 'Wed', muscle: 'Core & Rehab', tools: 'McGill Curl-up, Side Planks, Glute Bridges' },
                    { day: 'Sat', muscle: 'Light Full Body', tools: 'Mobility & Active Recovery' }
                  ].map((split, i) => (
                    <motion.div 
                      whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.02)' }}
                      key={i} 
                      className="flex items-start gap-6 border-b border-white/5 pb-6 last:border-0 last:pb-0 p-2 transition-all cursor-default"
                    >
                      <div className="w-20 text-[10px] font-black uppercase text-white/50 pt-1 tracking-widest">{split.day}</div>
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-sm tracking-tight text-white">{split.muscle}</div>
                        <div className="text-[10px] text-white/30 uppercase font-mono tracking-widest">{split.tools}</div>
                      </div>
                    </motion.div>
                  ))}
               </div>

             <div className="p-6 bg-white/5 border border-white/10 rounded-none space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-2">
                    <XCircle className="w-3 h-3" /> SPINE PROTECTION PROTOCOL
                  </h5>
                  <p className="text-[11px] text-white/40 italic">
                    Because of cervical + lower back condition: No heavy squats/deadlifts. No ego lifting. Every 60 min of sitting, walk for 2 mins.
                  </p>
               </div>
            </div>
          </div>
       </div>
    </motion.div>
  );
}

function ProgressView({ quests, profile }: { quests: Quest[], profile: UserProfile }) {
  const categories = ['Might', 'Arcane', 'Endurance', 'Discipline', 'General'];
  
  const categoryStats = categories.map(cat => ({
    name: cat,
    completed: quests.filter(q => q.category === cat && q.status === 'Completed').length,
    active: quests.filter(q => q.category === cat && q.status !== 'Completed').length,
    xp: quests.filter(q => q.category === cat && q.status === 'Completed').length * 10 
  }));

  const pieData = categoryStats.map(stat => ({
    name: stat.name,
    value: stat.completed
  })).filter(d => d.value > 0);

  const COLORS = ['#F97316', '#22D3EE', '#34D399', '#D946EF', '#818CF8'];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 pb-8 water-flow p-4 md:p-8 rounded-none min-h-[80vh]">
      <div className="text-center space-y-4 max-w-2x mx-auto pt-6 lg:pt-0">
        <h1 className="fantasy-title text-2xl md:text-5xl tracking-tighter text-white glitch-text">Evolution Analytics</h1>
        <p className="text-white/40 text-[8px] md:text-[10px] font-mono uppercase tracking-[0.4em]">Visualizing the transmutation of self.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="stat-box p-6 md:p-8 rounded-none space-y-6 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all overflow-hidden">
          <h3 className="fantasy-title text-base md:text-xl text-white border-b border-white/10 pb-4 glitch-text text-center lg:text-left">Distribution</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {pieData.length === 0 && <Cell key="empty" fill="#262626" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px', textTransform: 'uppercase' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {categoryStats.map((stat, i) => (
              <motion.div whileHover={{ scale: 1.1 }} key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-none" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[8px] md:text-[10px] font-mono font-bold text-white/60 tracking-wider uppercase">{stat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="stat-box p-6 md:p-8 rounded-none space-y-6 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all">
          <h3 className="fantasy-title text-base md:text-xl text-white border-b border-white/10 pb-4 glitch-text text-center lg:text-left">Mastery Arc</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <XAxis dataKey="name" stroke="#555" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }}
                />
                <Bar dataKey="completed" name="Completed" fill="#FFFFFF" radius={[0, 0, 0, 0]} />
                <Bar dataKey="active" name="In Progress" fill="#262626" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[8px] md:text-[10px] text-white/30 font-mono text-center uppercase tracking-widest italic">
            "Numbers do not lie."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categoryStats.map((stat, i) => (
          <motion.div 
            whileHover={{ y: -5, boxShadow: `0 20px 40px ${COLORS[i % COLORS.length]}33` }}
            key={i} 
            className="stat-box p-4 md:p-6 rounded-none space-y-4"
          >
             <div className="flex justify-between items-center">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", CATEGORY_COLORS[stat.name])}>{stat.name} Mastery</span>
                <span className="text-[8px] font-mono text-white/40">{stat.completed} / {stat.completed + stat.active}</span>
             </div>
             <div className="h-1.5 md:h-2 bg-black rounded-none overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.completed / Math.max(1, stat.completed + stat.active)) * 100}%` }}
                  className={cn("h-full progress-bar-glow", CATEGORY_BG[stat.name])}
                  style={{ boxShadow: `0 0 15px ${COLORS[i % COLORS.length]}` }}
                />
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function Leaderboard() {
  const mockLegends = [
    { name: 'The Architect', level: 99, xp: 99420, class: 'Zen Warrior' },
    { name: 'Monochrome Shadow', level: 82, xp: 82100, class: 'Flow Master' },
    { name: 'Void Hunter', level: 75, xp: 75050, class: 'Code Wraith' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-8">
      <div className="text-center space-y-4 pt-6 md:pt-0">
        <h2 className="fantasy-title text-3xl md:text-5xl text-white glitch-text">Hall of Legends</h2>
        <p className="text-white/40 text-[9px] md:text-xs font-mono uppercase tracking-[0.4em]">The elite who mastered the flow.</p>
      </div>
      <div className="max-w-3xl mx-auto stat-box rounded-none overflow-hidden shadow-2xl">
        <div className="grid grid-cols-4 p-4 border-b-2 border-white/10 text-[8px] md:text-[10px] uppercase font-black font-mono tracking-widest text-white/60 bg-white/5">
           <div className="col-span-2">Adventurer</div>
           <div className="text-right">Level</div>
           <div className="text-right">Total XP</div>
        </div>
        <div className="divide-y divide-white/5 bg-black/20">
          {mockLegends.map((entry, idx) => (
            <motion.div 
              whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.05)' }} 
              key={idx} 
              className="grid grid-cols-4 p-4 md:p-8 border-b border-white/5 transition-all items-center group font-mono cursor-default last:border-0"
            >
               <div className="col-span-2 flex items-center gap-3 md:gap-6">
                 <span className="font-mono text-white/20 w-4 md:w-6 text-[10px] md:text-sm">{idx + 1}</span>
                 <motion.img 
                   whileHover={{ rotate: 5, scale: 1.2 }}
                   src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.name}&backgroundColor=000000`} 
                   alt="avatar" 
                   className="w-8 h-8 md:w-12 md:h-12 bg-white/5 border-2 border-white/10 rounded-none group-hover:border-white transition-all shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
                 />
                 <span className={cn("fantasy-title text-sm md:text-lg tracking-tight glitch-text", idx === 0 ? "text-white" : "text-white/60")}>{entry.name}</span>
               </div>
               <div className="text-right text-[10px] md:text-sm font-bold text-neutral-400">{entry.level}</div>
               <div className="text-right text-white font-bold text-sm md:text-lg">{entry.xp}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

