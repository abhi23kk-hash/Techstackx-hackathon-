import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ShadowObserver } from './components/ShadowObserver';
import { DiscoveryEngine } from './components/DiscoveryEngine';
import { WorkflowVisualizer } from './components/WorkflowVisualizer';
import { ExecutionConsole } from './components/ExecutionConsole';
import { GamificationPillars } from './components/GamificationPillars';
import { NewRoutineModal } from './components/NewRoutineModal';
import { GuideModal } from './components/GuideModal';
import { VideoPlayerPreview } from './components/VideoPlayerPreview';
import { GeminiChatModal } from './components/GeminiChatModal';
import { VoiceLiveModal } from './components/VoiceLiveModal';
import {
  DiscoveredWorkflow,
  DesktopEvent,
  GamificationState,
  AutomationTierId,
} from './types/workflow';
import {
  INITIAL_DISCOVERED_WORKFLOWS,
  INITIAL_BADGES,
  SAMPLE_OBSERVED_EVENTS_STREAM,
} from './data/mockData';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, ShieldCheck, Flame, Zap, Play, Layers, Tv, MessageSquare, Mic } from 'lucide-react';

export default function App() {
  // Default to 'video' preview mode as requested by user
  const [viewMode, setViewMode] = useState<'video' | 'interactive'>('video');

  const [activeTab, setActiveTab] = useState<
    'observer' | 'discovery' | 'workflow' | 'execution' | 'gamification'
  >('observer');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const [discoveredWorkflows, setDiscoveredWorkflows] = useState<DiscoveredWorkflow[]>(
    INITIAL_DISCOVERED_WORKFLOWS
  );

  const [selectedWorkflow, setSelectedWorkflow] = useState<DiscoveredWorkflow>(
    INITIAL_DISCOVERED_WORKFLOWS[0]
  );

  const [events, setEvents] = useState<DesktopEvent[]>(SAMPLE_OBSERVED_EVENTS_STREAM);

  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; size: string; type: string; hash: string; timestamp: string }>
  >([
    {
      name: 'Amazon_ML_Challenge_2026_Exact_Implementation_Plan.html',
      size: '18.2 KB',
      type: 'text/html',
      hash: 'e3b0c44298fc1c14...',
      timestamp: '13:35',
    },
    {
      name: 'Expansion_PO_9821.pdf',
      size: '1.4 MB',
      type: 'application/pdf',
      hash: '8a7f9b23c14d9e02...',
      timestamp: '10:42 AM',
    },
  ]);

  const [gamification, setGamification] = useState<GamificationState>({
    userLevel: 7,
    currentXp: 1840,
    nextLevelXp: 2500,
    streakDays: 14,
    totalTasksAutomated: 88,
    totalMinutesSaved: 337.1,
    cognitiveLoadSavedHours: 19.4,
    hourlyDollarRate: 55,
    badges: INITIAL_BADGES,
  });

  const [isAutoReplaying, setIsAutoReplaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'xp' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'info' | 'xp' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const addXp = (amount: number, reason: string) => {
    setGamification((prev) => {
      let newXp = prev.currentXp + amount;
      let newLevel = prev.userLevel;
      let nextTarget = prev.nextLevelXp;

      if (newXp >= nextTarget) {
        newXp = newXp - nextTarget;
        newLevel += 1;
        nextTarget = Math.round(nextTarget * 1.35);
        showToast(`Level Up! You reached Level ${newLevel} Automation Grandmaster!`, 'xp');
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch (e) {
          // ignore
        }
      } else {
        showToast(`+${amount} XP: ${reason}`, 'xp');
      }

      return {
        ...prev,
        currentXp: newXp,
        userLevel: newLevel,
        nextLevelXp: nextTarget,
      };
    });
  };

  // Add individual event from simulated observer
  const handleAddEvent = (event: DesktopEvent) => {
    setEvents((prev) => [event, ...prev]);
  };

  const handleClearEvents = () => {
    setEvents([]);
    showToast('Event interceptor stream cleared', 'info');
  };

  // Automated 3x customer flow simulation
  const handleAutoReplayRoutine = async () => {
    setIsAutoReplaying(true);
    showToast('Simulating customer request routine 3x across desktop apps...', 'info');

    const activeDoc = uploadedFiles[0]?.name || 'Amazon_ML_Challenge_2026_Exact_Implementation_Plan.html';
    const activeDocSize = uploadedFiles[0]?.size || '18.2 KB';

    const demoEvents: DesktopEvent[] = [
      {
        id: `ev-auto-1-${Date.now()}`,
        timestamp: Date.now() - 4000,
        app: 'gmail',
        appName: 'Google Mail',
        windowTitle: 'Inbox (3) - Sarah Connor: License expansion & PO',
        actionType: 'read_email',
        actionLabel: 'Click email thread & open message',
        payload: { sender: 'sarah.connor@cyberdyne.io', attachment: activeDoc },
        durationMs: 3200,
        confidence: 0.99,
      },
      {
        id: `ev-auto-2-${Date.now()}`,
        timestamp: Date.now() - 3000,
        app: 'filesystem',
        appName: 'OS Finder',
        windowTitle: `Downloads - ${activeDoc}`,
        actionType: 'download_attachment',
        actionLabel: `Save attachment to ~/Downloads/${activeDoc}`,
        payload: { file: activeDoc, size: activeDocSize },
        durationMs: 1400,
        confidence: 0.98,
      },
      {
        id: `ev-auto-3-${Date.now()}`,
        timestamp: Date.now() - 2000,
        app: 'crm',
        appName: 'HubSpot CRM Web',
        windowTitle: 'Search: sarah.connor@cyberdyne.io',
        actionType: 'search_customer',
        actionLabel: 'Locate customer profile & open record',
        payload: { contactId: 'HB-90821-C', email: 'sarah.connor@cyberdyne.io' },
        durationMs: 4100,
        confidence: 0.97,
      },
      {
        id: `ev-auto-4-${Date.now()}`,
        timestamp: Date.now() - 1000,
        app: 'crm',
        appName: 'HubSpot CRM Web',
        windowTitle: 'Sarah Connor - Cyberdyne Systems Record',
        actionType: 'update_crm_record',
        actionLabel: `Attach ${activeDoc} & mark "Under Review"`,
        payload: { newStatus: 'Under Review', attachedDoc: activeDoc },
        durationMs: 3800,
        confidence: 0.96,
      },
      {
        id: `ev-auto-5-${Date.now()}`,
        timestamp: Date.now(),
        app: 'slack',
        appName: 'Slack Desktop',
        windowTitle: '#ops-customer-requests',
        actionType: 'send_slack_message',
        actionLabel: 'Send notification to #ops-customer-requests',
        payload: { channel: '#ops-customer-requests', message: `Updated record with attachment ${activeDoc}.` },
        durationMs: 2100,
        confidence: 0.99,
      },
    ];

    setEvents(demoEvents);
    setIsAutoReplaying(false);
    addXp(120, 'Observed 3x repetitive customer routine');
    setActiveTab('discovery');
    showToast('Workflow Discovery Engine identified recurring pattern with 96% confidence!', 'success');
  };

  // Synthesize Workflow with Gemini AI or Fallback
  const handleSynthesizeWithGemini = async (currentEvents: DesktopEvent[], customRoutineName?: string, notes?: string) => {
    setIsSynthesizing(true);
    try {
      const response = await fetch('/api/synthesize-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: currentEvents.length > 0 ? currentEvents : SAMPLE_OBSERVED_EVENTS_STREAM,
          routineName: customRoutineName,
          contextNotes: notes,
        }),
      });

      const data = await response.json();
      if (data.success && data.workflow) {
        const newWorkflow: DiscoveredWorkflow = {
          id: `wf-${Date.now()}`,
          title: data.workflow.title || 'Synthesized Cross-App Workflow',
          intent: data.workflow.intent || 'Automated multi-step cross application orchestration.',
          summary: data.workflow.summary || 'Generated via AI sequence mining.',
          category: data.workflow.category || 'Customer Ops',
          status: 'discovered',
          repetitionCount: 6,
          similarityScore: data.workflow.similarityScore || 0.96,
          avgManualSeconds: data.workflow.avgManualSeconds || 180,
          avgAutomatedSeconds: data.workflow.avgAutomatedSeconds || 3.8,
          minutesSavedPerRun: Number(
            (((data.workflow.avgManualSeconds || 180) - (data.workflow.avgAutomatedSeconds || 3.8)) / 60).toFixed(1)
          ),
          totalRuns: 0,
          totalMinutesSaved: 0,
          discoveredAt: 'Just now',
          healingEventsCount: 0,
          tags: ['AI-Synthesized', 'Multi-Tier'],
          trigger: data.workflow.trigger || {
            type: 'ai_observer',
            sourceApp: 'gmail',
            description: 'Inbound customer trigger event',
          },
          steps: data.workflow.steps.map((st: any, i: number) => ({
            id: `st-${Date.now()}-${i}`,
            order: i + 1,
            title: st.title,
            description: st.description,
            app: st.app || 'crm',
            actionType: st.actionType || 'search_customer',
            preferredTier: st.preferredTier || 'tier1_api',
            activeTier: st.preferredTier || 'tier1_api',
            availableTiers: st.availableTiers || ['tier1_api', 'tier2_app', 'tier3_accessibility'],
            parameters: st.parameters || {},
            variablesIn: st.variablesIn || [],
            variablesOut: st.variablesOut || [],
            condition: st.condition,
            status: 'idle',
          })),
        };

        setDiscoveredWorkflows((prev) => [newWorkflow, ...prev]);
        setSelectedWorkflow(newWorkflow);
        addXp(250, 'Synthesized Intent with Gemini AI');
        setActiveTab('workflow');
        showToast(`Workflow synthesized: "${newWorkflow.title}"!`, 'success');

        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error during synthesis:', err);
      showToast('Error during synthesis. Using built-in heuristics.', 'info');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // User Approval of Discovered Workflow
  const handleApproveWorkflow = (wf: DiscoveredWorkflow) => {
    const updated = discoveredWorkflows.map((item) =>
      item.id === wf.id ? { ...item, status: 'approved' as const } : item
    );
    setDiscoveredWorkflows(updated);
    setSelectedWorkflow({ ...wf, status: 'approved' });
    addXp(200, `Approved automation for "${wf.title}"`);
    showToast(`Approved "${wf.title}"! Multi-Tier execution ladder armed.`, 'success');
    setActiveTab('workflow');
  };

  // Update preferred tier in a step
  const handleUpdateStepTier = (stepId: string, newTier: AutomationTierId) => {
    const updatedSteps = selectedWorkflow.steps.map((s) =>
      s.id === stepId ? { ...s, activeTier: newTier } : s
    );
    const updatedWf = { ...selectedWorkflow, steps: updatedSteps };
    setSelectedWorkflow(updatedWf);
    setDiscoveredWorkflows((prev) =>
      prev.map((item) => (item.id === updatedWf.id ? updatedWf : item))
    );
    showToast(`Step automation tier updated to ${newTier.toUpperCase()}`, 'info');
  };

  // Completion callback from ExecutionConsole
  const handleExecutionComplete = (timeSavedMinutes: number, healed: boolean) => {
    setGamification((prev) => {
      const updatedTotalSaved = prev.totalMinutesSaved + timeSavedMinutes;
      const updatedTasks = prev.totalTasksAutomated + 1;
      return {
        ...prev,
        totalMinutesSaved: updatedTotalSaved,
        totalTasksAutomated: updatedTasks,
      };
    });

    if (healed) {
      addXp(300, 'Self-Healing Fallback dynamically saved execution!');
      showToast('Self-Healing Engine succeeded: Automatically downgraded tier without failing!', 'success');
    } else {
      addXp(180, 'Flawless Zero-Touch Execution');
    }
  };

  // Preset Selection from Modal
  const handleSelectPreset = (presetKey: string) => {
    if (presetKey === 'customer-request') {
      setSelectedWorkflow(discoveredWorkflows[0]);
      setActiveTab('workflow');
    } else if (presetKey === 'invoice-reconcile') {
      setSelectedWorkflow(discoveredWorkflows[1] || discoveredWorkflows[0]);
      setActiveTab('workflow');
    } else if (presetKey === 'lead-enrichment') {
      setSelectedWorkflow(discoveredWorkflows[2] || discoveredWorkflows[0]);
      setActiveTab('workflow');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-xl ${
              toast.type === 'xp'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-300'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-300'
            }`}
          >
            {toast.type === 'xp' ? (
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Universal Mode Switcher Bar */}
      <div className="bg-slate-900/90 border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Presentation Mode:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('video')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'video'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Video Preview Mode</span>
            </button>

            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === 'interactive'
                  ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Dashboard</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Automated 4K Video Demo Reel</span>
        </div>
      </div>

      {/* Main Header (shown in interactive mode or compact in video mode) */}
      {viewMode === 'interactive' && (
        <Header
          gamification={gamification}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          discoveredCount={discoveredWorkflows.filter((w) => w.status === 'discovered').length}
          isSimulating={isAutoReplaying}
          onSimulateClick={() => setIsModalOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenVoice={() => setIsVoiceOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* ======================================================== */}
        {/* VIDEO PREVIEW MODE (Cinematic Autoplay Demo) */}
        {/* ======================================================== */}
        {viewMode === 'video' && (
          <div className="space-y-4">
            <VideoPlayerPreview
              onSwitchToInteractive={() => setViewMode('interactive')}
            />

            {/* Sub-note explaining the video */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Full Video Walkthrough:</span>
                <span>Watch the automated cursor observe Gmail, extract POs, discover intent, self-heal, and dispatch Slack alerts.</span>
              </div>
              <button
                onClick={() => setViewMode('interactive')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline shrink-0"
              >
                Switch to Interactive Dashboard ➔
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* INTERACTIVE DASHBOARD MODE */}
        {/* ======================================================== */}
        {viewMode === 'interactive' && (
          <>
            {activeTab === 'observer' && (
              <ShadowObserver
                events={events}
                onAddEvent={handleAddEvent}
                onClearEvents={handleClearEvents}
                onAutoReplayRoutine={handleAutoReplayRoutine}
                isAutoReplaying={isAutoReplaying}
                onTriggerDiscovery={() => setActiveTab('discovery')}
                uploadedFiles={uploadedFiles}
                onAddUploadedFile={(file) => setUploadedFiles((prev) => [file, ...prev])}
              />
            )}

            {activeTab === 'discovery' && (
              <DiscoveryEngine
                discoveredWorkflows={discoveredWorkflows}
                onApproveWorkflow={handleApproveWorkflow}
                onSelectWorkflowToView={(wf) => {
                  setSelectedWorkflow(wf);
                  setActiveTab('workflow');
                }}
                events={events}
                onSynthesizeWithGemini={(evs) => handleSynthesizeWithGemini(evs)}
                isSynthesizing={isSynthesizing}
                selectedWorkflow={selectedWorkflow}
                uploadedFiles={uploadedFiles}
              />
            )}

            {activeTab === 'workflow' && (
              <WorkflowVisualizer
                workflow={selectedWorkflow}
                onExecuteWorkflow={() => setActiveTab('execution')}
                onUpdateStepTier={handleUpdateStepTier}
              />
            )}

            {activeTab === 'execution' && (
              <ExecutionConsole
                workflow={selectedWorkflow}
                onExecutionComplete={handleExecutionComplete}
              />
            )}

            {activeTab === 'gamification' && (
              <GamificationPillars
                gamification={gamification}
                onUpdateHourlyRate={(rate) =>
                  setGamification((prev) => ({ ...prev, hourlyDollarRate: rate }))
                }
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">WorkFlowOS</span>
            <span className="text-slate-600">·</span>
            <span>Observe ➔ Understand ➔ Detect Repetition ➔ Generate ➔ Approve ➔ Automate ➔ Learn</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Powered by Heuristic Multi-Tier Engine & Gemini AI
          </div>
        </div>
      </footer>

      {/* Floating Quick Action Launcher: Voice Live & Gemini Chat */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 text-xs font-semibold border border-blue-400/30 transition transform hover:scale-105 cursor-pointer"
          title="Start real-time voice conversation with gemini-3.8-live"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
          <Mic className="w-4 h-4" />
          <span>Voice Live</span>
        </button>

        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/30 text-xs font-semibold border border-cyan-400/30 transition transform hover:scale-105 cursor-pointer"
          title="Open Gemini Multi-Turn Chatbot with Search Grounding"
        >
          <Sparkles className="w-4 h-4" />
          <span>Gemini Copilot</span>
        </button>
      </div>

      {/* New Routine Simulator Modal */}
      <NewRoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        onCustomSynthesize={(title, notes) => handleSynthesizeWithGemini(events, title, notes)}
      />

      {/* Interactive Step-by-Step Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onJumpToTab={(tab) => setActiveTab(tab)}
      />

      {/* Multi-turn Gemini Chatbot with Search Grounding Modal */}
      <GeminiChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Gemini 3.8 Live API Voice Conversation Modal */}
      <VoiceLiveModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </div>
  );
}
