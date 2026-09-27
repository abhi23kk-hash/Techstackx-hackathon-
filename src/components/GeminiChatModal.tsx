import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Search,
  Bot,
  User as UserIcon,
  X,
  ExternalLink,
  Zap,
  Cpu,
  Brain,
  Trash2,
  CloudCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  content: string;
  modelUsed?: string;
  sources?: Array<{ title: string; url: string }>;
  searchQueries?: string[];
  timestamp: number;
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const { user, saveChatMessageToCloud } = useAuth();

  // Model selection options per requirements:
  // - gemini-3.1-pro-preview for particularly complex tasks
  // - gemini-3.5-flash for general tasks
  // - gemini-3.1-flash-lite for tasks that should happen fast
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'
  >('gemini-3.5-flash');

  // Search Grounding toggle per requirement:
  // "Use Google Search data - Use gemini-3.5-flash (with googleSearch tool)"
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false);

  // System instruction role
  const [selectedRole, setSelectedRole] = useState<'architect' | 'optimizer' | 'developer'>('architect');

  const ROLE_INSTRUCTIONS: Record<string, { title: string; instruction: string }> = {
    architect: {
      title: 'Automation Architect',
      instruction:
        'You are the Lead Automation Architect for WorkFlowOS. You guide users on identifying repetitive OS tasks, designing resilient multi-tier fallbacks (API -> DOM -> Accessibility Tree -> Vision -> OS Input), and structuring cross-app workflows.',
    },
    optimizer: {
      title: 'Heuristic Optimizer',
      instruction:
        'You are the Process Optimization Analyst. You analyze desktop telemetry, eliminate cognitive friction, calculate exact ROI (time and dollar savings), and identify API drift patterns.',
    },
    developer: {
      title: 'Script Synthesizer',
      instruction:
        'You are a Robotic Process Automation Engineer. You write clean, idempotent scripts, payload transformers, webhook listeners, and webhook integrations for WorkFlowOS pipelines.',
    },
  };

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content:
        'Hello! I am your WorkFlowOS Gemini Copilot. I can analyze desktop events, structure multi-tier automations, or search the live web for the latest API specifications. How can I help with your routine today?',
      modelUsed: 'gemini-3.5-flash',
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    if (user) {
      saveChatMessageToCloud(userMessage).catch(() => {});
    }

    try {
      const activeSystemInstruction = ROLE_INSTRUCTIONS[selectedRole].instruction;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          systemInstruction: activeSystemInstruction,
          useSearch: useSearchGrounding,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const botMessage: ChatMessageItem = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.text,
          modelUsed: data.modelUsed,
          sources: data.sources || [],
          searchQueries: data.searchQueries || [],
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);

        if (user) {
          saveChatMessageToCloud(botMessage).catch(() => {});
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'model',
            content: `Error: ${data.error || 'Failed to generate response'}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `Network Error: ${err.message || 'Unable to communicate with Gemini API'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[85vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Gemini Workflow Copilot</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Multi-Turn
                </span>
                {user && (
                  <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Firestore Synced
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Conversational AI reasoning across desktop telemetry & automation tiers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome-1',
                    role: 'model',
                    content: 'History cleared. How can I assist with your workflow architecture?',
                    modelUsed: selectedModel,
                    timestamp: Date.now(),
                  },
                ])
              }
              title="Clear Thread"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar: Model Selection, Role, Search Grounding */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Model Selector */}
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 font-medium">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
              </select>
            </div>

            {/* Role System Instruction Selector */}
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 font-medium">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="architect">Automation Architect</option>
                <option value="optimizer">Heuristic Optimizer</option>
                <option value="developer">Script Synthesizer</option>
              </select>
            </div>
          </div>

          {/* Google Search Grounding Toggle */}
          <button
            type="button"
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition ${
              useSearchGrounding
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${useSearchGrounding ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Search Grounding</span>
            {useSearchGrounding && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            )}
          </button>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-md'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-sm shadow-md'
                  }`}
                >
                  {/* Model & Source Meta header */}
                  {!isUser && msg.modelUsed && (
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/5 text-[11px] text-slate-400 font-mono">
                      <span className="text-cyan-400">{msg.modelUsed}</span>
                      {msg.sources && msg.sources.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                          <Search className="w-2.5 h-2.5" />
                          Grounded ({msg.sources.length} sources)
                        </span>
                      )}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Web Sources / Grounding citations */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Search className="w-3 h-3 text-blue-400" />
                        <span>Google Search Grounded Citations:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-500/30 transition truncate max-w-[220px]"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-800/80 rounded-2xl rounded-bl-sm p-4 text-sm text-slate-300 border border-slate-700/60 flex items-center gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Gemini ({useSearchGrounding ? 'gemini-3.5-flash with Google Search' : selectedModel}) is reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              useSearchGrounding
                ? 'Ask anything (Google Search Grounding enabled)...'
                : `Ask ${ROLE_INSTRUCTIONS[selectedRole].title} (${selectedModel})...`
            }
            className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
