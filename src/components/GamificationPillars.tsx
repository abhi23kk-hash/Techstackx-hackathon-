import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  TrendingUp,
  BrainCircuit,
  Zap,
  DollarSign,
  Shield,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';
import { GamificationState, AchievementBadge } from '../types/workflow';

interface GamificationPillarsProps {
  gamification: GamificationState;
  onUpdateHourlyRate: (rate: number) => void;
}

export const GamificationPillars: React.FC<GamificationPillarsProps> = ({
  gamification,
  onUpdateHourlyRate,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(
    gamification.badges[0] || null
  );

  const totalHoursSaved = gamification.totalMinutesSaved / 60;
  const totalValueGenerated = totalHoursSaved * gamification.hourlyDollarRate;
  const contextSwitchesPrevented = Math.round(gamification.totalTasksAutomated * 4.2);

  // Simulated weekly chart data
  const weeklyData = [
    { day: 'Mon', manualMins: 42, autoSecs: 48, savedMins: 41 },
    { day: 'Tue', manualMins: 55, autoSecs: 62, savedMins: 54 },
    { day: 'Wed', manualMins: 78, autoSecs: 85, savedMins: 76 },
    { day: 'Thu', manualMins: 62, autoSecs: 70, savedMins: 60 },
    { day: 'Fri', manualMins: 88, autoSecs: 94, savedMins: 86 },
  ];

  const maxMins = 90;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="glass-panel rounded-2xl p-5 border border-rose-500/20 bg-gradient-to-r from-slate-900/90 via-rose-950/20 to-slate-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-rose-400" />
                Gamified Mastery & Cognitive ROI
              </span>
              <span className="text-xs text-slate-400">· Eliminating Cognitive Fatigue</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Productivity Tier: Level {gamification.userLevel} Automation Grandmaster
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every repeated digital keystroke eliminated awards XP, shields mental focus, and produces measurable financial returns.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{gamification.streakDays} Days Zero-Touch Streak</span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Progress to Level {gamification.userLevel + 1}</span>
            <span className="text-cyan-400 font-mono font-semibold">
              {gamification.currentXp} / {gamification.nextLevelXp} XP ({Math.round(
                (gamification.currentXp / gamification.nextLevelXp) * 100
              )}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-rose-500 h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  100,
                  (gamification.currentXp / gamification.nextLevelXp) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Time Saved */}
        <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Manual Time Saved</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {gamification.totalMinutesSaved.toFixed(0)} <span className="text-sm font-normal text-slate-400">mins</span>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Equivalent to <strong className="text-cyan-300">{totalHoursSaved.toFixed(1)} hours</strong> of tedious manual copy-pasting eliminated this sprint.
          </p>
        </div>

        {/* Metric 2: Cognitive Fatigue Shield */}
        <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Context Switches Prevented</span>
            <BrainCircuit className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {contextSwitchesPrevented} <span className="text-sm font-normal text-slate-400">switches</span>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Preserved <strong className="text-purple-300">{(contextSwitchesPrevented * 0.38).toFixed(1)} hours</strong> of deep focus state (averting the 23-minute focus recovery penalty).
          </p>
        </div>

        {/* Metric 3: Financial ROI */}
        <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cumulative Dollar ROI</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            ${totalValueGenerated.toFixed(0)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Hourly Salary Rate:</span>
            <div className="flex items-center gap-1 font-mono">
              <span>$</span>
              <input
                type="number"
                min="20"
                max="250"
                value={gamification.hourlyDollarRate}
                onChange={(e) => onUpdateHourlyRate(Number(e.target.value) || 55)}
                className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white focus:outline-none focus:border-cyan-400"
              />
              <span>/hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Achievement Trophies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white">Manual vs Automated Time Comparison</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily manual routine minutes compressed into seconds.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/60"></span>
                  <span className="text-slate-400 text-[11px]">Manual (Mins)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-400"></span>
                  <span className="text-slate-400 text-[11px]">Saved (Mins)</span>
                </div>
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-4 pt-4 px-2">
              {weeklyData.map((d, i) => {
                const manualHeight = (d.manualMins / maxMins) * 100;
                const savedHeight = (d.savedMins / maxMins) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-44">
                      {/* Manual Bar */}
                      <div
                        className="w-1/2 bg-slate-800 rounded-t group-hover:bg-slate-700 transition-all duration-500 relative"
                        style={{ height: `${manualHeight}%` }}
                        title={`Manual: ${d.manualMins} mins`}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                          {d.manualMins}m
                        </span>
                      </div>

                      {/* Saved Bar */}
                      <div
                        className="w-1/2 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t transition-all duration-500 relative shadow-lg shadow-emerald-500/10"
                        style={{ height: `${savedHeight}%` }}
                        title={`Saved: ${d.savedMins} mins`}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-emerald-300 font-bold opacity-0 group-hover:opacity-100 transition">
                          +{d.savedMins}m
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-400">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Achievement Trophy Case (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Achievement Trophies</h3>
              </div>
              <span className="text-xs text-slate-400">
                {gamification.badges.filter((b) => b.unlocked).length} / {gamification.badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {gamification.badges.map((badge) => {
                const isSelected = selectedBadge?.id === badge.id;

                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 shadow-md shadow-amber-500/10'
                        : badge.unlocked
                        ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{badge.icon}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                          badge.rarity === 'Legendary'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : badge.rarity === 'Epic'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : badge.rarity === 'Rare'
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {badge.rarity}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-xs font-bold text-white truncate">{badge.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                        {badge.description}
                      </div>
                    </div>

                    {badge.unlocked ? (
                      <div className="text-[10px] text-emerald-400 font-mono mt-2">
                        Unlocked ✓
                      </div>
                    ) : (
                      <div className="mt-2 space-y-1">
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono text-right">
                          {badge.progress}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
