import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  Zap,
  TrendingUp,
  BrainCircuit,
  Settings,
  ShieldCheck,
  Flame,
  HelpCircle,
  MessageSquare,
  Mic,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { GamificationState } from '../types/workflow';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  gamification: GamificationState;
  activeTab: 'observer' | 'discovery' | 'workflow' | 'execution' | 'gamification';
  setActiveTab: (tab: 'observer' | 'discovery' | 'workflow' | 'execution' | 'gamification') => void;
  discoveredCount: number;
  isSimulating: boolean;
  onSimulateClick: () => void;
  onOpenGuide: () => void;
  onOpenChat: () => void;
  onOpenVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gamification,
  activeTab,
  setActiveTab,
  discoveredCount,
  isSimulating,
  onSimulateClick,
  onOpenGuide,
  onOpenChat,
  onOpenVoice,
}) => {
  const { user, signInWithGoogle, logout, isCloudConnected } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const xpPercent = Math.min(
    100,
    Math.round((gamification.currentXp / gamification.nextLevelXp) * 100)
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar: Brand + Live OS Agent Status + Gamified XP + CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  WorkFlow<span className="text-cyan-400">OS</span>
                </h1>
                <span className="text-[11px] font-mono tracking-wider text-slate-400 border border-slate-800 bg-slate-900/80 px-1.5 py-0.5 rounded">
                  v3.8 AI AGENT
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Shadow Observer Active</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-500">Monitoring 14 OS Applications</span>
              </p>
            </div>
          </div>

          {/* Gamified Level & XP Bar + Cumulative Impact */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Level & XP progression */}
            <button
              onClick={() => setActiveTab('gamification')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 transition group text-left"
              title="Click to view full achievements & ROI analytics"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                L{gamification.userLevel}
              </div>
              <div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                    Automation Grandmaster
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {gamification.currentXp}/{gamification.nextLevelXp} XP
                  </span>
                </div>
                <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Streak & Time Saved */}
            <div className="hidden lg:flex items-center gap-3 text-xs border-l border-slate-800/80 pl-4">
              <div className="flex items-center gap-1.5 text-amber-400" title="Active Automation Streak">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
                <span className="font-bold">{gamification.streakDays} Day Streak</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-emerald-400" title="Total Manual Time Saved">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">{gamification.totalMinutesSaved.toFixed(0)}m Saved</span>
                <span className="text-slate-500">(${((gamification.totalMinutesSaved / 60) * gamification.hourlyDollarRate).toFixed(0)})</span>
              </div>
            </div>

            {/* Gemini Copilot Chat Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
              title="Open Multi-turn Gemini Chat with Search Grounding"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini Chat</span>
            </button>

            {/* Gemini Live Voice Conversation Button */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-gradient-to-r from-blue-600/20 to-cyan-500/20 hover:from-blue-600/30 hover:to-cyan-500/30 text-blue-200 border border-blue-500/30 transition shadow-sm"
              title="Start real-time voice conversation with gemini-3.8-live"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice Live</span>
            </button>

            {/* How It Works / Step by Step Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition"
              title="Step-by-step interactive walkthrough"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>How It Works</span>
            </button>

            {/* Simulate / Demo Button */}
            <button
              onClick={onSimulateClick}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition shadow-sm ${
                isSimulating
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/30'
              }`}
            >
              {isSimulating ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-cyan-300 border-t-transparent rounded-full" />
                  <span>Agent Observing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate Repetitive Work</span>
                </>
              )}
            </button>

            {/* Firebase Auth User Profile / Sign In */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition text-xs text-white"
                  >
                    <span className="max-w-[100px] truncate hidden sm:inline">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-7 h-7 rounded-lg object-cover border border-cyan-500/40"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <div className="text-xs font-bold text-white truncate">
                          {user.displayName || 'Automation Specialist'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate font-mono">
                          {user.email}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Firebase Firestore Active</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-xs bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-500 transition shadow-sm"
                  title="Sign in with Google to sync workflows to Firebase"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Google Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs with subtle glass styling */}
        <nav className="flex items-center gap-1 mt-3 pt-2 border-t border-white/5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('observer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === 'observer'
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Desktop Activity Agent</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </button>

          <button
            onClick={() => setActiveTab('discovery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition relative ${
              activeTab === 'discovery'
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Workflow Discovery Engine</span>
            {discoveredCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                {discoveredCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === 'workflow'
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Workflow Graph & Heuristic Ladder</span>
          </button>

          <button
            onClick={() => setActiveTab('execution')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === 'execution'
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Automation Engine & Self-Healing</span>
          </button>

          <button
            onClick={() => setActiveTab('gamification')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === 'gamification'
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            <span>Gamification & ROI Matrix</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
