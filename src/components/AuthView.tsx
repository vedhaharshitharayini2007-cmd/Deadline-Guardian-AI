import React, { useState } from 'react';
import { Shield, Sparkles, AlertCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../lib/db';

interface AuthViewProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo-user-123@vibe2ship.org');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('Alex Guardian');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Dynamic Artificial Timeout to mimic server token exchange
    setTimeout(() => {
      try {
        if (!email || !password) {
          throw new Error("Please complete all requested setup fields.");
        }
        if (!isLogin && !name) {
          throw new Error("Display Name is required to formulate workspace settings.");
        }

        let user: UserProfile;
        if (isLogin) {
          user = db.login(email, password);
        } else {
          user = db.register(email, name);
        }
        
        onAuthSuccess(user);
      } catch (err: any) {
        setError(err.message || "Credential verification has failed.");
      } finally {
        setLoading(false);
      }
    }, 850);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const demoUser = db.login('developer@vibe2ship.org', 'password');
      onAuthSuccess(demoUser);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-none bg-zinc-950 flex items-center justify-center text-white border border-zinc-800 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
            <Shield className="w-6 h-6 stroke-[2]" id="auth-shield-logo" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-black text-zinc-950 tracking-tight uppercase">
          {isLogin ? "Welcome to Deadline Guardian" : "Register Guardian Account"}
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Proactive AI planning companion built for the <span className="text-zinc-950 font-black font-mono">Vibe2Ship Hackathon</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-10 px-8 border border-zinc-200 rounded-lg shadow-sm hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all">
          
          <div className="mb-6 p-4 rounded bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs flex gap-3 items-start font-mono shadow-inner">
            <Sparkles className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold uppercase text-[9px] tracking-wider text-zinc-950 mb-0.5">Firebase Sandbox Active</p>
              <p className="leading-relaxed text-[11px] text-zinc-500">Local Firebase adapter active. Safe sandbox allows continuous review without live cloud provisioning.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} id="auth-form">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="field-name">
                  Display Name
                </label>
                <input
                  id="field-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold transition-all outline-none font-mono placeholder-zinc-450"
                  placeholder="Alex Guardian"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="field-email">
                Email Address
              </label>
              <input
                id="field-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold transition-all outline-none font-mono placeholder-zinc-450"
                placeholder="developer@vibe2ship.org"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-1.5" htmlFor="field-password">
                Password
              </label>
              <input
                id="field-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-950 rounded-md text-sm font-semibold transition-all outline-none font-mono placeholder-zinc-450"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded bg-rose-55 border border-rose-200 flex gap-2 items-center text-xs text-rose-800 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 font-bold font-mono text-xs uppercase tracking-wider text-white rounded-md shadow-[2px_2px_0px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-2 cursor-pointer bg-zinc-950 hover:bg-zinc-850 disabled:bg-zinc-700"
              id="auth-submit-btn"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Enter Workspace</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Initialize</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-center text-xs font-bold text-zinc-950 hover:underline transition-colors uppercase tracking-wider cursor-pointer font-mono"
            >
              {isLogin ? "Need workspace? Register" : "Already registered? Sign In"}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-200"></div>
              <span className="flex-shrink mx-4 text-zinc-450 font-mono text-[9px] uppercase font-bold tracking-widest">Demo Sandbox</span>
              <div className="flex-grow border-t border-zinc-200"></div>
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white border border-zinc-950 hover:bg-zinc-50 text-zinc-950 font-bold font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
              id="auth-demo-bypass-btn"
            >
              <span>Instant Hackathon Demonstration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
