import { motion, useAnimation, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Floating particle dots ─────────────────────────────────────── */
function Particles() {
  const dots = [
    { x: "12%",  y: "22%",  s: 4,   delay: 0.2,  color: "#818cf8" },
    { x: "85%",  y: "18%",  s: 3,   delay: 0.5,  color: "#a78bfa" },
    { x: "7%",   y: "68%",  s: 3.5, delay: 0.9,  color: "#60a5fa" },
    { x: "90%",  y: "72%",  s: 4,   delay: 0.35, color: "#c084fc" },
    { x: "48%",  y: "8%",   s: 2.5, delay: 0.7,  color: "#818cf8" },
    { x: "52%",  y: "92%",  s: 3,   delay: 1.1,  color: "#a78bfa" },
    { x: "28%",  y: "85%",  s: 2,   delay: 0.45, color: "#7dd3fc" },
    { x: "74%",  y: "88%",  s: 2.5, delay: 0.8,  color: "#818cf8" },
    { x: "20%",  y: "45%",  s: 2,   delay: 1.3,  color: "#c084fc" },
    { x: "80%",  y: "42%",  s: 2,   delay: 0.6,  color: "#60a5fa" },
  ];

  return (
    <>
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: d.x, top: d.y,
            width: d.s, height: d.s,
            background: d.color,
            filter: "blur(0.5px)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.7, 0.4, 0.7], scale: [0, 1.3, 1, 1.15] }}
          transition={{ duration: 3, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/* ── Grain texture overlay ─────────────────────────────────────── */
function Grain() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px 180px",
        mixBlendMode: "overlay",
      }}
    />
  );
}

/* ── Central glow orb ────────────────────────────────────────────── */
function CenterGlow({ pulse }: { pulse: boolean }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: "50vw",
        height: "50vw",
        maxWidth: 520,
        maxHeight: 520,
        background:
          "radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(59,130,246,0.08) 45%, transparent 75%)",
        filter: "blur(48px)",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={
        pulse
          ? { opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }
          : { opacity: 0.5, scale: 1 }
      }
      transition={
        pulse
          ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 1.2, ease: EASE }
      }
    />
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export function CinematicIntro({ onComplete }: Props) {
  type Phase = "wake" | "brand" | "sub" | "pulse" | "exit";
  const [phase, setPhase] = useState<Phase>("wake");
  const controls = useAnimation();

  useEffect(() => {
    const schedule = [
      { at: 0,    fn: () => setPhase("wake") },
      { at: 500,  fn: () => setPhase("brand") },
      { at: 1600, fn: () => setPhase("sub") },
      { at: 2100, fn: () => setPhase("pulse") },
      { at: 2700, fn: () => setPhase("exit") },
      { at: 3350, fn: () => onComplete() },
    ];

    const timers = schedule.map(({ at, fn }) => window.setTimeout(fn, at));
    return () => timers.forEach(window.clearTimeout);
  }, [onComplete]);

  const isExit = phase === "exit";

  return (
    <AnimatePresence>
      {!isExit || true /* keep mounted until onComplete */}
      <motion.div
        key="cinematic"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, #ffffff 0%, #eff6ff 38%, #f5f3ff 65%, #fdf4ff 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isExit ? 0 : 1, filter: isExit ? "blur(16px)" : "blur(0px)" }}
        transition={{ duration: isExit ? 0.6 : 0.5, ease: "easeInOut" }}
      >
        {/* Grain */}
        <Grain />

        {/* Particles */}
        <Particles />

        {/* Glow orb */}
        <CenterGlow pulse={phase === "pulse"} />

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center">
          {/* STEP 2 — Brand title */}
          <motion.h1
            initial={{ opacity: 0, x: -35, y: 35, rotate: -3, scale: 0.9 }}
            animate={
              phase !== "wake"
                ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
                : {}
            }
            transition={{ duration: 1.0, ease: EASE, delay: 0 }}
            style={{
              fontSize: "clamp(3.2rem, 9vw, 6.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1,
              background:
                "linear-gradient(130deg, #2563eb 0%, #7c3aed 55%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 28px rgba(124,58,237,0.28))",
              marginBottom: "14px",
              fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
            }}
          >
            CareerPilot
          </motion.h1>

          {/* STEP 3 — Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={
              phase === "sub" || phase === "pulse" || phase === "exit"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.15rem)",
              fontWeight: 300,
              letterSpacing: "0.18em",
              color: "#6b7280",
              textTransform: "uppercase",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Your AI Career Companion
          </motion.p>

          {/* STEP 4 — Pulse ring under text */}
          {(phase === "pulse") && (
            <>
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full pointer-events-none"
                  initial={{ scale: 0.6, opacity: 0.6 }}
                  animate={{ scale: 2.5 + i * 0.4, opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay }}
                  style={{
                    width: 180,
                    height: 180,
                    border: "1px solid rgba(124,58,237,0.3)",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Bottom wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "sub" || phase === "pulse" ? 0.4 : 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: "clamp(20px, 5vh, 40px)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            color: "#9ca3af",
            textTransform: "uppercase",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Powered by Gemini AI
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
