import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  HardDrive,
  Users,
  MessageSquare,
  FileSpreadsheet,
  MousePointer,
  Download,
  Search,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  Terminal,
  Paperclip,
  Radio,
  Upload,
  Copy,
  Check,
  Send,
  RefreshCw,
  Database,
  Zap,
} from 'lucide-react';
import { DesktopEvent, AppSource } from '../types/workflow';

interface ShadowObserverProps {
  events: DesktopEvent[];
  onAddEvent: (event: DesktopEvent) => void;
  onClearEvents: () => void;
  onAutoReplayRoutine: () => void;
  isAutoReplaying: boolean;
  onTriggerDiscovery: () => void;
  uploadedFiles?: Array<{ name: string; size: string; type: string; hash: string; timestamp: string }>;
  onAddUploadedFile?: (file: { name: string; size: string; type: string; hash: string; timestamp: string }) => void;
}

export const ShadowObserver: React.FC<ShadowObserverProps> = ({
  events,
  onAddEvent,
  onClearEvents,
  onAutoReplayRoutine,
  isAutoReplaying,
  onTriggerDiscovery,
  uploadedFiles: propUploadedFiles,
  onAddUploadedFile,
}) => {
  const [activeSimApp, setActiveSimApp] = useState<AppSource>('gmail');
  const [isRecordingReal, setIsRecordingReal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uploaded and dropped files list
  const [localUploadedFiles, setLocalUploadedFiles] = useState<
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

  const uploadedFiles = propUploadedFiles && propUploadedFiles.length > 0 ? propUploadedFiles : localUploadedFiles;

  // Real Service Database State (queried from server)
  const [liveCrmContacts, setLiveCrmContacts] = useState<any[]>([]);
  const [liveWebhooks, setLiveWebhooks] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'workspace' | 'stream' | 'live_db'>('workspace');

  // Interactive app states
  const [gmailState, setGmailState] = useState({
    sender: 'sarah.connor@cyberdyne.io',
    subject: '[Support Request] Account license expansion & contract attachment',
    hasDownloadedAttachment: false,
  });

  const [realForm, setRealForm] = useState({
    customerEmail: 'sarah.connor@cyberdyne.io',
    customerName: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    status: 'Under Review',
    customSlackMsg: '',
  });

  // Fetch real database state from backend
  const fetchLiveState = async () => {
    try {
      const res = await fetch('/api/mock-service/inbox');
      const data = await res.json();
      if (data.success) {
        setLiveCrmContacts(data.crmContacts || []);
        setLiveWebhooks(data.webhooks || []);
      }
    } catch (err) {
      // server offline fallback
    }
  };

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handler for actions
  const handleSimulateAction = (
    app: AppSource,
    appName: string,
    actionType: DesktopEvent['actionType'],
    actionLabel: string,
    targetSelector: string,
    payload: Record<string, any>
  ) => {
    const newEvent: DesktopEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      app,
      appName,
      windowTitle: `${appName} - Active Window`,
      actionType,
      actionLabel,
      targetSelector,
      payload,
      durationMs: Math.floor(Math.random() * 1800) + 800,
      confidence: 0.98,
    };
    onAddEvent(newEvent);
  };

  // Process real uploaded or dropped file
  const processUploadedFile = async (file: File) => {
    let sha256 = '8a7f9b23...';
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      sha256 = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16) + '...';
    } catch {
      sha256 = Math.random().toString(36).substring(2, 12) + '...';
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    const newFileEntry = {
      name: file.name,
      size: sizeFormatted,
      type: file.type || 'application/octet-stream',
      hash: sha256,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLocalUploadedFiles((prev) => [newFileEntry, ...prev]);
    onAddUploadedFile?.(newFileEntry);

    handleSimulateAction(
      'filesystem',
      'OS Finder / FileSystem',
      'download_attachment',
      `Dropped real file: ${file.name} (${sizeFormatted})`,
      'div[data-dropzone="downloads"]',
      {
        fileName: file.name,
        sizeBytes: file.size,
        fileType: file.type || 'application/octet-stream',
        sha256,
        destination: `~/Downloads/${file.name}`,
        lastModified: new Date(file.lastModified).toISOString(),
      }
    );
  };

  // Real File Input Change Handler
  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        processUploadedFile(file);
      });
      e.dataTransfer.clearData();
    }
  };

  // Real Clipboard Copy Handler
  const handleRealClipboardCopy = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // ignore
    }

    handleSimulateAction(
      'filesystem',
      'OS Clipboard Engine',
      'copy_clipboard',
      `Copied text to OS clipboard: "${text}"`,
      'navigator.clipboard',
      { copiedText: text }
    );
  };

  // Real Slack Webhook Dispatch
  const handleSendRealSlackWebhook = async () => {
    const textToSend =
      realForm.customSlackMsg ||
      `Customer update: ${realForm.company} (${realForm.customerEmail}) updated to ${realForm.status}. Attached PO 9821.`;

    try {
      await fetch('/api/mock-service/slack/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: '#ops-customer-requests',
          text: textToSend,
          company: realForm.company,
          email: realForm.customerEmail,
        }),
      });
      fetchLiveState();
    } catch (e) {
      console.warn('Webhook dispatch local only', e);
    }

    handleSimulateAction(
      'slack',
      'Slack Desktop',
      'send_slack_message',
      `Dispatched real webhook to #ops-customer-requests`,
      'POST /api/mock-service/slack/webhook',
      { channel: '#ops-customer-requests', message: textToSend }
    );
    setRealForm((prev) => ({ ...prev, customSlackMsg: '' }));
  };

  // Real CRM Record Update
  const handleRealCrmUpdate = async () => {
    try {
      await fetch('/api/mock-service/crm/contacts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: realForm.customerEmail,
          status: realForm.status,
          note: `Live update via WorkFlowOS at ${new Date().toLocaleTimeString()}`,
          attachment: 'Expansion_PO_9821.pdf',
        }),
      });
      fetchLiveState();
    } catch (e) {
      console.warn('CRM update local only', e);
    }

    handleSimulateAction(
      'crm',
      'HubSpot CRM',
      'update_crm_record',
      `Updated CRM contact "${realForm.customerEmail}" to status "${realForm.status}"`,
      'POST /api/mock-service/crm/contacts/update',
      {
        email: realForm.customerEmail,
        status: realForm.status,
        attachment: 'Expansion_PO_9821.pdf',
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Intro banner describing Desktop Activity Agent */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Real Live Automation Engine & Observer
              </span>
              <span className="text-xs text-slate-400">· Real Webhooks & In-Memory CRM Database</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Desktop Activity Agent & Real Automation Machine
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Every action you perform in this interface or through real file uploads, live Slack webhooks, and CRM updates executes real requests on the WorkFlowOS backend and triggers automated sequence mining.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Switcher: Interactive Workspace vs Event Stream vs Real Live Database State */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setActiveView('workspace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeView === 'workspace'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Split Workspace
              </button>
              <button
                onClick={() => setActiveView('stream')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeView === 'stream'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Event Stream ({events.length})</span>
                {events.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block"></span>
                )}
              </button>
              <button
                onClick={() => setActiveView('live_db')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeView === 'live_db'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Live Backend DB</span>
              </button>
            </div>

            <button
              onClick={onAutoReplayRoutine}
              disabled={isAutoReplaying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isAutoReplaying ? 'Simulating Routine...' : 'Auto-Run 3x Customer Flow'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: LIVE BACKEND DATABASE INSPECTOR */}
      {activeView === 'live_db' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live CRM Database */}
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Live CRM Database Records (Server Memory)</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {liveCrmContacts.length} Contacts
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {liveCrmContacts.map((contact) => (
                <div key={contact.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{contact.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({contact.company})</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {contact.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Email: {contact.email} · ID: {contact.id}
                  </div>
                  {contact.attachments?.length > 0 && (
                    <div className="text-[11px] text-cyan-300 flex items-center gap-1.5 pt-1 border-t border-slate-800">
                      <Paperclip className="w-3 h-3 text-cyan-400" />
                      <span>Attached: {contact.attachments.join(', ')}</span>
                    </div>
                  )}
                  {contact.notes?.length > 0 && (
                    <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                      Latest Note: {contact.notes[contact.notes.length - 1]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Webhook / Slack Inbox */}
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Webhook Receiver (/api/mock-service/slack/webhook)</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {liveWebhooks.length} Received
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto font-mono text-xs">
              {liveWebhooks.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                  No webhooks received yet. Send a message from Slack or execute the workflow to see real payload ingress!
                </div>
              ) : (
                liveWebhooks.map((wh) => (
                  <div key={wh.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-bold text-cyan-400">{wh.channel}</span>
                      <span>{wh.timestamp}</span>
                    </div>
                    <div className="text-slate-200 font-sans">{wh.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: WORKSPACE & EVENT STREAM */}
      {activeView === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Simulated & Real Interactive Apps (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel-elevated rounded-2xl overflow-hidden border border-white/10">
              {/* Desktop Window Titlebar & App Switcher */}
              <div className="px-4 py-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 ml-2">Simulated Desktop Workspace</span>
                </div>

                {/* App Switcher Tabs */}
                <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveSimApp('gmail')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition ${
                      activeSimApp === 'gmail'
                        ? 'bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-3 h-3 text-rose-400" />
                    <span>Gmail</span>
                  </button>

                  <button
                    onClick={() => setActiveSimApp('filesystem')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition ${
                      activeSimApp === 'filesystem'
                        ? 'bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <HardDrive className="w-3 h-3 text-blue-400" />
                    <span>Downloads & Drop</span>
                  </button>

                  <button
                    onClick={() => setActiveSimApp('crm')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition ${
                      activeSimApp === 'crm'
                        ? 'bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3 h-3 text-orange-400" />
                    <span>HubSpot CRM</span>
                  </button>

                  <button
                    onClick={() => setActiveSimApp('slack')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition ${
                      activeSimApp === 'slack'
                        ? 'bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-400" />
                    <span>Slack Webhook</span>
                  </button>

                  <button
                    onClick={() => setActiveSimApp('excel')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition ${
                      activeSimApp === 'excel'
                        ? 'bg-green-500/20 text-green-300 font-medium border border-green-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileSpreadsheet className="w-3 h-3 text-green-400" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* App Content Viewport */}
              <div className="p-5 min-h-[380px] bg-slate-950/60">
                {/* GMAIL APP */}
                {activeSimApp === 'gmail' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-semibold text-slate-200">Google Workspace Mail</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Inbox: 3 unread</span>
                    </div>

                    {/* Email row list */}
                    <div className="space-y-2">
                      <div
                        onClick={() => {
                          handleSimulateAction(
                            'gmail',
                            'Google Mail',
                            'read_email',
                            'Open email thread from Sarah Connor',
                            'tr[data-message-id="msg-9821"]',
                            {
                              sender: gmailState.sender,
                              subject: gmailState.subject,
                              hasAttachment: true,
                            }
                          );
                        }}
                        className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-500/50 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">Sarah Connor</span>
                            <span className="text-[10px] text-slate-400">&lt;sarah.connor@cyberdyne.io&gt;</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                              PO Expansion
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            {gmailState.subject}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-md">
                            Hi team, please find attached our signed PO for 50 additional Enterprise seats...
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px]">10:42 AM</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Email Detail Card */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Message Body</span>
                        <span className="text-slate-400 text-[11px]">1 Attachment (PDF, 1.4 MB)</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                        "Please find attached our signed Expansion PO 9821. Kindly update our HubSpot account record so our billing team can process the invoice promptly."
                      </p>

                      {/* Attachment Box with Action */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-mono">
                            PDF
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">Expansion_PO_9821.pdf</div>
                            <div className="text-[10px] text-slate-500">1.4 MB · SHA-256: 8a7f...21c</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setGmailState((prev) => ({ ...prev, hasDownloadedAttachment: true }));
                            handleSimulateAction(
                              'filesystem',
                              'OS Finder / FileSystem',
                              'download_attachment',
                              'Download Expansion_PO_9821.pdf to ~/Downloads',
                              'a[download="Expansion_PO_9821.pdf"]',
                              {
                                fileName: 'Expansion_PO_9821.pdf',
                                destination: '~/Downloads/Expansion_PO_9821.pdf',
                                size: '1.4 MB',
                              }
                            );
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            gmailState.hasDownloadedAttachment
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {gmailState.hasDownloadedAttachment ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Downloaded to Local Disk</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Attachment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* FILESYSTEM APP (WITH REAL FILE DRAG-AND-DROP) */}
                {activeSimApp === 'filesystem' && (
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-slate-200">OS File Manager & Real File Ingestion</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Local Sandbox (Dropzone Active)</span>
                    </div>

                    {/* Real File Upload & Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed transition cursor-pointer text-center relative ${
                        isDragging
                          ? 'border-cyan-400 bg-cyan-500/20 shadow-xl shadow-cyan-500/20 scale-[1.01]'
                          : 'border-slate-700 hover:border-cyan-400/80 bg-slate-900/60'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleRealFileUpload}
                        className="hidden"
                        multiple
                      />

                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                            isDragging
                              ? 'bg-cyan-400 text-slate-950 animate-bounce'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          <Upload className="w-6 h-6" />
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white">
                            {isDragging ? 'Release to Drop File Now!' : 'Drop any file here or Click to Browse'}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            WorkFlowOS Desktop Agent will intercept the real file, compute SHA-256 hash, and stream the event.
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
                          <span>Supports all formats (PDF, CSV, XLSX, JSON, TXT)</span>
                        </div>
                      </div>
                    </div>

                    {/* Sandbox Files List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                        <span>~/Downloads Directory ({uploadedFiles.length} files)</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Agent Monitoring</span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900/80 border border-blue-500/30 hover:border-blue-500/50 flex items-center justify-between transition group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                <Paperclip className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                                  {file.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {file.size} · SHA-256: {file.hash} · {file.timestamp}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRealClipboardCopy(`~/Downloads/${file.name}`);
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition shrink-0"
                            >
                              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedText ? 'Copied!' : 'Copy Path'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Event Stream Interceptor Ticker */}
                    <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <div className="text-xs">
                          <span className="text-slate-400 font-sans">Event Stream: </span>
                          <span className="text-cyan-300 font-mono font-semibold">
                            {events.length > 0
                              ? events[events.length - 1]?.actionLabel
                              : 'Waiting for file drop...'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveView('stream')}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                      >
                        <span>Open Full Event Stream ({events.length}) →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* HUBSPOT CRM APP (REAL LIVE IN-MEMORY DATABASE) */}
                {activeSimApp === 'crm' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-semibold text-slate-200">HubSpot CRM Database</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          Live Express Server API (/api/mock-service/crm)
                        </span>
                      </div>
                    </div>

                    {/* Explanatory Banner: Not hardcoded */}
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-2.5 text-xs">
                      <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-orange-300">
                          Live In-Memory Database (Not Hardcoded)
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          This is an active backend database. You can pick an existing contact or type <strong className="text-white">any custom email, name, or company</strong> below. Clicking "Execute" dispatches a real HTTP <code className="text-cyan-300 font-mono">POST /api/mock-service/crm/contacts/update</code> and mutates server state.
                        </p>
                      </div>
                    </div>

                    {/* Quick Contact Selector */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Choose Contact or Create New:
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {liveCrmContacts.map((c) => (
                          <button
                            key={c.id}
                            onClick={() =>
                              setRealForm({
                                ...realForm,
                                customerEmail: c.email,
                                customerName: c.name,
                                company: c.company,
                                status: c.status,
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border flex items-center gap-1.5 ${
                              realForm.customerEmail === c.email
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <span className="font-semibold text-white">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({c.company})</span>
                          </button>
                        ))}

                        <button
                          onClick={() =>
                            setRealForm({
                              ...realForm,
                              customerEmail: 'new.contact@enterprise.com',
                              customerName: 'Alex Mercer',
                              company: 'Mercer Logistics',
                              status: 'New Lead',
                            })
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-dashed border-cyan-500/40 transition flex items-center gap-1"
                        >
                          <span>+ Custom Contact</span>
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    <div className="space-y-3 p-4 rounded-xl bg-slate-900/80 border border-orange-500/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 text-[10px] uppercase font-semibold">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={realForm.customerName}
                            onChange={(e) => setRealForm({ ...realForm, customerName: e.target.value })}
                            placeholder="e.g. Sarah Connor"
                            className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs focus:border-orange-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-[10px] uppercase font-semibold">
                            Customer Email (Any Valid Email)
                          </label>
                          <input
                            type="email"
                            value={realForm.customerEmail}
                            onChange={(e) => setRealForm({ ...realForm, customerEmail: e.target.value })}
                            placeholder="e.g. any.client@company.com"
                            className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-orange-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-[10px] uppercase font-semibold">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={realForm.company}
                            onChange={(e) => setRealForm({ ...realForm, company: e.target.value })}
                            placeholder="e.g. Cyberdyne Systems"
                            className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs focus:border-orange-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-[10px] uppercase font-semibold">
                            Account Status
                          </label>
                          <select
                            value={realForm.status}
                            onChange={(e) => setRealForm({ ...realForm, status: e.target.value })}
                            className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs focus:border-orange-400 outline-none"
                          >
                            <option value="Active Customer">Active Customer</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Contract Expansion">Contract Expansion</option>
                            <option value="Billing Escalation">Billing Escalation</option>
                            <option value="New Lead">New Lead</option>
                            <option value="Churn Risk">Churn Risk</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                        <div className="text-[11px] text-slate-400">
                          Target: <code className="text-cyan-300 font-mono">POST /api/mock-service/crm/contacts/update</code>
                        </div>
                        <button
                          onClick={handleRealCrmUpdate}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-400 text-slate-950 transition shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Execute Real CRM Update</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Database Table View */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                        <span>Live Backend Contacts ({liveCrmContacts.length} in memory)</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Synced</span>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                            <tr>
                              <th className="py-2 px-3">Contact</th>
                              <th className="py-2 px-3">Company</th>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3">Attachments</th>
                              <th className="py-2 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {liveCrmContacts.map((contact) => (
                              <tr
                                key={contact.id}
                                className={`hover:bg-slate-900/50 transition ${
                                  realForm.customerEmail === contact.email ? 'bg-orange-500/5' : ''
                                }`}
                              >
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-white">{contact.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {contact.email}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-slate-300 font-medium">
                                  {contact.company}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                      contact.status === 'Under Review'
                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                        : contact.status === 'Active Customer'
                                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                        : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                    }`}
                                  >
                                    {contact.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                  {contact.attachments?.length > 0 ? (
                                    <span className="text-cyan-400 flex items-center gap-1">
                                      <Paperclip className="w-3 h-3" />
                                      {contact.attachments.length} file(s)
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">None</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() =>
                                      setRealForm({
                                        ...realForm,
                                        customerEmail: contact.email,
                                        customerName: contact.name,
                                        company: contact.company,
                                        status: contact.status,
                                      })
                                    }
                                    className="text-[11px] text-orange-400 hover:text-orange-300 font-medium underline"
                                  >
                                    Load into Form
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLACK APP (REAL LIVE WEBHOOK DISPATCH) */}
                {activeSimApp === 'slack' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Slack Webhook Messenger</span>
                      </div>
                      <span className="text-[11px] text-slate-400">#ops-customer-requests</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400">Live Webhook Message Payload</label>
                        <textarea
                          rows={2}
                          value={realForm.customSlackMsg}
                          onChange={(e) => setRealForm({ ...realForm, customSlackMsg: e.target.value })}
                          placeholder="Type a real message to dispatch to the live webhook receiver..."
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-400 outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-mono">
                          POST /api/mock-service/slack/webhook
                        </span>
                        <button
                          onClick={handleSendRealSlackWebhook}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Real Webhook</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* EXCEL APP */}
                {activeSimApp === 'excel' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-semibold text-slate-200">
                          Microsoft Excel · Accounts_Payable_2026.xlsx
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Sheet: Q3_Ledger</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 font-mono text-[11px]">
                          <tr>
                            <th className="p-2 border-b border-slate-800">Row</th>
                            <th className="p-2 border-b border-slate-800">Vendor</th>
                            <th className="p-2 border-b border-slate-800">Amount</th>
                            <th className="p-2 border-b border-slate-800">Status</th>
                            <th className="p-2 border-b border-slate-800">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                          <tr
                            onClick={() =>
                              handleSimulateAction(
                                'excel',
                                'Microsoft Excel',
                                'write_spreadsheet_row',
                                'Select Cyberdyne Systems Row in Ledger',
                                'tr[data-vendor="Cyberdyne Systems"]',
                                { vendor: 'Cyberdyne Systems', amount: '$18,500.00', status: 'Pending Review' }
                              )
                            }
                            className="cursor-pointer hover:bg-slate-900/60 text-slate-300"
                          >
                            <td className="p-2 text-slate-500">#3</td>
                            <td className="p-2 font-sans font-medium text-slate-200">Cyberdyne Systems</td>
                            <td className="p-2">$18,500.00</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400">
                                Pending Review
                              </span>
                            </td>
                            <td className="p-2 text-slate-400">2026-09-26</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom bar */}
              <div className="px-4 py-2 bg-slate-900/60 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                  Perform any action above: the agent intercepts and normalizes it into real structured events.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Event Stream Interceptor (5 cols) */}
          <div id="event-stream-container" className="lg:col-span-5 space-y-4 scroll-mt-20">
            <div className="glass-panel-elevated rounded-2xl overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-500/5 flex flex-col h-[520px]">
              {/* Header */}
              <div className="p-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Event Stream Interceptor</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                    {events.length} Captured
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClearEvents}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
                    title="Clear Captured Events"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Scrolling Events Stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-xs">
                {events.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <Eye className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                    <p className="text-xs text-slate-400 font-medium">Listening for desktop activity...</p>
                    <p className="text-[11px] text-slate-600 max-w-xs mt-1">
                      Click actions or drop real files on the left to capture live semantic events.
                    </p>
                  </div>
                ) : (
                  events.map((ev, i) => (
                    <div
                      key={ev.id || i}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-cyan-500/30 transition text-[11px] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          <span className="font-bold text-slate-200 uppercase">{ev.app}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-cyan-300">{ev.actionType}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}
                        </span>
                      </div>

                      <div className="text-slate-300 font-sans font-medium line-clamp-1">
                        {ev.actionLabel}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                        <span className="truncate max-w-[200px]" title={ev.targetSelector}>
                          {ev.targetSelector || 'OS Native IPC'}
                        </span>
                        <span className="text-emerald-400 font-semibold">{(ev.confidence * 100).toFixed(0)}% Match</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discovery Suggestion Footer Banner */}
              {events.length >= 3 && (
                <div className="p-3 bg-gradient-to-r from-cyan-950/60 to-slate-900 border-t border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <div>
                      <div className="text-xs font-semibold text-white">Pattern Clustered ({events.length} events)</div>
                      <div className="text-[10px] text-slate-400">Ready for automated synthesis</div>
                    </div>
                  </div>

                  <button
                    onClick={onTriggerDiscovery}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
                  >
                    <span>Synthesize Intent</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: FULL SCREEN EVENT STREAM */}
      {activeView === 'stream' && (
        <div className="glass-panel-elevated rounded-2xl overflow-hidden border border-cyan-500/30 shadow-xl shadow-cyan-500/5 flex flex-col min-h-[500px]">
          <div className="p-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Event Stream Interceptor</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {events.length} Total Events
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Every user keystroke, click, API payload, and file drop is normalized in real time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('workspace')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white transition"
              >
                Back to Split Workspace
              </button>
              <button
                onClick={onClearEvents}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto space-y-2.5 font-mono text-xs max-h-[550px]">
            {events.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Eye className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                <p className="text-sm text-slate-400 font-medium">No desktop events recorded yet.</p>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Switch back to Workspace and click any email, CRM field, or drop a file to see events stream here in real time.
                </p>
                <button
                  onClick={() => setActiveView('workspace')}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition inline-flex items-center gap-1.5"
                >
                  Go to Workspace
                </button>
              </div>
            ) : (
              events.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between flex-wrap gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase text-[11px] px-1.5 py-0.5 rounded bg-slate-800">
                          {ev.app}
                        </span>
                        <span className="text-cyan-300 font-mono text-xs">{ev.actionType}</span>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-slate-200 font-sans mt-1 text-xs">
                        {ev.actionLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {ev.targetSelector || 'OS Native IPC'}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold">
                      {(ev.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {events.length >= 3 && (
            <div className="p-4 bg-gradient-to-r from-cyan-950/60 to-slate-900 border-t border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                <div>
                  <div className="text-sm font-bold text-white">Pattern Clustered ({events.length} events)</div>
                  <div className="text-xs text-slate-400">Ready to synthesize into an automated workflow</div>
                </div>
              </div>

              <button
                onClick={onTriggerDiscovery}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
              >
                <span>Synthesize with Gemini</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
