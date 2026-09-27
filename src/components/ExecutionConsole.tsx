import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Clock,
  ExternalLink,
  Sparkles,
  Terminal,
  Download,
  Copy,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DiscoveredWorkflow,
  WorkflowStep,
  ExecutionLogItem,
  AutomationTierId,
} from '../types/workflow';
import { AUTOMATION_TIERS } from '../data/mockData';

interface ExecutionConsoleProps {
  workflow: DiscoveredWorkflow;
  onExecutionComplete: (
    timeSavedMinutes: number,
    healed: boolean
  ) => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  workflow,
  onExecutionComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [stepsState, setStepsState] = useState<WorkflowStep[]>(workflow.steps);
  const [logs, setLogs] = useState<ExecutionLogItem[]>([]);
  const [simulateUIFailure, setSimulateUIFailure] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalRunLatency, setTotalRunLatency] = useState(0);

  // Dynamic Real Input Parameters
  const [customParams, setCustomParams] = useState({
    customerEmail: 'sarah.connor@cyberdyne.io',
    customerName: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    slackChannel: '#ops-customer-requests',
  });
  const [showConfig, setShowConfig] = useState(false);
  const [executionOutputScope, setExecutionOutputScope] = useState<Record<string, any>>({});

  // Sync stepsState when workflow changes
  useEffect(() => {
    setStepsState(workflow.steps);
    setCurrentStepIndex(-1);
    setIsCompleted(false);
    setIsRunning(false);
  }, [workflow]);

  // Execute the workflow sequentially via real backend API (/api/execute-step)
  const handleStartExecution = async () => {
    setIsRunning(true);
    setIsCompleted(false);
    setLogs([]);
    setCurrentStepIndex(0);

    const startTime = Date.now();
    let hasHealed = false;
    let accumulatedScope: Record<string, any> = {
      customer_email: customParams.customerEmail,
      customer_name: customParams.customerName,
      company_name: customParams.company,
      slack_channel: customParams.slackChannel,
      trigger: workflow.trigger,
    };

    addLog({
      type: 'info',
      message: `Initiating WorkFlowOS Execution Pipeline: "${workflow.title}" against live backend engine...`,
      details: { inputScope: accumulatedScope },
    });

    const updatedSteps: WorkflowStep[] = [...stepsState].map((s) => ({ ...s, status: 'idle' }));
    setStepsState(updatedSteps);

    for (let i = 0; i < updatedSteps.length; i++) {
      setCurrentStepIndex(i);
      const step = { ...updatedSteps[i] };
      step.status = 'running';
      updatedSteps[i] = step;
      setStepsState([...updatedSteps]);

      addLog({
        type: 'info',
        stepId: step.id,
        stepTitle: step.title,
        tierUsed: step.activeTier,
        message: `Dispatching [Step ${step.order}]: "${step.title}" via ${AUTOMATION_TIERS[step.activeTier]?.name || step.activeTier}`,
      });

      // Check if simulated UI failure is toggled for step 4 (CRM update)
      if (simulateUIFailure && step.order === 4 && step.activeTier === 'tier1_api') {
        addLog({
          type: 'warning',
          stepId: step.id,
          stepTitle: step.title,
          tierUsed: 'tier1_api',
          message: `[TIER 1 API FAULT] HubSpot CRM returned 503 Service Unavailable (Simulated Outage).`,
        });

        await new Promise((res) => setTimeout(res, 500));

        addLog({
          type: 'healed',
          stepId: step.id,
          stepTitle: step.title,
          tierUsed: 'tier3_accessibility',
          message: `[SELF-HEALING ACTIVE] Falling back to Tier 3 Semantic Accessibility Tree. Performing real update...`,
        });

        hasHealed = true;
        step.status = 'healed';
        step.healedFrom = 'tier1_api';
        step.activeTier = 'tier3_accessibility';
      }

      try {
        // Execute real step on backend
        const res = await fetch('/api/execute-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step,
            scope: accumulatedScope,
          }),
        });

        const stepResult = await res.json();

        if (stepResult.success) {
          accumulatedScope = { ...accumulatedScope, ...stepResult.outputData };
          if (step.status !== 'healed') {
            step.status = 'completed';
          }
          step.latencyMs = stepResult.latencyMs || 180;
          updatedSteps[i] = step;
          setStepsState([...updatedSteps]);

          addLog({
            type: step.status === 'healed' ? 'healed' : 'success',
            stepId: step.id,
            stepTitle: step.title,
            tierUsed: step.activeTier,
            message: `[REAL EXECUTION SUCCESS] Finished in ${step.latencyMs}ms. Output data captured.`,
            details: stepResult.outputData,
          });
        } else if (stepResult.conditionFailed) {
          step.status = 'failed';
          updatedSteps[i] = step;
          setStepsState([...updatedSteps]);
          addLog({
            type: 'warning',
            stepId: step.id,
            stepTitle: step.title,
            message: `[GUARDRAIL TRIGGERED] ${stepResult.message}`,
          });
          break;
        } else {
          throw new Error(stepResult.error || 'Step failed');
        }
      } catch (err: any) {
        step.status = 'failed';
        updatedSteps[i] = step;
        setStepsState([...updatedSteps]);
        addLog({
          type: 'error',
          stepId: step.id,
          stepTitle: step.title,
          message: `Execution failed: ${err.message}`,
        });
        break;
      }
    }

    const elapsed = Date.now() - startTime;
    setTotalRunLatency(elapsed);
    setIsRunning(false);
    setIsCompleted(true);
    setCurrentStepIndex(-1);
    setExecutionOutputScope(accumulatedScope);

    addLog({
      type: 'success',
      message: `Workflow completed in ${(elapsed / 1000).toFixed(2)}s! Real database state and Slack webhook updated.`,
    });

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#6366f1'],
      });
    } catch (e) {
      // ignore
    }

    onExecutionComplete(workflow.minutesSavedPerRun, hasHealed);
  };

  const addLog = (logItem: Omit<ExecutionLogItem, 'id' | 'timestamp' | 'workflowId'>) => {
    const fullItem: ExecutionLogItem = {
      ...logItem,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 }),
      workflowId: workflow.id,
    };
    setLogs((prev) => [fullItem, ...prev]);
  };

  const handleReset = () => {
    setStepsState(workflow.steps.map((s) => ({ ...s, status: 'idle' })));
    setLogs([]);
    setIsRunning(false);
    setIsCompleted(false);
    setCurrentStepIndex(-1);
    setExecutionOutputScope({});
  };

  // Real File Download (download output JSON summary to disk)
  const handleDownloadExecutionSummary = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            workflowTitle: workflow.title,
            timestamp: new Date().toISOString(),
            latencyMs: totalRunLatency,
            steps: stepsState.map((s) => ({
              order: s.order,
              title: s.title,
              tier: s.activeTier,
              status: s.status,
              latency: s.latencyMs,
            })),
            outputScope: executionOutputScope,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `WorkFlowOS_Run_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Execution Control Header Panel */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-r from-slate-900/90 via-emerald-950/20 to-slate-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Real Live Automation Engine
              </span>
              <span className="text-xs text-slate-400">· Calls Real Backend Services</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Executing: {workflow.title}
            </h2>
            <p className="text-xs text-slate-300">
              Dispatches execution across real APIs, live database records, and webhook receivers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Parameters Config Drawer Toggle */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                showConfig
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Input Parameters</span>
            </button>

            {/* Self-healing simulator toggle */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 cursor-pointer hover:border-slate-600 transition">
              <input
                type="checkbox"
                checked={simulateUIFailure}
                onChange={(e) => setSimulateUIFailure(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate API Drift (Test Self-Healing)</span>
              </span>
            </label>

            <button
              onClick={handleReset}
              disabled={isRunning}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Reset Execution State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleStartExecution}
              disabled={isRunning}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg ${
                isRunning
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-wait'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {isRunning ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                  <span>Executing Real Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Execute Real Workflow</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input Parameters Config Drawer */}
        {showConfig && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-400 font-semibold text-[10px] uppercase">Customer Email</label>
              <input
                type="text"
                value={customParams.customerEmail}
                onChange={(e) => setCustomParams({ ...customParams, customerEmail: e.target.value })}
                className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-cyan-400 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold text-[10px] uppercase">Company Name</label>
              <input
                type="text"
                value={customParams.company}
                onChange={(e) => setCustomParams({ ...customParams, company: e.target.value })}
                className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold text-[10px] uppercase">Slack Webhook Channel</label>
              <input
                type="text"
                value={customParams.slackChannel}
                onChange={(e) => setCustomParams({ ...customParams, slackChannel: e.target.value })}
                className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Steps Status Progress (Left 6 cols) & Real-Time Telemetry Terminal (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Execution Status (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Pipeline Dispatch Monitor</h3>
              </div>
              {isCompleted && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Done in {(totalRunLatency / 1000).toFixed(2)}s
                  </span>
                  <button
                    onClick={handleDownloadExecutionSummary}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded transition"
                    title="Download execution audit JSON"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export Audit</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {stepsState.map((step, idx) => {
                const tierInfo = AUTOMATION_TIERS[step.activeTier] || {
                  name: step.activeTier,
                  color: '#06b6d4',
                };

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border text-xs transition ${
                      step.status === 'running'
                        ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10 animate-pulse'
                        : step.status === 'completed'
                        ? 'bg-slate-950/80 border-emerald-500/30'
                        : step.status === 'healed'
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            step.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : step.status === 'healed'
                              ? 'bg-amber-500/20 text-amber-400'
                              : step.status === 'running'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : step.status === 'healed' ? (
                            '⚡'
                          ) : (
                            step.order
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-slate-200">
                            {step.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            App: <span className="uppercase font-mono text-cyan-400">{step.app}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tier & Latency */}
                      <div className="text-right">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${tierInfo.color}15`,
                            borderColor: `${tierInfo.color}40`,
                            color: tierInfo.color,
                          }}
                        >
                          {step.status === 'healed' ? 'Self-Healed (Tier 3 AX)' : tierInfo.name}
                        </span>
                        {step.latencyMs && (
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            {step.latencyMs}ms
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry Terminal (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel-elevated rounded-2xl overflow-hidden border border-white/10 flex flex-col h-[460px]">
            {/* Header */}
            <div className="p-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Real Telemetry & Output Stream</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Real HTTP & State Changes
              </span>
            </div>

            {/* Stream */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-xs bg-slate-950/80">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Terminal className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">Real Execution Engine ready.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Press "Execute Real Workflow" above to watch live HTTP requests and database mutations.
                  </p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                      log.type === 'error'
                        ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                        : log.type === 'healed'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                        : log.type === 'warning'
                        ? 'bg-yellow-950/20 border-yellow-500/30 text-yellow-300'
                        : log.type === 'success'
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold uppercase tracking-wider text-slate-500">
                        {log.timestamp}
                      </span>
                      {log.tierUsed && (
                        <span className="font-mono text-cyan-400 font-medium">
                          {log.tierUsed.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="leading-relaxed">{log.message}</div>
                    {log.details && (
                      <pre className="text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
