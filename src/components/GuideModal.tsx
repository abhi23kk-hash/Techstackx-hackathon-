import React from 'react';
import {
  X,
  Eye,
  Sparkles,
  GitBranch,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Play,
  ArrowRight,
  Database,
  Trophy,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTab: (tab: 'observer' | 'discovery' | 'workflow' | 'execution' | 'gamification') => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onJumpToTab,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Observe: Desktop Activity Agent',
      tab: 'observer' as const,
      icon: Eye,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      description:
        'Go to "Desktop Activity Agent". Click on emails in Gmail, download the attachment, search or update contacts in HubSpot CRM, or drop real files into the sandbox. The agent passively captures these clicks and keystrokes into structured semantic events in real time.',
      quickAction: 'Open Desktop Agent',
    },
    {
      num: '02',
      title: 'Detect & Understand: AI Discovery Engine',
      tab: 'discovery' as const,
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      description:
        'Once 3+ actions occur, click "Auto-Run 3x Customer Flow" or "Synthesize Live Intent with Gemini". The AI parses cross-app transitions (Gmail ➔ Downloads ➔ CRM ➔ Slack), abstracts variable fields (emails, IDs, POs), and proposes an automated workflow.',
      quickAction: 'View Discovered Workflows',
    },
    {
      num: '03',
      title: 'Generate & Inspect: Heuristic Ladder Graph',
      tab: 'workflow' as const,
      icon: Layers,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
      description:
        'Inspect the interactive visual node graph. Each step is bound to a 5-tier resilience ladder (Direct API ➔ Native App IPC ➔ Semantic AX Tree ➔ Browser Automation ➔ Vision Fallback). Click any step and hit "Test This Step Live on Backend" to test it in isolation.',
      quickAction: 'Inspect Workflow Graph',
    },
    {
      num: '04',
      title: 'Automate & Self-Heal: Live Execution Engine',
      tab: 'execution' as const,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      description:
        'Click "Execute Real Workflow". Watch real HTTP requests dispatch, the CRM database update in real time, and Slack webhooks fire! Toggle "Simulate API Drift" to see the engine automatically downgrade to Tier 3 Accessibility and self-heal without crashing.',
      quickAction: 'Run Live Execution',
    },
    {
      num: '05',
      title: 'Verify Live State: Backend Database & Webhooks',
      tab: 'observer' as const,
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      description:
        'In the Desktop Agent view, click the "Live Backend DB" button to see the actual in-memory database records updated (e.g. Sarah Connor marked "Under Review" with attached PO) and inspect received live webhook payloads.',
      quickAction: 'Check Live DB',
    },
    {
      num: '06',
      title: 'Gamification & ROI Matrix',
      tab: 'gamification' as const,
      icon: Trophy,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      description:
        'Every run awards XP, levels up your Automation Rank (e.g. Level 7 Automation Grandmaster), maintains your Zero-Touch Streak, unlocks achievement trophies, and calculates cumulative salary dollars saved.',
      quickAction: 'View ROI & Trophies',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="glass-panel-elevated rounded-2xl max-w-3xl w-full border border-white/20 p-6 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              Interactive User Guide
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            How to Use WorkFlowOS Step by Step
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            WorkFlowOS follows the complete lifecycle: <strong>Observe ➔ Understand ➔ Detect Repetition ➔ Generate ➔ Approve ➔ Automate ➔ Learn</strong>.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm text-slate-500">
                      {st.num}
                    </span>
                    <div className={`p-1.5 rounded-lg border ${st.bgColor}`}>
                      <Icon className={`w-4 h-4 ${st.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-white">{st.title}</h3>
                  </div>

                  <button
                    onClick={() => {
                      onJumpToTab(st.tab);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg transition"
                  >
                    <span>{st.quickAction}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  {st.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            Got it, Let's Automate!
          </button>
        </div>
      </div>
    </div>
  );
};
