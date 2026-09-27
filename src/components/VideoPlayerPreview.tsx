import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sliders,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  Mail,
  HardDrive,
  Users,
  MessageSquare,
  FileSpreadsheet,
  BrainCircuit,
  Trophy,
  Flame,
  Clock,
  Layers,
  HelpCircle,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VideoPlayerPreviewProps {
  onSwitchToInteractive: () => void;
}

interface Chapter {
  id: number;
  timeSec: number;
  label: string;
  subtitle: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    timeSec: 0,
    label: '01. The Problem',
    subtitle: 'Knowledge workers waste hours copy-pasting between Email, Excel, CRM, and Slack.',
  },
  {
    id: 2,
    timeSec: 15,
    label: '02. Shadow Observer',
    subtitle: 'WorkFlowOS passively observes user actions across Gmail, Finder, and CRM without manual configuration.',
  },
  {
    id: 3,
    timeSec: 35,
    label: '03. AI Intent Discovery',
    subtitle: 'Gemini AI discovers repetitive sequence patterns and compiles them into a structured automation workflow.',
  },
  {
    id: 4,
    timeSec: 55,
    label: '04. Multi-Tier Self-Healing',
    subtitle: 'When an app UI or API shifts, the 5-tier heuristic ladder dynamically falls back to Semantic Accessibility Tree.',
  },
  {
    id: 5,
    timeSec: 75,
    label: '05. Zero-Touch Execution & ROI',
    subtitle: 'Instant Slack notification dispatched, saving 4.2 minutes of mental focus and awarding XP.',
  },
];

const TOTAL_DURATION_SEC = 90;

