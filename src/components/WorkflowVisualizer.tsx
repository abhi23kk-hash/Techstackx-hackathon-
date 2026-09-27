import React, { useState } from 'react';
import {
  Workflow,
  ShieldCheck,
  Zap,
  Play,
  ArrowRight,
  AlertTriangle,
  GitBranch,
  Layers,
  Settings2,
  CheckCircle2,
  Cpu,
  Eye,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  DiscoveredWorkflow,
  WorkflowStep,
  AutomationTierId,
} from '../types/workflow';
import { AUTOMATION_TIERS } from '../data/mockData';

interface WorkflowVisualizerProps {
  workflow: DiscoveredWorkflow;
  onExecuteWorkflow: (workflow: DiscoveredWorkflow) => void;
  onUpdateStepTier: (stepId: string, newTier: AutomationTierId) => void;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  workflow,
  onExecuteWorkflow,
  onUpdateStepTier,
}) => {
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(
    workflow.steps[0] || null
  );
  const [isTestingStep, setIsTestingStep] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestStepLive = async () => {
    if (!selectedStep) return;
    setIsTestingStep(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/execute-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: selectedStep,
          scope: {
            customer_email: 'sarah.connor@cyberdyne.io',
            company_name: 'Cyberdyne Systems',
            crm_contact_id: 'HB-90821-C',
            attachment_id: 'att_po_9821',
          },
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTestingStep(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header Panel */}
      <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                {workflow.category}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {workflow.steps.length} Steps · 5-Tier Resilient Ladder
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {workflow.title}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {workflow.intent}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onExecuteWorkflow(workflow)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run in Automation Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Visual Graph (Left 8 cols) & Fallback Ladder Inspector (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Node Graph Flow (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel-elevated rounded-2xl p-6 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Visual Execution Pipeline</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any step to inspect variables & tier ladder
              </span>
            </div>

            {/* Visual Node Diagram */}
            <div className="space-y-4 relative">
              {/* Trigger Node */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-md shadow-cyan-500/5 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold">
                        Trigger: Inbound OS Event
                      </div>
                      <div className="text-xs font-bold text-white">
                        {workflow.trigger.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
                    {workflow.trigger.sourceApp}
                  </span>
                </div>
              </div>

              {/* Connecting line */}
              <div className="flex justify-center -my-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500 to-indigo-500"></div>
              </div>

              {/* Step Nodes */}
              {workflow.steps.map((step, idx) => {
                const isSelected = selectedStep?.id === step.id;
                const tierInfo = AUTOMATION_TIERS[step.activeTier];

                return (
                  <React.Fragment key={step.id}>
                    <div
                      onClick={() => setSelectedStep(step)}
                      className={`p-4 rounded-xl cursor-pointer transition relative group ${
                        isSelected
                          ? 'bg-slate-900 border-2 border-cyan-400 shadow-xl shadow-cyan-500/10'
                          : 'bg-slate-900/70 border border-white/10 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0 mt-0.5">
                            {step.order}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                                {step.title}
                              </span>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                {step.app}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {step.description}
                            </p>

                            {/* Condition alert if present */}
                            {step.condition && (
                              <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                                <GitBranch className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Guardrail:</strong> {step.condition.description}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Active Tier Badge */}
                        <div className="shrink-0 text-right space-y-1">
                          <span
                            className="inline-block text-[11px] font-mono px-2 py-0.5 rounded border font-medium"
                            style={{
                              backgroundColor: `${tierInfo.color}15`,
                              borderColor: `${tierInfo.color}40`,
                              color: tierInfo.color,
                            }}
                          >
                            {tierInfo.badge}
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {tierInfo.reliability}% Reliability
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connecting line between steps */}
                    {idx < workflow.steps.length - 1 && (
                      <div className="flex justify-center -my-1">
                        <div className="w-0.5 h-6 bg-slate-700"></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step & 5-Tier Fallback Ladder Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Heuristic Execution Ladder</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                WorkFlowOS executes steps via the fastest reliable tier, automatically falling back if UI drifts.
              </p>
            </div>

            {selectedStep ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-white">
                    Step {selectedStep.order}: {selectedStep.title}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Application: <span className="text-cyan-400 font-mono uppercase">{selectedStep.app}</span>
                  </div>
                </div>

                {/* 5-Tier Ladder Options */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Available Automation Tiers</span>
                    <span className="text-[10px] text-slate-500">Fastest ➔ Resilient</span>
                  </div>

                  {Object.values(AUTOMATION_TIERS).map((tier) => {
                    const isAvailable = selectedStep.availableTiers.includes(tier.id);
                    const isActive = selectedStep.activeTier === tier.id;

                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          if (isAvailable) {
                            onUpdateStepTier(selectedStep.id, tier.id);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs transition ${
                          !isAvailable
                            ? 'opacity-40 cursor-not-allowed border-slate-800/40 bg-slate-950/40'
                            : isActive
                            ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/10 cursor-pointer'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tier.color }}
                            ></span>
                            <span className="font-semibold text-slate-200">{tier.name}</span>
                          </div>
                          {isActive && (
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          {tier.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-1.5 border-t border-slate-800/50">
                          <span>Latency: ~{tier.latencyMs}ms</span>
                          <span className="text-emerald-400">{tier.reliability}% Success</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input & Output Variables */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-slate-300">Variable Data Flow</div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="text-slate-400">
                      Inputs: <span className="text-cyan-300">{selectedStep.variablesIn.join(', ') || 'None'}</span>
                    </div>
                    <div className="text-slate-400">
                      Outputs: <span className="text-emerald-300">{selectedStep.variablesOut.join(', ') || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Real Test Step Live Button & Output */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    onClick={handleTestStepLive}
                    disabled={isTestingStep}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isTestingStep ? (
                      <>
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-cyan-300 border-t-transparent rounded-full" />
                        <span>Executing Step against Backend...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Test This Step Live on Backend</span>
                      </>
                    )}
                  </button>

                  {testResult && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-emerald-400 font-semibold">
                          {testResult.success ? '✓ Step Succeeded' : '✗ Failed'}
                        </span>
                        <span>{testResult.latencyMs}ms</span>
                      </div>
                      <pre className="text-slate-300 text-[10px] overflow-x-auto max-h-32 p-1.5 bg-slate-900 rounded">
                        {JSON.stringify(testResult.outputData || testResult.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs">
                Select a step on the left to configure tiers.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
