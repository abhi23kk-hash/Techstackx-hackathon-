import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Workflow,
  Shield,
  Layers,
  Zap,
  Repeat,
  Bot,
  Activity,
  ChevronRight,
  ExternalLink,
  Paperclip,
} from 'lucide-react';
import {
  DiscoveredWorkflow,
  DesktopEvent,
  TransitionMetric,
} from '../types/workflow';
import { APP_TRANSITION_METRICS } from '../data/mockData';

interface DiscoveryEngineProps {
  discoveredWorkflows: DiscoveredWorkflow[];
  onApproveWorkflow: (workflow: DiscoveredWorkflow) => void;
  onSelectWorkflowToView: (workflow: DiscoveredWorkflow) => void;
  events: DesktopEvent[];
  onSynthesizeWithGemini: (events: DesktopEvent[]) => Promise<void>;
  isSynthesizing: boolean;
  selectedWorkflow: DiscoveredWorkflow;
  uploadedFiles?: Array<{ name: string; size: string; type: string; hash: string; timestamp: string }>;
}

export const DiscoveryEngine: React.FC<DiscoveryEngineProps> = ({
  discoveredWorkflows,
  onApproveWorkflow,
  onSelectWorkflowToView,
  events,
  onSynthesizeWithGemini,
  isSynthesizing,
  selectedWorkflow,
  uploadedFiles = [],
}) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'transitions' | 'intent_model'>('candidates');

  const activeFileName = uploadedFiles[0]?.name || 'Amazon_ML_Challenge_2026_Exact_Implementation_Plan.html';

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-r from-slate-900/90 via-amber-950/20 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Workflow Understanding & Discovery
              </span>
              <span className="text-xs text-slate-400">· Pattern Clustering Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Discovered Recurring Workflows
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              WorkFlowOS groups individual mouse clicks and keystrokes into cohesive intents.
              When frequency and similarity exceed statistical thresholds, WorkFlowOS constructs an executable multi-tier automation proposal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSynthesizeWithGemini(events)}
              disabled={isSynthesizing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg ${
                isSynthesizing
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isSynthesizing ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                  <span>Synthesizing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-slate-950" />
                  <span>Synthesize Live Intent with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'candidates'
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Discovered Candidates ({discoveredWorkflows.length})
          </button>
          <button
            onClick={() => setActiveTab('transitions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'transitions'
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cross-App Transition Graph
          </button>
          <button
            onClick={() => setActiveTab('intent_model')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'intent_model'
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pattern Recognition Metrics
          </button>
        </div>
      </div>

      {/* Tab: Candidates */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          {/* Active Intercepted Files Banner */}
          {uploadedFiles && uploadedFiles.length > 0 && (
            <div className="glass-panel-elevated rounded-2xl p-4 border border-cyan-500/40 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">Your Intercepted File:</span>
                    <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                      {uploadedFiles[0].name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({uploadedFiles[0].size})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>SHA-256: <code className="text-emerald-400 font-mono">{uploadedFiles[0].hash}</code></span>
                    <span>·</span>
                    <span className="text-slate-300">Bound to Step 2 (Ingest & Hash) & Step 4 (CRM Attachment)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active in Pipeline
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {discoveredWorkflows.map((wf) => {
              const isSelected = selectedWorkflow.id === wf.id;
              const isApproved = wf.status === 'approved' || wf.status === 'active';

              return (
                <div
                  key={wf.id}
                  className={`glass-panel-elevated rounded-2xl p-5 border transition ${
                    isSelected
                      ? 'border-cyan-500/50 bg-slate-900/90 shadow-lg shadow-cyan-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info & Intent */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                          {wf.category}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5" />
                          Observed {wf.repetitionCount} times
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">
                          Similarity: <span className="text-slate-200 font-semibold">{(wf.similarityScore * 100).toFixed(0)}%</span>
                        </span>
                        {isApproved && (
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved & Ready
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white hover:text-cyan-300 transition cursor-pointer"
                        onClick={() => onSelectWorkflowToView(wf)}>
                        {wf.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mr-1.5">
                          Synthesized Intent:
                        </span>
                        {wf.intent}
                      </p>

                      {/* Transition Steps Pipeline Preview */}
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {wf.steps.map((st, sIdx) => (
                          <React.Fragment key={st.id}>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                              <span className="text-slate-200 font-medium">{st.app.toUpperCase()}</span>
                              <span className="text-slate-500">·</span>
                              <span className="text-slate-400 truncate max-w-[130px]">{st.title}</span>
                            </div>
                            {sIdx < wf.steps.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Right: ROI & Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 lg:min-w-[240px] pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      <div className="text-left lg:text-right space-y-1">
                        <div className="text-xs text-slate-400">Manual vs Automated</div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-rose-400 line-through">{(wf.avgManualSeconds / 60).toFixed(1)}m</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-emerald-400 font-bold">{wf.avgAutomatedSeconds}s</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-medium">
                          +{wf.minutesSavedPerRun} min saved per run
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full lg:w-auto">
                        <button
                          onClick={() => onSelectWorkflowToView(wf)}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        >
                          <Workflow className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Graph</span>
                        </button>

                        {!isApproved ? (
                          <button
                            onClick={() => onApproveWorkflow(wf)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Automation</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectWorkflowToView(wf)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
                          >
                            <Zap className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Open in Engine</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Cross-App Transition Graph */}
      {activeTab === 'transitions' && (
        <div className="glass-panel-elevated rounded-2xl p-6 border border-white/10 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Cross-Application Context Switching Topology</h3>
            <p className="text-xs text-slate-400 mt-1">
              Desktop Activity Agent calculates sequence transition probabilities and latency between disparate OS applications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {APP_TRANSITION_METRICS.map((trans, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs uppercase text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {trans.fromApp}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono font-bold text-xs uppercase text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {trans.toApp}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">{trans.percentage}% Affinity</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Occurrences: {trans.count} times</span>
                    <span>Avg Context Shift: {trans.avgDelaySec}s</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full rounded-full"
                      style={{ width: `${trans.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Zero-Touch Context Shielding</div>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                By collapsing these 4 disparate application hops into an atomic background worker, WorkFlowOS eliminates the 23-minute focus recovery cost associated with human mental context switching.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Intent Model */}
      {activeTab === 'intent_model' && (
        <div className="glass-panel-elevated rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white">Sequence Mining & Clustering Criteria</h3>
          <p className="text-xs text-slate-400">
            WorkFlowOS combines continuous Markov transition probability matrices with semantic LLM token similarity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="text-xs font-bold text-cyan-400">1. Repetition Threshold</div>
              <p className="text-xs text-slate-300">
                Minimum 3 occurrences of identical application sequence topology within a rolling 72-hour window.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="text-xs font-bold text-amber-400">2. Parameter Variable Binding</div>
              <p className="text-xs text-slate-300">
                Detects dynamic inputs (customer email, tracking number, PDF attachment) and abstracts them into reusable workflow schema variables.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="text-xs font-bold text-emerald-400">3. Human Exception Guardrails</div>
              <p className="text-xs text-slate-300">
                Automatically injects conditional branches (e.g. "If contact cannot be found in CRM, escalate to human") to prevent unmonitored failures.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