export const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  onSwitchToInteractive,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION_SEC) {
            setIsPlaying(false);
            return TOTAL_DURATION_SEC;
          }
          return Number((prev + 0.1 * playbackSpeed).toFixed(1));
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed]);

  // Confetti on chapter 5 reach
  useEffect(() => {
    if (currentTime >= 76 && currentTime <= 77) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [currentTime]);

  // Active Chapter detection
  const currentChapter =
    [...CHAPTERS].reverse().find((c) => currentTime >= c.timeSec) || CHAPTERS[0];

  // Helper format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(Math.min(TOTAL_DURATION_SEC, Math.max(0, newTime)));
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Cursor coordinates calculation for cinematic pointer animation
  const getCursorPosition = () => {
    // 0 - 15: The problem
    if (currentTime < 15) {
      return { x: 45 + Math.sin(currentTime) * 15, y: 40 + Math.cos(currentTime) * 10, clicking: false };
    }
    // 15 - 35: Shadow Observer Gmail & Finder
    if (currentTime < 22) {
      // Moves towards Sarah Connor email
      const progress = (currentTime - 15) / 7;
      return { x: 30 + progress * 8, y: 35 + progress * 6, clicking: currentTime > 20 && currentTime < 21.5 };
    }
    if (currentTime < 28) {
      // Moves towards Download Attachment button
      const progress = (currentTime - 22) / 6;
      return { x: 40 + progress * 12, y: 55 + progress * 4, clicking: currentTime > 26 && currentTime < 27.5 };
    }
    if (currentTime < 35) {
      // Moves to HubSpot tab
      const progress = (currentTime - 28) / 7;
      return { x: 50 + progress * 15, y: 22, clicking: currentTime > 33 };
    }
    // 35 - 55: Discovery Engine
    if (currentTime < 45) {
      return { x: 75, y: 32, clicking: currentTime > 42 && currentTime < 44 };
    }
    if (currentTime < 55) {
      // Clicking "Approve Automation"
      return { x: 80, y: 48, clicking: currentTime > 52 && currentTime < 54 };
    }
    // 55 - 75: Multi-Tier Execution & Self Healing
    if (currentTime < 65) {
      // Clicking "Execute Real Workflow"
      return { x: 82, y: 24, clicking: currentTime > 57 && currentTime < 59 };
    }
    // 75+: Celebration
    return { x: 60, y: 70, clicking: false };
  };

  const cursor = getCursorPosition();

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex flex-col ${
        isFullscreen ? 'h-screen rounded-none' : 'aspect-video min-h-[580px]'
      }`}
    >
      {/* Top Video Header Overlay */}
      <div className="absolute top-0 inset-x-0 z-30 px-6 py-4 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold text-xs shadow-md">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                WorkFlowOS · Executive Product Preview
              </h2>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-semibold">
                4K 60FPS
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-300">{currentChapter.label}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToInteractive}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition backdrop-blur-md"
            title="Take manual control in the interactive dashboard"
          >
            <span>Interactive Studio Mode</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport Screen */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-6 select-none">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/15 via-slate-950 to-slate-950 pointer-events-none" />

        {/* ======================================================== */}
        {/* SCENE 1: THE PROBLEM (0 - 15s) */}
        {/* ======================================================== */}
        {currentTime < 15 && (
          <div className="w-full max-w-4xl space-y-6 text-center animate-fadeIn relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>The Problem: 23 Minutes Lost Per App Switch</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Knowledge workers spend 40% of their workday doing
              <span className="text-rose-400"> repetitive digital manual tasks</span>.
            </h1>

            {/* Chaotic 4-app cycle illustration */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 shadow-lg space-y-2">
                <Mail className="w-6 h-6 text-rose-400 mx-auto" />
                <div className="text-xs font-bold text-white">1. Inbound Gmail</div>
                <div className="text-[11px] text-slate-400">Copy customer details & download PO attachment</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-lg space-y-2">
                <HardDrive className="w-6 h-6 text-blue-400 mx-auto" />
                <div className="text-xs font-bold text-white">2. Local Finder</div>
                <div className="text-[11px] text-slate-400">Save attachment to local disk & verify hash</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-orange-500/30 shadow-lg space-y-2">
                <Users className="w-6 h-6 text-orange-400 mx-auto" />
                <div className="text-xs font-bold text-white">3. HubSpot CRM</div>
                <div className="text-[11px] text-slate-400">Search contact, attach document, mark Under Review</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-lg space-y-2">
                <MessageSquare className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-white">4. Slack Alert</div>
                <div className="text-[11px] text-slate-400">Alert operations team to review invoice</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xl mx-auto pt-2">
              "Users know how to do their work, but they shouldn't need to know how to automate it."
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENE 2: SHADOW OBSERVER AT WORK (15 - 35s) */}
        {/* ======================================================== */}
        {currentTime >= 15 && currentTime < 35 && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 animate-fadeIn">
            {/* Left simulated OS window */}
            <div className="md:col-span-7 glass-panel-elevated rounded-2xl overflow-hidden border border-white/10">
              <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 ml-1">
                    {currentTime < 28 ? 'Google Mail · Inbox' : 'HubSpot CRM · Customer Record'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Shadow Agent Hooked
                </span>
              </div>

              <div className="p-4 space-y-3 bg-slate-950/70 text-xs">
                {currentTime < 28 ? (
                  <>
                    <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Sarah Connor</span>
                        <span className="text-[10px] text-slate-400">sarah.connor@cyberdyne.io</span>
                      </div>
                      <div className="text-slate-300 font-medium">
                        [Support Request] Account license expansion & contract attachment
                      </div>
                      <div className="text-[11px] text-slate-400">
                        "Please find attached our signed PO 9821. Kindly update our HubSpot record."
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono text-[10px]">
                          PDF
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">Expansion_PO_9821.pdf</div>
                          <div className="text-[10px] text-slate-500">1.4 MB · Verified</div>
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          currentTime > 26
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-500 text-slate-950'
                        }`}
                      >
                        {currentTime > 26 ? 'Downloaded to ~/Downloads' : 'Download Attachment'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900 border border-orange-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm">Sarah Connor (Cyberdyne Systems)</div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                        Under Review
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Record matched via contact search. Document Expansion_PO_9821.pdf attached.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Semantic Event Stream */}
            <div className="md:col-span-5 glass-panel-elevated rounded-2xl overflow-hidden border border-white/10 flex flex-col">
              <div className="p-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Semantic Stream
                </span>
                <span className="text-[10px] text-cyan-300 font-mono">Real-Time Ingestion</span>
              </div>

              <div className="p-3 space-y-2 font-mono text-[11px] flex-1 bg-slate-950/80">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>GMAIL · READ_EMAIL</span>
                    <span>10:42:01</span>
                  </div>
                  <div>tr[aria-label*="Sarah Connor"]</div>
                </div>

                {currentTime >= 26 && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-blue-300 animate-slideDown">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>FINDER · DOWNLOAD_FILE</span>
                      <span>10:42:08</span>
                    </div>
                    <div>~/Downloads/Expansion_PO_9821.pdf</div>
                  </div>
                )}

                {currentTime >= 32 && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-orange-300 animate-slideDown">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>CRM · UPDATE_RECORD</span>
                      <span>10:42:15</span>
                    </div>
                    <div>POST /api/mock-service/crm/contacts</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENE 3: AI DISCOVERY & INTENT SYNTHESIS (35 - 55s) */}
        {/* ======================================================== */}
        {currentTime >= 35 && currentTime < 55 && (
          <div className="w-full max-w-4xl space-y-5 relative z-10 animate-fadeIn">
            <div className="glass-panel-elevated rounded-2xl p-6 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-xs uppercase font-mono text-amber-400 font-bold">
                      Repetition Detected (18 Observations)
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Customer Request Processing & CRM Sync
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Pattern Overlap</div>
                  <div className="text-lg font-extrabold text-emerald-400 font-mono">96% Match</div>
                </div>
              </div>

              {/* Synthesized Intent Box */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                  Synthesized Intent via Gemini AI:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  "Read inbound customer purchase orders in Gmail, download PDF to sandbox, query HubSpot CRM for matching customer contact, update status to 'Under Review', and ping #ops-customer-requests in Slack."
                </p>
              </div>

              {/* Visual Pipeline Pipeline */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <Mail className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-white">Gmail Trigger</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <div className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <HardDrive className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-white">Download PDF</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <div className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <Users className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-white">HubSpot CRM</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <div className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <MessageSquare className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-white">Slack Notice</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Manual: 4.0m ➔ Automated: 4.2s (98% faster)</span>
                <div
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                    currentTime > 52
                      ? 'bg-emerald-400 text-slate-950 scale-105'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  ✓ Approve & Arm Automation
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENE 4: MULTI-TIER EXECUTION & SELF-HEALING (55 - 75s) */}
        {/* ======================================================== */}
        {currentTime >= 55 && currentTime < 75 && (
          <div className="w-full max-w-4xl space-y-4 relative z-10 animate-fadeIn">
            <div className="glass-panel-elevated rounded-2xl p-5 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Live Multi-Tier Execution
                    </span>
                    {currentTime >= 65 && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                        Self-Healing Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Customer Request Processing Pipeline
                  </h3>
                </div>
                <div className="text-xs font-mono text-cyan-400">
                  Resilience Stack: 5 Tiers
                </div>
              </div>

              {/* Execution Steps */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">1. Ingest Email & Extract Intent</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">Tier 1 · Direct API (180ms)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">2. Download & Sanitize Attachment</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">Tier 1 · Direct API (180ms)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">3. Locate Contact in HubSpot CRM</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">Tier 1 · Direct API (210ms)</span>
                </div>

                {/* Step 4: Self-Healing Demo Step */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-500 ${
                    currentTime < 64
                      ? 'bg-slate-900 border-slate-700 text-slate-400'
                      : currentTime < 68
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 animate-pulse'
                      : 'bg-slate-900 border-amber-500/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {currentTime >= 68 ? (
                      <span className="text-amber-400 font-bold">⚡</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-600 inline-block text-[10px] text-center">4</span>
                    )}
                    <span className="font-semibold">4. Update CRM Record & Upload Attachment</span>
                  </div>

                  <div className="text-right">
                    {currentTime < 64 ? (
                      <span className="font-mono text-[10px] text-slate-500">Queued</span>
                    ) : currentTime < 68 ? (
                      <span className="font-mono text-[10px] text-amber-300">
                        API 503 Outage ➔ Auto-Downgrading to Tier 3 AX...
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        Self-Healed via Semantic AX Tree (720ms)
                      </span>
                    )}
                  </div>
                </div>

                {currentTime >= 71 && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between animate-slideDown">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-slate-200">5. Dispatch Slack Alert to #ops</span>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400">Tier 1 · Direct Webhook (140ms)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCENE 5: SLACK ALERT & ROI CELEBRATION (75 - 90s) */}
        {/* ======================================================== */}
        {currentTime >= 75 && (
          <div className="w-full max-w-4xl space-y-6 text-center relative z-10 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero-Touch Automation Successful</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white">
              Routine Automated Seamlessly in <span className="text-emerald-400">4.2 Seconds</span>
            </h1>

            {/* Scoreboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
                <div className="text-xs text-slate-400 font-semibold">Time Saved Today</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">163.8 mins</div>
                <div className="text-[10px] text-slate-500">+3.9 mins on this run</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-1">
                <div className="text-xs text-slate-400 font-semibold">Cognitive Focus Shield</div>
                <div className="text-2xl font-black text-purple-400 font-mono">19.4 hrs</div>
                <div className="text-[10px] text-slate-500">42 context switches averted</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1">
                <div className="text-xs text-slate-400 font-semibold">XP Awarded</div>
                <div className="text-2xl font-black text-amber-400 font-mono">+250 XP</div>
                <div className="text-[10px] text-amber-400 font-medium">Level 7 Grandmaster</div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => handleSeek(0)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Video</span>
              </button>

              <button
                onClick={onSwitchToInteractive}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
              >
                <span>Try Interactive Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Animated Flying Cursor Simulation */}
        <div
          className="absolute z-20 pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            {/* SVG Mac-style cursor */}
            <svg
              className="w-6 h-6 text-cyan-400 drop-shadow-lg filter"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="#0f172a"
              strokeWidth="1.5"
            >
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>

            {/* Click ripple animation */}
            {cursor.clicking && (
              <span className="absolute -top-2 -left-2 w-10 h-10 rounded-full border-2 border-cyan-400 animate-ping opacity-80 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Subtitle / Closed Caption Bar */}
      {showCaptions && (
        <div className="absolute bottom-16 inset-x-0 z-30 flex justify-center pointer-events-none px-6">
          <div className="px-4 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-center text-xs text-slate-200 max-w-2xl shadow-xl leading-relaxed">
            <span className="text-cyan-400 font-bold mr-1.5">[NARRATOR]:</span>
            {currentChapter.subtitle}
          </div>
        </div>
      )}

      {/* Bottom Video Controls Bar */}
      <div className="relative z-30 px-6 py-3 bg-slate-950/95 border-t border-white/10 flex flex-col gap-2">
        {/* Scrubber Progress Bar with Chapter Markers */}
        <div className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            handleSeek(clickPos * TOTAL_DURATION_SEC);
          }}
        >
          {/* Filled Bar */}
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full relative"
            style={{ width: `${(currentTime / TOTAL_DURATION_SEC) * 100}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition" />
          </div>

          {/* Chapter Ticks */}
          {CHAPTERS.map((ch) => (
            <div
              key={ch.id}
              className="absolute top-0 bottom-0 w-0.5 bg-white/30 hover:bg-white"
              style={{ left: `${(ch.timeSec / TOTAL_DURATION_SEC) * 100}%` }}
              title={ch.label}
            />
          ))}
        </div>

        {/* Action Controls & Chapter Pills */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              onClick={() => {
                if (currentTime >= TOTAL_DURATION_SEC) {
                  setCurrentTime(0);
                  setIsPlaying(true);
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
            </button>

            {/* Restart */}
            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Time Indicator */}
            <div className="text-xs font-mono text-slate-300">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-600 mx-1">/</span>
              <span className="text-slate-500">{formatTime(TOTAL_DURATION_SEC)}</span>
            </div>
          </div>

          {/* Chapters Navigation */}
          <div className="hidden lg:flex items-center gap-1.5">
            {CHAPTERS.map((ch) => {
              const isActive = currentChapter.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSeek(ch.timeSec)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Speed selector */}
            <button
              onClick={() => {
                const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                setPlaybackSpeed(nextSpeed);
              }}
              className="px-2 py-1 rounded text-[11px] font-mono font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              title="Playback Speed"
            >
              {playbackSpeed}x
            </button>

            {/* Captions Toggle */}
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition ${
                showCaptions
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Subtitles"
            >
              CC
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
