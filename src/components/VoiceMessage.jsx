import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

// Module-level: ensures only one voice message plays at a time
let globalStop = null;

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function VoiceMessage({
  waveform = [],
  duration = 0,
  audioUrl = null,
  isMine,
  senderInitials = '',
  senderColor = '#1d4ed8',
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);      // 0–1
  const [currentTime, setCurrent] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);

  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const mockOffsetRef = useRef(0);   // resume position for mock playback
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
      if (globalStop === stopThis) globalStop = null;
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stopThis = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    audioRef.current?.pause();
    if (mountedRef.current) {
      setPlaying(false);
    }
    if (globalStop === stopThis) globalStop = null;
  }, []);

  // ── Real audio playback ──────────────────────────────────────────────────
  const startReal = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.playbackRate = speed;
      audioRef.current.onended = () => {
        if (!mountedRef.current) return;
        setPlaying(false);
        setProgress(0);
        setCurrent(0);
        mockOffsetRef.current = 0;
        cancelAnimationFrame(rafRef.current);
        if (globalStop === stopThis) globalStop = null;
      };
    }
    audioRef.current.playbackRate = speed;
    audioRef.current.play().catch(() => {});

    const tick = () => {
      if (!audioRef.current || audioRef.current.paused) return;
      const dur = audioRef.current.duration || duration;
      const ct = audioRef.current.currentTime;
      if (mountedRef.current) {
        setCurrent(ct);
        setProgress(ct / (dur || 1));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [audioUrl, speed, duration, stopThis]);

  // ── Mock playback (no audioUrl) ──────────────────────────────────────────
  const startMock = useCallback((resumeFrom = 0) => {
    const startWall = Date.now();
    const speedRef = { v: speed };

    const tick = () => {
      const elapsed = resumeFrom + (Date.now() - startWall) / 1000 * speedRef.v;
      const prog = Math.min(elapsed / (duration || 1), 1);
      if (mountedRef.current) {
        setProgress(prog);
        setCurrent(elapsed);
      }
      if (prog >= 1) {
        if (mountedRef.current) {
          setPlaying(false);
          setProgress(0);
          setCurrent(0);
          mockOffsetRef.current = 0;
        }
        if (globalStop === stopThis) globalStop = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [speed, duration, stopThis]);

  // ── Play / Pause ─────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (playing) {
      cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
      mockOffsetRef.current = currentTime;
      setPlaying(false);
      if (globalStop === stopThis) globalStop = null;
    } else {
      // Stop anything else playing
      if (globalStop && globalStop !== stopThis) globalStop();

      setPlaying(true);
      setHasStarted(true);
      globalStop = stopThis;

      if (audioUrl) {
        startReal();
      } else {
        startMock(mockOffsetRef.current);
      }
    }
  };

  // ── Speed toggle ─────────────────────────────────────────────────────────
  const cycleSpeed = (e) => {
    e.stopPropagation();
    const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  // ── Seek ─────────────────────────────────────────────────────────────────
  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const prog = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const seekTo = prog * duration;

    setProgress(prog);
    setCurrent(seekTo);
    mockOffsetRef.current = seekTo;

    if (audioRef.current) {
      audioRef.current.currentTime = (audioRef.current.duration || duration) * prog;
    }

    // If playing, restart the tick from new position
    if (playing) {
      cancelAnimationFrame(rafRef.current);
      if (audioUrl) {
        startReal();
      } else {
        startMock(seekTo);
      }
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const filledCount = Math.round(progress * waveform.length);

  const barBg = (i) => {
    const filled = i < filledCount;
    if (isMine) return filled ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.32)';
    return filled ? '#0f1a2e' : '#9ca3af';
  };

  return (
    <div
      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-2xl ${
        isMine
          ? 'bg-[#0F1A2E] rounded-br-sm'
          : 'bg-white border border-gray-200 rounded-bl-sm'
      }`}
      style={{ minWidth: '240px', maxWidth: '288px' }}
    >
      {/* Mic badge — top-right corner */}
      <Mic
        size={9}
        className={`absolute top-1.5 right-2 ${isMine ? 'text-white/20' : 'text-gray-300'}`}
      />

      {/* Play / pause + speed pill */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <button
          onClick={handlePlayPause}
          className={`w-8 h-8 rounded-full flex items-center justify-center btn-press transition-colors ${
            isMine ? 'bg-white/20 hover:bg-white/30' : 'bg-[#0F1A2E] hover:bg-[#1a2d4e]'
          }`}
        >
          {playing
            ? <Pause size={13} fill="white" className="text-white" />
            : <Play size={13} fill="white" className="text-white ml-0.5" />}
        </button>

        {hasStarted && (
          <button
            onClick={cycleSpeed}
            className={`text-[10px] font-bold px-1 py-0 rounded leading-4 transition-colors ${
              isMine ? 'text-white/55 bg-white/10' : 'text-gray-500 bg-gray-100'
            }`}
          >
            {speed === 1 ? '1×' : speed === 1.5 ? '1.5×' : '2×'}
          </button>
        )}
      </div>

      {/* Waveform bars — seekable */}
      <div
        className="flex items-center overflow-hidden cursor-pointer"
        style={{ gap: '1.5px', height: '24px', flex: 1 }}
        onClick={handleSeek}
        onTouchEnd={handleSeek}
      >
        {waveform.map((val, i) => (
          <div
            key={i}
            style={{
              width: '2.5px',
              flexShrink: 0,
              height: `${Math.max(3, Math.round(val * 20))}px`,
              borderRadius: '2px',
              backgroundColor: barBg(i),
            }}
          />
        ))}
      </div>

      {/* Duration / current time */}
      <span
        className={`text-xs font-medium flex-shrink-0 tabular-nums ${
          isMine ? 'text-white/65' : 'text-gray-500'
        }`}
      >
        {playing ? fmt(currentTime) : fmt(duration)}
      </span>

      {/* Sender avatar */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
        style={{ fontSize: '9px', backgroundColor: senderColor }}
      >
        {senderInitials}
      </div>
    </div>
  );
}
