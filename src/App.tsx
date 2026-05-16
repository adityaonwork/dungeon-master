import React, { useState, useEffect } from 'react';
import { Shield, Sword, Coins, Trophy, User, LogIn, Swords, Scroll, Timer, CheckCircle, XCircle, Plus, LayoutDashboard, ListOrdered, Flame, Zap, Sparkles, BookOpen, HeartPulse, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quests' | 'leaderboard' | 'roadmap'>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setQuests(prev => prev.map(q => {
        if (q.status === 'In-Progress' && q.remainingSeconds > 0) {
          return { ...q, remainingSeconds: q.remainingSeconds - 1 };
        }
        if (q.status === 'In-Progress' && q.remainingSeconds === 0) {
          // Auto-fail or notify? Let's just stop it
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

  if (!isInitialized) return <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center text-amber-500 font-fantasy tracking-widest uppercase">INITIALIZING DUNGEON...</div>;

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#e2e8f0] flex flex-col font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      {/* Header / HUD */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <Shield className="w-6 h-6 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
              <span className="fantasy-title text-xl group-hover:text-amber-500 transition-colors">DUNGEON QUEST</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'HUB' },
                { id: 'quests', icon: Scroll, label: 'QUESTS' },
                { id: 'roadmap', icon: BookOpen, label: 'ROADMAP' },
                { id: 'leaderboard', icon: Trophy, label: 'SQUAD' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/5 rounded-none border-b-2 border-transparent",
                    activeTab === tab.id && "border-amber-500 text-amber-500 bg-amber-500/5"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-orange-500" /> Day {profile.challengeDays} Streak
              </span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">{profile.gold} GOLD</span>
            </div>
            <div className="w-10 h-10 border-2 border-amber-500/30 overflow-hidden bg-white/5 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.displayName}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

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
              quests={quests} 
              setQuests={setQuests} 
            />
          )}
          {activeTab === 'roadmap' && <RoadmapView />}
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
              <div className="stat-box p-12 text-center space-y-6 rounded-3xl border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                <Sparkles className="w-24 h-24 text-amber-500 mx-auto animate-bounce" />
                <h2 className="fantasy-title text-6xl text-amber-500">LEVEL UP!</h2>
                <p className="text-2xl font-bold font-mono tracking-tighter">You have reached Level {profile.level}</p>
                <p className="text-white/40 uppercase tracking-[0.3em] text-xs">Your legend grows in the shadows.</p>
                <button className="px-12 py-4 bg-amber-600 text-black font-black uppercase tracking-widest hover:bg-amber-500 transition-all rounded-xl shadow-2xl">
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
          }} className="hover:text-red-500 transition-colors">RESET ADVENTURE</button>
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
        <div className="relative group stat-box rounded-xl">
           <div className="p-4 border-b border-white/5 bg-white/5">
             <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">Week {currentWeekNum}: {currentWeek.title}</span>
           </div>
          <div className="aspect-[3/4] bg-white/5 relative overflow-hidden rounded-b-xl">
             <img 
               src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.displayName}&size=200`} 
               alt="char" 
               className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
             <div className="absolute bottom-6 left-6 right-6">
               <h2 className="fantasy-title text-2xl text-amber-500 drop-shadow-lg">{profile.displayName}</h2>
               <p className="text-white/40 text-[10px] font-mono tracking-[0.2em] font-bold">Lvl {profile.level} {profile.charClass}</p>
             </div>
          </div>
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/50" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500/50" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <SkillBar label="Might" value={profile.stats.str} color="bg-amber-600" />
          <SkillBar label="Arcane" value={profile.stats.int} color="bg-blue-600" />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-9 space-y-8">
        <div className="wealth-mode p-8 space-y-6 relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Shield className="w-48 h-48" />
          </div>
          
          <div className="space-y-4">
            <h3 className="fantasy-title text-3xl text-amber-200">Current Phase: {currentWeek.title}</h3>
            <p className="text-amber-100/40 text-[10px] font-mono tracking-widest uppercase">75-Day Zero-to-Hero Challenge</p>
            <div className="flex flex-wrap gap-2 pt-2">
               {currentWeek.dsa.slice(0, 3).map((tag, i) => (
                 <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest rounded-full">{tag}</span>
               ))}
               {currentWeek.ai_ml.slice(0, 2).map((tag, i) => (
                 <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest rounded-full">{tag}</span>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox icon={Scroll} label="Quests Cleared" value={`${completedCount}/${activeCount + completedCount}`} />
            <StatBox icon={Coins} label="Gold Stash" value={profile.gold.toString()} color="text-amber-400" />
            <StatBox icon={Flame} label="Daily Streak" value={profile.challengeDays.toString()} color="text-orange-500" />
          </div>

          {!verdict ? (
            <button 
              onClick={runComparison}
              disabled={comparing || quests.length === 0}
              className={cn(
                "w-full h-24 border-2 border-dashed border-white/10 rounded-xl transition-all group flex flex-col items-center justify-center gap-2",
                quests.length > 0 ? "hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer shadow-xl" : "opacity-30 cursor-not-allowed"
              )}
            >
              {comparing ? (
                <span className="text-amber-500 animate-pulse font-mono uppercase tracking-[0.4em] text-xs">Consulting the Throne...</span>
              ) : (
                <>
                  <Scroll className="w-8 h-8 text-white/20 group-hover:text-amber-500 transition-colors" />
                  <span className="fantasy-title text-xs group-hover:text-amber-500">
                    {quests.length === 0 ? "Bounties Required" : "Submit Report"}
                  </span>
                </>
              )}
            </button>
          ) : (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-amber-500/5 border-2 border-amber-500/20 p-6 space-y-4 rounded-xl shadow-2xl card-3d"
            >
              <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                <span className="fantasy-title text-xs text-amber-500">The Mentor's Counsel</span>
                <div className="flex items-center gap-2">
                   <button onClick={() => setVerdict(null)} className="text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors">Dismiss</button>
                   <span className="px-4 py-1 bg-amber-500 text-black text-[10px] font-black uppercase tracking-tighter shadow-lg">Rank {verdict.rank}</span>
                </div>
              </div>
              <p className="text-sm italic text-amber-100/90 leading-relaxed font-serif">"{verdict.verdict}"</p>
              <div className="flex gap-6 text-[10px] font-mono uppercase tracking-widest border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400">+{verdict.xpAwarded} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400">+{verdict.goldAwarded} GOLD</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between border-b border-white/5 pb-2">
             <h4 className="fantasy-title text-sm opacity-50">Active Contracts</h4>
             <button onClick={() => setActiveTab('quests')} className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-bold hover:underline transition-all">Visit the Board</button>
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
                    isUnlocked ? "border-amber-500/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "opacity-30 grayscale"
                  )}>
                    <span className="text-3xl mb-1">{ach.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{ach.name}</span>
                    <span className="text-[8px] text-white/40 leading-tight">{ach.description}</span>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="h-32 stat-box rounded-xl p-6 flex flex-col justify-between border-dashed border-white/20">
          <div className="flex justify-between items-center">
            <span className="fantasy-title text-xs opacity-70">Mastery Progress</span>
            <span className="mono text-xs text-blue-400">{profile.xp % 100} / 100 XP</span>
          </div>
          <div className="w-full h-8 bg-black/40 rounded border border-white/10 p-1 relative overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center px-4 overflow-hidden relative z-10 progress-bar-glow" style={{ width: `${profile.xp % 100}%` }}>
              <div className="absolute inset-0 diagonal-stripes opacity-20"></div>
              <span className="text-[10px] font-black tracking-tighter text-white relative z-10 uppercase italic">
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
          "stat-box p-4 flex items-center justify-between group hover:bg-white/[0.08] transition-all rounded-xl",
          (quest.status === 'Active' || quest.status === 'In-Progress') && "active-quest"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
              quest.difficulty === 'Easy' && "text-green-500 bg-green-500",
              quest.difficulty === 'Medium' && "text-blue-500 bg-blue-500",
              quest.difficulty === 'Hard' && "text-red-500 bg-red-500",
              quest.difficulty === 'Epic' && "text-purple-500 bg-purple-500"
            )} />
            <div>
              <div className="fantasy-title text-sm group-hover:text-amber-500 transition-colors uppercase tracking-tight">{quest.title}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">
                {quest.difficulty} / {quest.status === 'In-Progress' ? formatTime(quest.remainingSeconds) : `${quest.durationMinutes}m`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {quest.status === 'In-Progress' && <span className="text-[10px] font-mono text-amber-500 animate-pulse">EMBARKED...</span>}
            {quest.status === 'Completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <button 
                onClick={() => toggleEmbark(quest.id)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  quest.status === 'In-Progress' ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
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

function QuestBoard({ quests, setQuests }: { quests: Quest[], setQuests: React.Dispatch<React.SetStateAction<Quest[]>> }) {
  const [newTitle, setNewTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Quest['difficulty']>('Medium');
  const [duration, setDuration] = useState(30);

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
      createdAt: Date.now()
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

  const completeQuest = (id: string) => {
    setQuests(quests.map(q => q.id === id ? { ...q, status: 'Completed' } : q));
  };

  const deleteQuest = (id: string) => {
    setQuests(quests.filter(q => q.id !== id));
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
        createdAt: Date.now()
      })),
       ...currentWeek.ai_ml.slice(0, 1).map(task => ({
        id: Math.random().toString(36).substr(2, 9),
        title: `AI/ML: ${task}`,
        difficulty: 'Hard' as const,
        durationMinutes: 60,
        remainingSeconds: 60 * 60,
        status: 'Active' as const,
        createdAt: Date.now()
      })),
      {
        id: Math.random().toString(36).substr(2, 9),
        title: `Rehab: ${DAILY_REHAB[0]}`,
        difficulty: 'Easy' as const,
        durationMinutes: 15,
        remainingSeconds: 15 * 60,
        status: 'Active' as const,
        createdAt: Date.now()
      }
    ];
    setQuests([...newQuests, ...quests]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold uppercase tracking-tighter">Quest Board</h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono">Accept contracts to forge your destiny.</p>
        </div>
        <button 
          onClick={loadRoadmapQuests}
          className="px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 rounded-lg"
        >
          <BookOpen className="w-4 h-4" />
          Import from Roadmap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <form onSubmit={addQuest} className="stat-box p-6 space-y-4 rounded-2xl">
            <h3 className="fantasy-title text-sm text-amber-500">Post New Bounty</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-bold">Mission Name</label>
                <input 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors uppercase tracking-tight font-bold"
                  placeholder="E.G. CLEAR THE GYM..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-bold">Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as any)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-2 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors uppercase tracking-tight font-bold appearance-none text-center"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Epic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono font-bold">Time (Min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full bg-black/40 border-2 border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors text-center font-mono font-bold" />
                </div>
              </div>
              <button className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black uppercase py-4 transition-all flex items-center justify-center gap-2 group shadow-xl rounded-lg">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Forge Contract
              </button>
            </div>
          </form>
          
          <div className="wealth-mode p-4 rounded-xl border-dashed border-opacity-30">
            <h4 className="fantasy-title text-xs text-amber-500/70 mb-2">Architect's Guidance</h4>
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
                  quest.status === 'In-Progress' ? "active-quest animate-pulse border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]" : 
                  "active-quest hover:bg-white/5"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="fantasy-title text-xl text-amber-100 group-hover:text-amber-500 transition-colors">{quest.title}</span>
                      {quest.status === 'Completed' && <CheckCircle className="w-6 h-6 text-green-500" />}
                      {quest.status === 'In-Progress' && <Flame className="w-5 h-5 text-amber-500 animate-bounce" />}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                      <span className={cn(
                        "font-black tracking-tighter",
                        quest.difficulty === 'Easy' && "text-green-500",
                        quest.difficulty === 'Medium' && "text-blue-500",
                        quest.difficulty === 'Hard' && "text-red-500",
                        quest.difficulty === 'Epic' && "text-purple-500"
                      )}>{quest.difficulty}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Timer className={cn("w-3 h-3", quest.status === 'In-Progress' && "animate-spin-slow")} /> 
                        {quest.status === 'In-Progress' ? formatTime(quest.remainingSeconds) : `${quest.durationMinutes}m`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {quest.status === 'Active' ? (
                      <button onClick={() => toggleEmbark(quest.id)} className="px-8 py-3 bg-amber-600/20 text-amber-500 border border-amber-500/50 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black shadow-xl transition-all rounded-md">
                        Embark
                      </button>
                    ) : quest.status === 'In-Progress' ? (
                      <button onClick={() => completeQuest(quest.id)} className="px-8 py-3 bg-amber-600 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all rounded-md">
                        Slay Task
                      </button>
                    ) : (
                      <button onClick={() => deleteQuest(quest.id)} className="p-3 bg-white/5 rounded-full text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-6 h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: quest.status === 'Completed' ? '100%' : quest.status === 'In-Progress' ? `${((quest.durationMinutes * 60 - quest.remainingSeconds) / (quest.durationMinutes * 60)) * 100}%` : '0%' }}
                    className={cn("h-full duration-500 progress-bar-glow", quest.status === 'Completed' ? "bg-green-500" : "bg-amber-500")} 
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-24">
       <div className="text-center space-y-4 max-w-3xl mx-auto">
         <h1 className="fantasy-title text-5xl text-amber-500 tracking-tighter">75-Day Quest Codex</h1>
         <p className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.3em] font-mono leading-relaxed">
           Transformation is not an event. It is a series of brutal, disciplined repetitions. 
           BTech 2nd Year Mastery Arc: DSA + AI/ML + Physical Ascension.
         </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {CORE_RULES.map((rule, idx) => (
           <div key={idx} className="stat-box p-6 border-l-4 border-amber-500 rounded-r-xl bg-amber-500/5">
             <span className="text-amber-500 font-mono text-[10px] font-black uppercase mb-1 block tracking-widest">Commandment {idx + 1}</span>
             <p className="text-xs font-bold leading-relaxed">{rule}</p>
           </div>
         ))}
       </div>

       <div className="space-y-8">
         <div className="flex items-center gap-4">
           <HeartPulse className="w-6 h-6 text-red-500" />
           <h2 className="fantasy-title text-2xl">Daily Spine Rehab & Mobility</h2>
         </div>
         <div className="flex flex-wrap gap-3">
           {DAILY_REHAB.map((ex, i) => (
             <div key={i} className="px-6 py-3 stat-box rounded-lg flex items-center gap-3 hover:bg-white/5 transition-all">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
               <span className="text-[11px] font-black uppercase tracking-widest">{ex}</span>
             </div>
           ))}
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <GraduationCap className="w-8 h-8 text-blue-500" />
              <h2 className="fantasy-title text-3xl">The Knowledge Roadmap</h2>
            </div>
            
            <div className="space-y-8">
              {ROADMAP_WEEKS.map((week) => (
                <div key={week.week} className="relative pl-8 border-l border-white/10 group">
                  <div className="absolute top-0 -left-[5px] w-[9px] h-[9px] rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform" />
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] font-black">Week {week.week}: {week.title}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="stat-box p-4 rounded-xl">
                        <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">DSA Path</span>
                        <ul className="text-[11px] space-y-1">
                          {week.dsa.map((item, i) => <li key={i} className="flex items-center gap-2">
                            <Sword className="w-2.5 h-2.5 text-amber-500/50" /> {item}
                          </li>)}
                        </ul>
                      </div>
                      <div className="stat-box p-4 rounded-xl">
                        <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">AI/ML Path</span>
                        <ul className="text-[11px] space-y-1">
                          {week.ai_ml.map((item, i) => <li key={i} className="flex items-center gap-2">
                            <Zap className="w-2.5 h-2.5 text-purple-500/50" /> {item}
                          </li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <HeartPulse className="w-8 h-8 text-red-500" />
              <h2 className="fantasy-title text-3xl">The Physique Forge</h2>
            </div>
            <div className="stat-box p-8 rounded-3xl space-y-8 bg-black/40">
               <div className="space-y-2">
                 <h4 className="fantasy-title text-lg text-amber-500">V-Taper Blueprint</h4>
                 <p className="text-[11px] text-white/40 leading-relaxed uppercase tracking-widest font-mono">Focus on Lateral Raises, Lat Pulldowns, and Core. Avoid Spinal Compression.</p>
               </div>

               <div className="space-y-6">
                  {[
                    { day: 'Mon/Thu', muscle: 'Push (Shoulders/Triceps)', tools: 'Lateral Raises, DB Press, Pushdowns' },
                    { day: 'Tue/Fri', muscle: 'Pull (Back/Biceps)', tools: 'Resistance Band Rows, Dead Hangs, Curls' },
                    { day: 'Wed', muscle: 'Core & Rehab', tools: 'McGill Curl-up, Side Planks, Glute Bridges' },
                    { day: 'Sat', muscle: 'Light Full Body', tools: 'Mobility & Active Recovery' }
                  ].map((split, i) => (
                    <div key={i} className="flex items-start gap-6 border-b border-white/5 pb-6 last:border-0 last:pb-0">
                      <div className="w-20 text-[10px] font-black uppercase text-amber-500/70 pt-1 tracking-widest">{split.day}</div>
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-sm tracking-tight">{split.muscle}</div>
                        <div className="text-[10px] text-white/30 uppercase font-mono tracking-widest">{split.tools}</div>
                      </div>
                    </div>
                  ))}
               </div>

               <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-red-500 flex items-center gap-2">
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

function Leaderboard() {
  const mockLegends = [
    { name: 'The Architect', level: 99, xp: 99420, class: 'Mage' },
    { name: 'Sir Grinds-a-lot', level: 82, xp: 82100, class: 'Paladin' },
    { name: 'Night Ninja', level: 75, xp: 75050, class: 'Rogue' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="fantasy-title text-5xl text-amber-500">Hall of Legends</h2>
        <p className="text-white/40 text-xs font-mono uppercase tracking-[0.4em]">The elite who mastered the local domain.</p>
      </div>
      <div className="max-w-3xl mx-auto stat-box rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-4 p-4 border-b-2 border-white/10 text-[10px] uppercase font-black font-mono tracking-widest text-[#d4af37]/60 bg-white/5">
           <div className="col-span-2">Adventurer</div>
           <div className="text-right">Level</div>
           <div className="text-right">Total XP</div>
        </div>
        <div className="divide-y divide-white/5 bg-black/20">
          {mockLegends.map((entry, idx) => (
            <div key={idx} className="grid grid-cols-4 p-8 hover:bg-amber-500/5 transition-all items-center group">
               <div className="col-span-2 flex items-center gap-6">
                 <span className="font-mono text-[#d4af37]/40 w-6 text-sm">{idx + 1}</span>
                 <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.name}`} alt="avatar" className="w-12 h-12 bg-white/5 border-2 border-white/10 rounded-lg group-hover:scale-110 transition-transform" />
                 <span className={cn("fantasy-title text-lg tracking-tight", idx === 0 ? "text-amber-400" : "text-white/80")}>{entry.name}</span>
               </div>
               <div className="text-right font-mono text-sm font-bold">{entry.level}</div>
               <div className="text-right font-mono text-amber-500 font-bold text-lg">{entry.xp}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

