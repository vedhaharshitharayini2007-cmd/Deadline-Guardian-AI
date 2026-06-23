import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  PlusCircle, 
  BrainCircuit, 
  BarChart3, 
  User, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavigationProps {
  currentUser: UserProfile;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Navigation({ currentUser, currentTab, setCurrentTab, onLogout }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-task', label: 'Add Task', icon: PlusCircle },
    { id: 'ai-planner', label: 'AI Planner', icon: BrainCircuit, sparkle: true },
    { id: 'progress', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-zinc-200 h-screen sticky top-0 shrink-0 shadow-[2px_0px_0px_rgba(9,9,11,0.01)]">
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center text-white border border-zinc-800 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
            <Shield className="w-5 h-5 stroke-[2]" id="logo-icon" />
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-zinc-950 tracking-tight text-base leading-none">Deadline Guardian</h1>
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 font-mono">Vibe2Ship AI</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-all group border ${
                  isActive 
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]' 
                    : 'bg-transparent text-zinc-600 border-transparent hover:bg-zinc-50 hover:text-zinc-950'
                }`}
                id={`nav-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.sparkle && (
                  <Sparkles className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-amber-400 fill-amber-300 animate-pulse' : 'text-zinc-400 group-hover:text-amber-500'}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/50">
          <div className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-200 bg-white">
            <img 
              src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
              alt={currentUser.displayName} 
              className="w-9 h-9 rounded-md border border-zinc-200 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate leading-none mb-1">
                {currentUser.displayName}
              </p>
              <p className="text-[10px] font-mono text-zinc-500 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 transition-all cursor-pointer shadow-sm hover:border-zinc-300"
            id="nav-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 sticky top-0 z-40 w-full shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-zinc-950 flex items-center justify-center text-white border border-zinc-800">
            <Shield className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-zinc-950 tracking-tight text-sm leading-none">Deadline Guardian</h1>
          </div>
        </div>

        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -mr-2 text-zinc-750 hover:text-zinc-950 rounded-lg focus:outline-none cursor-pointer"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-zinc-250 shadow-xl p-4 flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                    isActive 
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' 
                      : 'bg-transparent text-zinc-600 border-transparent hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.sparkle && (
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 fill-zinc-200" />
                  )}
                </button>
              );
            })}
            <div className="border-t border-zinc-200 pt-3 mt-1 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                  alt={currentUser.displayName} 
                  className="w-8 h-8 rounded-md border border-zinc-200 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-900 leading-none mb-0.5">{currentUser.displayName}</p>
                  <p className="text-[10px] font-mono text-zinc-500">{currentUser.email}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-1 text-xs font-bold text-zinc-700 hover:text-zinc-950 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
