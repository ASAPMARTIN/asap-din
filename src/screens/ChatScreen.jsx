import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Mic } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import VoiceMessage from '../components/VoiceMessage';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { getUserById, CURRENT_USER_ID } from '../data/mockUsers';
import { timeAgo } from '../utils/timeAgo';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

// Check once at module load; avoids re-checking on every render
const MIC_SUPPORTED =
  typeof MediaRecorder !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia;

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recording UI (shown instead of text input while holding mic)
// ─────────────────────────────────────────────────────────────────────────────
function RecordingBar({ recTime, slideOffset, onEnd, onTouchMove, onMouseUp }) {
  const cancelled = slideOffset > 80;
  const MAX = 120;
  const nearEnd = recTime >= MAX - 10;

  return (
    <div className="flex items-center gap-3 h-10">
      {/* Left: dot + timer */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 pulse-danger flex-shrink-0" />
        <span className="text-sm font-mono font-semibold text-gray-700 w-10 tabular-nums">
          {fmt(recTime)}
        </span>
        {nearEnd && (
          <span className="text-xs font-bold text-red-500 tabular-nums">
            {MAX - recTime}s
          </span>
        )}
      </div>

      {/* Slide hint — moves and fades as user slides left */}
      <span
        className="text-sm text-gray-400 flex-1 text-center select-none slide-hint"
        style={{
          transform: `translateX(${-Math.min(slideOffset * 0.4, 40)}px)`,
          opacity: cancelled ? 0 : Math.max(0, 1 - slideOffset / 90),
          animationPlayState: slideOffset > 10 ? 'paused' : 'running',
        }}
      >
        {cancelled ? '' : '‹ Desliza para cancelar'}
      </span>

      {/* Mic button — red + scaled up while holding */}
      <button
        onTouchEnd={onEnd}
        onTouchMove={onTouchMove}
        onMouseUp={onMouseUp}
        className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-400/40 transition-transform"
        style={{ transform: 'scale(1.12)' }}
      >
        <Mic size={20} className="text-white" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ChatScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const {
    getMessages, sendMessage, sendVoiceMessage,
    markConversationRead, getOrCreateConversation,
  } = useMessages();

  // Text input state
  const [text, setText] = useState('');

  // Recording state (UI)
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);
  const [cancelToast, setCancelToast] = useState(false);
  const [micErrToast, setMicErrToast] = useState(false);

  // DOM refs
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Recording refs (never trigger re-render)
  const mrRef = useRef(null);           // MediaRecorder instance
  const chunksRef = useRef([]);         // audio data chunks
  const ctxRef = useRef(null);          // AudioContext
  const analyserRef = useRef(null);     // AnalyserNode
  const wfRef = useRef([]);             // accumulated waveform samples
  const timerRef = useRef(null);        // setInterval handle
  const startTsRef = useRef(0);         // recording start timestamp
  const touchXRef = useRef(0);          // initial touch X for slide detection
  const holdingRef = useRef(false);     // is the user currently holding
  const rafRef = useRef(null);          // requestAnimationFrame handle
  const lastCaptureRef = useRef(0);     // throttle waveform capture

  const other = getUserById(userId);
  const messages = getMessages(userId);
  const currentUser = getUserById(CURRENT_USER_ID);

  useEffect(() => {
    getOrCreateConversation(userId);
    markConversationRead(userId);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  // ── Text send ──────────────────────────────────────────────────────────────
  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    sendMessage(userId, t);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Stop recording ─────────────────────────────────────────────────────────
  const stopRec = useCallback((cancelled) => {
    holdingRef.current = false;
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);

    const duration = Math.floor((Date.now() - startTsRef.current) / 1000);

    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;

    setRecording(false);
    setRecTime(0);
    setSlideOffset(0);

    const rec = mrRef.current;
    mrRef.current = null;
    if (!rec) return;

    if (cancelled || duration < 1) {
      rec.stop();
      rec.stream?.getTracks().forEach(t => t.stop());
      if (cancelled) {
        setCancelToast(true);
        setTimeout(() => setCancelToast(false), 1500);
      }
      return;
    }

    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(blob);
      const raw = wfRef.current;
      const waveform = raw.length
        ? Array.from({ length: 40 }, (_, i) =>
            raw[Math.floor((i / 40) * raw.length)] ?? 0
          )
        : Array(40).fill(0.3);
      sendVoiceMessage(userId, blob, duration, waveform, audioUrl);
    };

    rec.stop();
    rec.stream?.getTracks().forEach(t => t.stop());
  }, [userId, sendVoiceMessage]);

  // ── Start recording ────────────────────────────────────────────────────────
  const startRec = useCallback(async () => {
    if (!MIC_SUPPORTED) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Web Audio for waveform
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      src.connect(analyser);
      ctxRef.current = ctx;
      analyserRef.current = analyser;

      // MediaRecorder
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      wfRef.current = [];
      lastCaptureRef.current = 0;
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.start(100);
      mrRef.current = rec;

      startTsRef.current = Date.now();
      setRecording(true);
      setRecTime(0);
      setSlideOffset(0);

      // 1-second interval timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTsRef.current) / 1000);
        setRecTime(elapsed);
        if (elapsed >= 120) stopRec(false);
      }, 1000);

      // Waveform capture throttled to ~10fps
      const captureLoop = () => {
        const now = Date.now();
        if (now - lastCaptureRef.current > 100 && analyserRef.current) {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          wfRef.current.push(Math.max(...data) / 255);
          lastCaptureRef.current = now;
        }
        rafRef.current = requestAnimationFrame(captureLoop);
      };
      rafRef.current = requestAnimationFrame(captureLoop);

    } catch {
      holdingRef.current = false;
      setMicErrToast(true);
      setTimeout(() => setMicErrToast(false), 3000);
    }
  }, [stopRec]);

  // ── Global mouse events for desktop recording ──────────────────────────────
  useEffect(() => {
    if (!recording) return;
    const up = () => { if (holdingRef.current) stopRec(false); };
    const move = (e) => {
      const offset = Math.max(0, touchXRef.current - e.clientX);
      setSlideOffset(offset);
      if (offset > 100) stopRec(true);
    };
    window.addEventListener('mouseup', up);
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mousemove', move);
    };
  }, [recording, stopRec]);

  // ── Mic button handlers ────────────────────────────────────────────────────
  const handleMicDown = (e) => {
    e.preventDefault();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    touchXRef.current = x;
    holdingRef.current = true;
    startRec();
  };

  const handleMicUp = (e) => {
    e.preventDefault();
    if (!holdingRef.current) return;
    stopRec(false);
  };

  const handleMicMove = (e) => {
    if (!recording) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const offset = Math.max(0, touchXRef.current - x);
    setSlideOffset(offset);
    if (offset > 100) stopRec(true);
  };

  // ── Not-found fallback ─────────────────────────────────────────────────────
  if (!other) {
    return (
      <div className="min-h-dvh flex flex-col bg-gray-50">
        <div className="bg-[#0F1A2E] text-white safe-top">
          <div className="flex items-center px-4 h-14">
            <button onClick={() => navigate(-1)} className="p-1.5 text-white/80">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">{language === 'es' ? 'Usuario no encontrado' : 'User not found'}</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">

      {/* ── Custom top bar ── */}
      <header className="bg-[#0F1A2E] text-white safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="text-white/80 -ml-1 p-1.5 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: other.avatar_color }}
          >
            {other.avatar_initials}
          </div>

          <button onClick={() => navigate(`/profile/${other.id}`)} className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base truncate">{other.display_name}</span>
              <VerifiedBadge size={14} />
            </div>
            <p className="text-white/50 text-xs truncate">
              {EQUIPMENT_LABELS[other.equipment_type] || other.equipment_type}
            </p>
          </button>
        </div>
      </header>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: '72px' }}>

        {/* Toasts */}
        {cancelToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg fade-in pointer-events-none">
            {language === 'es' ? 'Cancelado' : 'Cancelled'}
          </div>
        )}
        {micErrToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg fade-in pointer-events-none">
            {language === 'es' ? 'Permite acceso al micrófono' : 'Allow microphone access'}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3"
              style={{ backgroundColor: other.avatar_color }}
            >
              {other.avatar_initials}
            </div>
            <p className="text-gray-700 font-semibold text-base">{other.display_name}</p>
            <p className="text-gray-400 text-sm mt-1">
              {language === 'es' ? 'Empieza la conversación' : 'Start the conversation'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === CURRENT_USER_ID;
              const showTime = i === 0 ||
                new Date(msg.created_at) - new Date(messages[i - 1].created_at) > 300000;
              const sender = isMe ? currentUser : other;
              const isVoice = msg.type === 'voice';

              return (
                <div key={msg.id}>
                  {showTime && (
                    <div className="text-center my-2">
                      <span className="text-xs text-gray-400">{timeAgo(msg.created_at, language)}</span>
                    </div>
                  )}

                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && !isVoice && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end mb-0.5"
                        style={{ backgroundColor: other.avatar_color }}
                      >
                        {other.avatar_initials}
                      </div>
                    )}

                    {isVoice ? (
                      // Voice message bubble
                      <VoiceMessage
                        waveform={msg.waveform}
                        duration={msg.duration}
                        audioUrl={msg.audio_url}
                        isMine={isMe}
                        senderInitials={sender?.avatar_initials || '?'}
                        senderColor={sender?.avatar_color || '#4B5563'}
                      />
                    ) : (
                      // Text message bubble
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? 'bg-[#0F1A2E] text-white rounded-br-sm'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Fixed input bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2.5 pb-safe z-20">
        {recording ? (
          // Recording overlay
          <RecordingBar
            recTime={recTime}
            slideOffset={slideOffset}
            onEnd={handleMicUp}
            onTouchMove={handleMicMove}
            onMouseUp={handleMicUp}
          />
        ) : (
          // Normal input
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'es' ? 'Escribe un mensaje...' : 'Write a message...'}
              rows={1}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-28 bg-gray-50"
              style={{ lineHeight: '1.4' }}
            />

            {text.trim() ? (
              // Send arrow
              <button
                onClick={handleSend}
                className="w-10 h-10 bg-[#0F1A2E] text-white rounded-full flex items-center justify-center flex-shrink-0 btn-press transition-colors"
              >
                <Send size={16} strokeWidth={2.5} />
              </button>
            ) : MIC_SUPPORTED ? (
              // Mic button (press-and-hold)
              <button
                onTouchStart={handleMicDown}
                onMouseDown={handleMicDown}
                className="w-10 h-10 bg-[#0F1A2E] text-white rounded-full flex items-center justify-center flex-shrink-0 btn-press transition-colors select-none"
                style={{ touchAction: 'none', userSelect: 'none' }}
              >
                <Mic size={18} strokeWidth={2} />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
