import React, { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Sliders, 
  Trash2, 
  Save, 
  Award, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCcw,
  Plus
} from 'lucide-react';
import { UserProfile, Task } from '../types';
import { db } from '../lib/db';

interface UserProfileViewProps {
  currentUser: UserProfile;
  tasks: Task[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetDatabase: () => void;
}

export default function UserProfileView({ currentUser, tasks, onUpdateProfile, onResetDatabase }: UserProfileViewProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [dailyWorkloadLimitHours, setDailyWorkloadLimitHours] = useState(currentUser.dailyWorkloadLimitHours || 6);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalHoursSpent = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.estimatedEffortHours, 0);

    return {
      total,
      completed,
      pct,
      totalHoursSpent
    };
  }, [tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName,
      dailyWorkloadLimitHours: Number(dailyWorkloadLimitHours),
      avatarUrl
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all configurations back to the initial prototype seed data? Any new entries will be cleared.")) {
      onResetDatabase();
      alert("Database reset executed. Reloaded default assignments.");
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 select-none font-sans max-w-4xl mx-auto text-zinc-900">
      
      <div className="space-y-1 pb-4 border-b border-zinc-200">
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2 font-sans uppercase">
          <User className="w-7 h-7 text-zinc-900" />
          <span>User Profile & Workload Limits</span>
        </h2>
        <p className="text-xs text-zinc-500">Configure focus limits, modify metadata credentials, and debug local database parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Stats Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_rgba(9,9,11,1)] transition-all text-center space-y-4">
            <div className="relative inline-block">
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                alt={currentUser.displayName} 
                className="w-24 h-24 rounded-none mx-auto border-2 border-zinc-950 shadow-sm object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-zinc-950 rounded-none border border-zinc-800 flex items-center justify-center text-[10px] text-white">
                <ShieldCheck className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-zinc-900 text-lg leading-tight uppercase font-mono tracking-tight">{currentUser.displayName}</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{currentUser.email}</p>
            </div>

            <div className="border-t border-zinc-150 pt-4 flex items-center justify-center gap-2 text-xs text-zinc-450 font-mono">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>Registered: {currentUser.joinedAt}</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-zinc-950 text-white p-5 rounded-lg border border-zinc-850 hover:shadow-[3px_3px_0px_rgba(9,9,11,1)] transition-all space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 font-mono">Workspace Statistics</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-zinc-550 font-mono">Assigned Goals</span>
                <p className="text-xl font-bold font-mono tracking-tight text-white">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-zinc-550 font-mono">Completed</span>
                <p className="text-xl font-bold font-mono tracking-tight text-white">{stats.completed}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-zinc-550 font-mono">Success Pct</span>
                <p className="text-xl font-bold font-mono tracking-tight text-emerald-400">{stats.pct}%</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-zinc-550 font-mono">Hours Logged</span>
                <p className="text-xl font-bold font-mono tracking-tight text-zinc-300">{stats.totalHoursSpent} hrs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration settings form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 p-6 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_rgba(9,9,11,1)] transition-all space-y-5" id="profile-settings-form">
            <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4 text-zinc-950" />
              <span>Workspace Configurations</span>
            </h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="edit-profile-name">
                Display User Name
              </label>
              <input
                id="edit-profile-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold transition-all outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="edit-avatar">
                Avatar Image URL (Optional)
              </label>
              <input
                id="edit-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold transition-all outline-none font-mono placeholder-zinc-450"
                placeholder="https://images.unsplash..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono" htmlFor="edit-workload-limit">
                  Daily Focus Workload limit
                </label>
                <span className="text-xs font-mono font-bold text-zinc-955 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-sm">{dailyWorkloadLimitHours} hrs/day limit</span>
              </div>
              <input
                id="edit-workload-limit"
                type="range"
                min="2"
                max="12"
                step="1"
                value={dailyWorkloadLimitHours}
                onChange={(e) => setDailyWorkloadLimitHours(Number(e.target.value))}
                className="w-full h-2 bg-zinc-100 rounded-lg cursor-pointer accent-zinc-950"
              />
              <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed font-mono">This limit represents the maximum focus blocks you want Scheduled per day. The AI Planner respects this limits dynamically when grouping tasks.</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-zinc-150">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-rose-600 hover:bg-rose-50 text-rose-600 font-bold font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
                id="reset-db-btn"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Demo Database</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-md shadow-[2px_2px_0px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="save-profile-btn"
              >
                <Save className="w-4 h-4" />
                <span>Save Key Configurations</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 flex gap-2 items-center text-xs text-emerald-800 font-mono rounded">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Preferences validated and updated locally.</span>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
