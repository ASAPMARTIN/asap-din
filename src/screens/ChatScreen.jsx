import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Mic, Users, X } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import VoiceMessage from '../components/VoiceMessage';
import BottomSheet from '../components/BottomSheet';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { getUserById, mockUsers, CURRENT_USER_ID } from '../data/mockUsers';
import { timeAgo } from '../utils/timeAgo';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

const FLAIR_CONFIG = {
  alerta: { label: '🚨 Alerta', bg: 'bg-red-100', text: 'text-red-700' },
  pregunta: { label: '❓ Pregunta', bg: 'bg-blue-100', text: 'text-blue-700' },
  tarifa: { label: '💰 Tarifa', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  consejo: { label: '💡 Consejo', bg: 'bg-amber-100', text: 'text-amber-700' },
  encuesta: { label: '📊 Encuesta', bg: 'bg-purple-100', text: 'text-purple-700' },
};

// Check once at module load
const MIC_SUPPORTED =
  typeof MediaRecorder !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia;

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function RecordingBar({ recTime, slideOffset, onEnd, onTouchMove, onMouseUp }) {
  const cancelled = slideOffset > 80;
  const MAX = 120;
  const nearEnd = recTime >= MAX - 10;

  return (
    <div className="flex items-center gap-3 h-10">
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
      <button
        onTouchEnd={onEnd}
        onTouchMove={onTouchMove}
        onMouseUp={onMouseUp}
        className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-400/40"
        style={{ transform: 'scale(1.12)' }}
      >
        <Mic size={20} className="text-white" />
      </button>
    </div>
  );
}

function SharedPostBubble({ sharedPostId, language }) {
  const { getPost } = usePosts();
  const navigate = useNavigate();
  const post = getPost(sharedPostId);
  if (!post) return (
    <div className="max-w-[75%] px-4 py-2.5 rounded-2xl bg-gray-50 border-l-2 border-[#0F1A2E]">
      <p className="text-xs text-gray-400">{language === 'es' ? 'Publicación no disponible' : 'Post unavailable'}</p>
    </div>
  );

  const author = getUserById(post.author_id);
  const flair = post.flair && FLAIR_CONFIG[post.flair];

  return (
    <div
      className="max-w-[75%] rounded-2xl bg-gray-50 border-l-2 border-[#0F1A2E] overflow-hidden cursor-pointer"
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="px-3 py-2.5">
        <p className="text-xs text-gray-500 mb-1 font-medium">
          {author?.display_name || 'Usuario'}
        </p>
        <p className="text-sm text-gray-800 line-clamp-2 leading-snug mb-1.5">{post.body}</p>
        {flair && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-1 ${flair.bg} ${flair.text}`}>
            {flair.label}
          </span>
        )}
        <p className="text-xs text-[#0F1A2E] font-semibold mt-1">
          {language === 'es' ? 'Ver publicación →' : 'View post →'}
        </p>
      </div>
    </div>
  );
}

function ReadReceipt({ status, readReceiptsEnabled }) {
  if (!status) return null;
  const effectiveStatus = !readReceiptsEnabled && status === 'read' ? 'delivered' : status;

  return (
    <div className="flex justify-end mt-0.5 mr-1">
      {effectiveStatus === 'sent' && (
        <span className="text-[10px] text-gray-400">✓</span>
      )}
      {effectiveStatus === 'delivered' && (
        <span className="text-[10px] text-gray-400">✓✓</span>
      )}
      {effectiveStatus === 'read' && (
        <span className="text-[10px] text-blue-500">✓✓</span>
      )}
    </div>
  );
}

export default function ChatScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const {
    getMessages, sendMessage, sendVoiceMessage,
    markConversationRead, getOrCreateConversation,
    getGroup, getGroupMessages, sendGroupMessage, sendGroupVoiceMessage,
    leaveGroup, conversations,
  } = useMessages();
  const { notifications, readReceipts } = useAuth();

  // Detect if this is a group chat
  const isGroup = userId?.startsWith('grp-');
  const group = isGroup ? getGroup(userId) : null;

  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);
  const [cancelToast, setCancelToast] = useState(false);
  const [micErrToast, setMicErrToast] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const wfRef = useRef([]);
  const timerRef = useRef(null);
  const startTsRef = useRef(0);
  const touchXRef = useRef(0);
  const holdingRef = useRef(false);
  const rafRef = useRef(null);
  const lastCaptureRef = useRef(0);

  const other = isGroup ? null : getUserById(userId);
  const messages = isGroup ? getGroupMessages(userId) : getMessages(userId);
  const currentUserObj = getUserById(CURRENT_USER_ID);

  const readReceiptsEnabled = readReceipts;

  useEffect(() => {
    if (!isGroup) {
      getOrCreateConversation(userId);
      markConversationRead(userId);
    }
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    if (isGroup) {
      sendGroupMessage(userId, t);
    } else {
      sendMessage(userId, t);
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        ? Array.from({ length: 40 }, (_, i) => raw[Math.floor((i / 40) * raw.length)] ?? 0)
        : Array(40).fill(0.3);
      if (isGroup) {
        sendGroupVoiceMessage(userId, blob, duration, waveform, audioUrl);
      } else {
        sendVoiceMessage(userId, blob, duration, waveform, audioUrl);
      }
    };
    rec.stop();
    rec.stream?.getTracks().forEach(t => t.stop());
  }, [userId, sendVoiceMessage, sendGroupVoiceMessage, isGroup]);

  const startRec = useCallback(async () => {
    if (!MIC_SUPPORTED) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      src.connect(analyser);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
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
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTsRef.current) / 1000);
        setRecTime(elapsed);
        if (elapsed >= 120) stopRec(false);
      }, 1000);
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

  // Group not found
  if (isGroup && !group) {
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
          <p className="text-gray-400">{language === 'es' ? 'Grupo no encontrado' : 'Group not found'}</p>
        </div>
      </div>
    );
  }

  // DM: user not found
  if (!isGroup && !other) {
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

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">

      {/* Custom top bar */}
      <header className="bg-[#0F1A2E] text-white safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="text-white/80 -ml-1 p-1.5 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          {isGroup ? (
            <>
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                {group.emoji}
              </div>
              <button
                onClick={() => setGroupInfoOpen(true)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base truncate">{group.name}</span>
                </div>
                <p className="text-white/50 text-xs">
                  {group.members.length} {language === 'es' ? 'miembros' : 'members'}
                </p>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ paddingBottom: '72px' }}>
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
            {isGroup ? (
              <>
                <div className="w-16 h-16 rounded-full bg-[#0F1A2E] flex items-center justify-center text-3xl mb-3">
                  {group.emoji}
                </div>
                <p className="text-gray-700 font-semibold text-base">{group.name}</p>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3"
                  style={{ backgroundColor: other.avatar_color }}
                >
                  {other.avatar_initials}
                </div>
                <p className="text-gray-700 font-semibold text-base">{other.display_name}</p>
              </>
            )}
            <p className="text-gray-400 text-sm mt-1">
              {language === 'es' ? 'Empieza la conversación' : 'Start the conversation'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === CURRENT_USER_ID;
              const msgCreatedAt = msg.created_at || '';
              const prevMsg = messages[i - 1];
              const showTime = i === 0 ||
                (prevMsg && new Date(msgCreatedAt) - new Date(prevMsg.created_at) > 300000);
              const sender = isMe ? currentUserObj : (isGroup ? getUserById(msg.sender_id) : other);
              const isVoice = msg.type === 'voice';
              const isSharedPost = msg.type === 'shared_post';

              return (
                <div key={msg.id}>
                  {showTime && (
                    <div className="text-center my-2">
                      <span className="text-xs text-gray-400">{timeAgo(msgCreatedAt, language)}</span>
                    </div>
                  )}

                  {/* Group: sender name above received bubbles */}
                  {isGroup && !isMe && sender && (
                    <p className="text-xs text-gray-400 mb-0.5 ml-9">{sender.display_name.split(' ')[0]}</p>
                  )}

                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && !isVoice && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end mb-0.5"
                        style={{ backgroundColor: sender?.avatar_color || '#4B5563' }}
                      >
                        {sender?.avatar_initials || '?'}
                      </div>
                    )}

                    {isVoice ? (
                      <VoiceMessage
                        waveform={msg.waveform}
                        duration={msg.duration}
                        audioUrl={msg.audio_url}
                        isMine={isMe}
                        senderInitials={sender?.avatar_initials || '?'}
                        senderColor={sender?.avatar_color || '#4B5563'}
                      />
                    ) : isSharedPost ? (
                      <div>
                        <SharedPostBubble sharedPostId={msg.shared_post_id} language={language} />
                        {isMe && <ReadReceipt status={msg.status} readReceiptsEnabled={readReceiptsEnabled} />}
                      </div>
                    ) : (
                      <div>
                        {/* Group: color bar on received */}
                        {isGroup && !isMe ? (
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl rounded-bl-sm border-l-2 bg-white text-gray-900 border border-gray-200`}
                            style={{ borderLeftColor: sender?.avatar_color || '#4B5563' }}
                          >
                            <p className="text-sm leading-relaxed">{msg.body || msg.text}</p>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                              isMe
                                ? 'bg-[#0F1A2E] text-white rounded-br-sm'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.body || msg.text}</p>
                          </div>
                        )}
                        {isMe && <ReadReceipt status={msg.status} readReceiptsEnabled={readReceiptsEnabled} />}
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

      {/* Fixed input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2.5 pb-safe z-20">
        {recording ? (
          <RecordingBar
            recTime={recTime}
            slideOffset={slideOffset}
            onEnd={handleMicUp}
            onTouchMove={handleMicMove}
            onMouseUp={handleMicUp}
          />
        ) : (
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
              <button
                onClick={handleSend}
                className="w-10 h-10 bg-[#0F1A2E] text-white rounded-full flex items-center justify-center flex-shrink-0 btn-press transition-colors"
              >
                <Send size={16} strokeWidth={2.5} />
              </button>
            ) : MIC_SUPPORTED ? (
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

      {/* Group info bottom sheet */}
      {isGroup && (
        <BottomSheet isOpen={groupInfoOpen} onClose={() => setGroupInfoOpen(false)}>
          <div className="px-4 pb-6 pt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {group.emoji} {group.name}
              </h3>
              <button onClick={() => setGroupInfoOpen(false)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {group.members.length} {language === 'es' ? 'miembros' : 'members'}
            </p>

            <div className="space-y-2 mb-5">
              {group.members.map(memberId => {
                const member = getUserById(memberId);
                if (!member) return null;
                return (
                  <div key={memberId} className="flex items-center gap-3 px-2 py-1.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: member.avatar_color }}
                    >
                      {member.avatar_initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.display_name}</p>
                      {group.created_by === memberId && (
                        <p className="text-xs text-gray-400">{language === 'es' ? 'Creador' : 'Creator'}</p>
                      )}
                    </div>
                    {memberId === CURRENT_USER_ID && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Tú</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                leaveGroup(userId);
                setGroupInfoOpen(false);
                navigate('/messages');
              }}
              className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-2xl btn-press hover:bg-red-100 transition-colors text-sm"
            >
              {language === 'es' ? 'Salir del grupo' : 'Leave group'}
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
