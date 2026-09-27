import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  AlertCircle,
  Activity,
} from 'lucide-react';

interface VoiceLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceLiveModal: React.FC<VoiceLiveModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Connecting to gemini-3.8-live...');
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    startLiveSession();

    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    try {
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (inputAudioCtxRef.current) {
        inputAudioCtxRef.current.close().catch(() => {});
        inputAudioCtxRef.current = null;
      }
      if (outputAudioCtxRef.current) {
        outputAudioCtxRef.current.close().catch(() => {});
        outputAudioCtxRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } catch (err) {
      console.error('Error during Live API cleanup:', err);
    }
    setIsConnected(false);
    setIsModelSpeaking(false);
  };

  const floatTo16BitPCM = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playRawPcm24k = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startTime = Math.max(now, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      setIsModelSpeaking(true);
      source.onended = () => {
        if (ctx.currentTime >= nextStartTimeRef.current - 0.05) {
          setIsModelSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  };

  const startLiveSession = async () => {
    setStatusMessage('Connecting to Gemini 3.8 Live API WebSocket...');
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        setStatusMessage('Listening... Speak into your microphone.');

        // Initialize mic stream
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          inputAudioCtxRef.current = inputCtx;

          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          source.connect(processor);
          processor.connect(inputCtx.destination);

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
            const channelData = e.inputBuffer.getChannelData(0);

            // Calculate volume for animation
            let sum = 0;
            for (let i = 0; i < channelData.length; i++) {
              sum += Math.abs(channelData[i]);
            }
            const avg = sum / channelData.length;
            setVolumeLevel(Math.min(100, Math.round(avg * 400)));

            const base64Pcm = floatTo16BitPCM(channelData);
            ws.send(JSON.stringify({ audio: base64Pcm }));
          };
        } catch (micErr: any) {
          console.error('Microphone error:', micErr);
          setStatusMessage(`Microphone access denied: ${micErr.message}`);
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setStatusMessage(`Error: ${msg.error}`);
          }
          if (msg.audio) {
            playRawPcm24k(msg.audio);
          }
          if (msg.text) {
            setLiveTranscript(msg.text);
          }
          if (msg.interrupted) {
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
            setIsModelSpeaking(false);
          }
        } catch (e) {
          console.error('WebSocket message parsing error:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setStatusMessage('WebSocket connection error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatusMessage('Session closed');
      };
    } catch (err: any) {
      setStatusMessage(`Failed to initiate voice session: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Live Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>GEMINI-3.8-LIVE · Low Latency Voice API</span>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight mb-2">
          Voice Conversations Copilot
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-8">
          Speak naturally to reason about desktop tasks, workflow candidates, and self-healing rules.
        </p>

        {/* Animated Orb / Visualizer */}
        <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
          {/* Ambient Glow */}
          <div
            className={`absolute inset-0 rounded-full blur-2xl transition-all duration-300 ${
              isModelSpeaking
                ? 'bg-blue-500/40 scale-125'
                : isConnected
                ? 'bg-cyan-500/30 scale-100'
                : 'bg-slate-700/20 scale-75'
            }`}
          />

          {/* Concentric rings pulsing with volume */}
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/40 transition-transform duration-100"
            style={{
              transform: `scale(${1 + volumeLevel / 120})`,
              opacity: isConnected ? 0.7 : 0.2,
            }}
          />
          <div
            className="absolute inset-2 rounded-full border border-blue-400/30 transition-transform duration-100"
            style={{
              transform: `scale(${1 + volumeLevel / 180})`,
              opacity: isConnected ? 0.5 : 0.2,
            }}
          />

          {/* Center Orb */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isModelSpeaking
                ? 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white animate-pulse'
                : isConnected
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isModelSpeaking ? (
              <Volume2 className="w-10 h-10 animate-bounce" />
            ) : isMuted ? (
              <MicOff className="w-10 h-10 text-rose-300" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-mono text-slate-300 flex items-center justify-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{statusMessage}</span>
          </div>

          {liveTranscript && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 italic">
              "{liveTranscript}"
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition ${
              isMuted
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition cursor-pointer"
          >
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
