import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Clock, Square, Mic, Download } from 'lucide-react';
import BrandLogo from '../../components/shared/BrandLogo';

// ─── Mock conversation that plays out automatically ───────────────────────────
const SCRIPT = [
  { role: 'ai',   text: "Hi! I'm Glee, your AI interviewer. Let's start — tell me about yourself and what you're looking for in your next role." },
  { role: 'user', text: "I'm a software engineer with 3 years in React and Node.js, looking for a senior frontend role." },
  { role: 'ai',   text: "Great background! Walk me through a challenging technical problem you solved recently." },
  { role: 'user', text: "We had a dashboard bottleneck — I used React.memo and useMemo to cut load time by 60%." },
  { role: 'ai',   text: "Impressive! How did you identify that re-renders were the root cause rather than network latency?" },
];

// Delays between each message appearing (ms)
const DELAYS = [1200, 2800, 1800, 2600, 2000];

// ─── Animated waveform bars ───────────────────────────────────────────────────
const BAR_COUNT = 24;

const WaveformBars: React.FC<{ active: boolean }> = ({ active }) => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      phaseRef.current += 0.06;
      const t = phaseRef.current;
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const center = (BAR_COUNT - 1) / 2;
        const dist = Math.abs(i - center) / center;
        const env = Math.exp(-dist * dist * 3);
        const h = active
          ? 15 + env * 55 * (0.5 + 0.5 * Math.sin(t * 1.8 + i * 0.4))
          : 8 + env * 6;
        bar.style.height = `${h}%`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <div className="flex items-center justify-center gap-[3px] h-10 w-full">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div
          key={i}
          ref={el => { barsRef.current[i] = el; }}
          className="w-1 rounded-full transition-colors duration-300"
          style={{
            height: '8%',
            backgroundColor: active ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        />
      ))}
    </div>
  );
};

// ─── Animated timer ───────────────────────────────────────────────────────────
const LiveTimer: React.FC = () => {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <span className="font-mono text-xs text-[var(--color-text-muted)]">{m}:{s}</span>;
};

// ─── Main mockup component ────────────────────────────────────────────────────
const InterviewMockup: React.FC = () => {
  const [messages, setMessages] = useState<typeof SCRIPT>([]);
  const [userTurn, setUserTurn] = useState(false);
  const [gleeSpeaking, setGleeSpeaking] = useState(false);
  const [loopKey, setLoopKey] = useState(0);

  // Play out the script — restarts when loopKey increments
  useEffect(() => {
    let cancelled = false;
    let total = 0;

    // Clear state at start of each loop
    setMessages([]);
    setUserTurn(false);
    setGleeSpeaking(false);

    SCRIPT.forEach((msg, i) => {
      total += DELAYS[i] ?? 2000;
      setTimeout(() => {
        if (cancelled) return;
        setMessages(prev => [...prev, msg]);
        if (msg.role === 'ai') {
          setGleeSpeaking(true);
          setUserTurn(false);
          setTimeout(() => {
            if (cancelled) return;
            setGleeSpeaking(false);
            if (i < SCRIPT.length - 1) setUserTurn(true);
          }, 1400);
        } else {
          setUserTurn(false);
        }
      }, total);
    });

    // Loop: restart after full script + pause
    const loopId = setTimeout(() => {
      if (cancelled) return;
      setLoopKey(k => k + 1);
    }, total + 3000);

    return () => {
      cancelled = true;
      clearTimeout(loopId);
    };
  }, [loopKey]);


  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] pointer-events-none select-none">

      {/* ── Browser chrome ── */}
      <div className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border-light)] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-md px-3 py-1 text-xs text-[var(--color-text-muted)] font-mono">
          app.interviewsta.ai/interview/session
        </div>
      </div>

      {/* ── Interview header ── */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border-light)] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo alt="Interviewsta" className="h-5 w-auto" />
          <span className="text-[var(--color-border)] text-sm">|</span>
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-xs font-semibold text-red-500">Live</span>
          </div>
          <span className="text-[var(--color-border)] text-sm">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <LiveTimer />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors">
            <Download className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          </button>
          <button className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <Square className="h-3 w-3" />
            End Interview
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-5 gap-0" style={{ height: '420px' }}>

        {/* Left — Glee video panel */}
        <div className="col-span-2 border-r border-[var(--color-border-light)] flex flex-col bg-slate-900 relative overflow-hidden">
          {/* Animated gradient background simulating video */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: gleeSpeaking
                ? ['linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)',
                   'linear-gradient(135deg,#312e81 0%,#4c1d95 50%,#312e81 100%)',
                   'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)']
                : 'linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 100%)',
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Glee avatar */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-3">
            <motion.div
              animate={gleeSpeaking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.8, repeat: gleeSpeaking ? Infinity : 0 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-2xl">
                <Bot className="h-10 w-10 text-white" />
              </div>
              {gleeSpeaking && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-violet-400"
                  animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">Glee</p>
              <p className="text-white/50 text-xs">AI Interviewer</p>
            </div>
            {/* Waveform */}
            <div className="w-full px-4">
              <WaveformBars active={gleeSpeaking} />
            </div>
          </div>

          {/* Glee speaking label */}
          <AnimatePresence>
            {gleeSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-3 left-0 right-0 flex justify-center"
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                  />
                  <span className="text-white text-xs font-medium">Glee is speaking…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Transcript */}
        <div className="col-span-3 flex flex-col bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-alt)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--color-border-light)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Transcript</span>
            <span className="text-xs text-[var(--color-text-subtle)]">Technical Interview</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 16 : -16 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-[var(--color-primary)]' : 'bg-slate-600'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="h-3.5 w-3.5 text-white" />
                      : <Bot className="h-3.5 w-3.5 text-white" />
                    }
                  </div>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-text)] border border-[var(--color-primary-muted)]/20'
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-light)]'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Your turn indicator */}
            <AnimatePresence>
              {userTurn && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex justify-end"
                >
                  <div className="flex items-start gap-2.5 flex-row-reverse max-w-[80%]">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="rounded-xl px-3 py-2.5 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-muted)] text-white shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                          <span className="absolute w-2.5 h-2.5 rounded-full bg-white/40 animate-ping" />
                          <span className="relative w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Your turn to speak</p>
                          <p className="text-xs text-white/75">Answer when ready</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Bottom mic bar */}
          <div className="border-t border-[var(--color-border-light)] px-4 py-2.5 flex items-center gap-3 bg-[var(--color-surface)]">
            <motion.div
              animate={userTurn ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 1, repeat: userTurn ? Infinity : 0 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                userTurn ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-alt)]'
              }`}
            >
              <Mic className={`h-4 w-4 ${userTurn ? 'text-white' : 'text-[var(--color-text-muted)]'}`} />
            </motion.div>
            <div className="flex-1">
              <WaveformBars active={userTurn} />
            </div>
            <span className="text-xs text-[var(--color-text-subtle)]">
              {userTurn ? 'Listening…' : gleeSpeaking ? 'Glee speaking' : 'Waiting'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewMockup;
