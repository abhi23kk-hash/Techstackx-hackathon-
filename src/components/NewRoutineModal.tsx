import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Mail,
  HardDrive,
  Users,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { DesktopEvent } from '../types/workflow';

interface NewRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetKey: string) => void;
  onCustomSynthesize: (title: string, notes: string) => void;
}

export const NewRoutineModal: React.FC<NewRoutineModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onCustomSynthesize,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel-elevated rounded-2xl max-w-2xl w-full border border-white/20 p-6 space-y-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              WorkFlowOS Discovery Simulator
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Simulate or Synthesize a Desktop Workflow
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a multi-application scenario or describe any routine for the AI agent to synthesize.
          </p>
        </div>

        {/* Presets Grid */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-300">Curated Enterprise Scenarios</div>

          {/* Preset 1 */}
          <div
            onClick={() => {
              onSelectPreset('customer-request');
              onClose();
            }}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white group-hover:text-cyan-300">
                <span>Customer PO Request Ingestion</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Prize Scenario
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gmail Inbound PO ➔ Download PDF to Disk ➔ Query Customer in CRM ➔ Attach Document ➔ Slack Alert.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-2">
              <span>Gmail</span> · <span>Downloads</span> · <span>HubSpot</span> · <span>Slack</span>
            </div>
          </div>

          {/* Preset 2 */}
          <div
            onClick={() => {
              onSelectPreset('invoice-reconcile');
              onClose();
            }}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white group-hover:text-cyan-300">
                <span>Vendor Invoice PDF Extraction & Ledger Reconcile</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              PDF Invoice Parsing ➔ Stripe Payment Verification ➔ Excel Row Append ➔ Finance Alert.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-2">
              <span>Finder</span> · <span>Stripe</span> · <span>Excel</span> · <span>Slack</span>
            </div>
          </div>

          {/* Preset 3 */}
          <div
            onClick={() => {
              onSelectPreset('lead-enrichment');
              onClose();
            }}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white group-hover:text-cyan-300">
                <span>Lead Routing & SDR Alerting</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Web Form Ingestion ➔ Clearbit Domain Enrichment ➔ Salesforce Insertion ➔ Slack Direct Message.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-2">
              <span>Browser</span> · <span>Salesforce CRM</span> · <span>Slack</span>
            </div>
          </div>
        </div>

        {/* Custom Input */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Or describe any custom routine:</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="e.g. Daily Shipping Manifest Sync"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <textarea
              placeholder="Describe the steps or apps (e.g. In FedEx portal, copy tracking numbers, open Airtable, update status, and text warehouse manager via Twilio)..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <button
            onClick={() => {
              if (customTitle.trim()) {
                onCustomSynthesize(customTitle, customNotes);
                onClose();
              }
            }}
            disabled={!customTitle.trim()}
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 transition"
          >
            Synthesize Custom Routine
          </button>
        </div>
      </div>
    </div>
  );
};
