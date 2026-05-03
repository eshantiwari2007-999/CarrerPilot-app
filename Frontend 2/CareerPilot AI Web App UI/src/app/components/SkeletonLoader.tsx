/**
 * SkeletonLoader — shimmering placeholder lines for AI result areas.
 * Use to replace spinners while content loads for a premium feel.
 */
import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface SkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
}

function SkeletonLine({ width = "100%", height = "h-3", className = "" }: SkeletonLineProps) {
  return (
    <div
      className={`${height} rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer ${className}`}
      style={{ width }}
    />
  );
}

/** Multi-line text skeleton block */
export function SkeletonText({ lines = 4 }: { lines?: number }) {
  const widths = ["100%", "92%", "97%", "75%", "88%", "95%", "60%"];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 p-2"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={widths[i % widths.length]} />
      ))}
    </motion.div>
  );
}

/** Card skeleton for resume-style output */
export function SkeletonResume() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 p-2">
      {/* Name heading */}
      <SkeletonLine width="55%" height="h-5" />
      <SkeletonLine width="35%" height="h-3" className="mt-1" />
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <SkeletonLine width="25%" height="h-3.5" />
        <SkeletonLine width="100%" />
        <SkeletonLine width="96%" />
        <SkeletonLine width="80%" />
      </div>
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <SkeletonLine width="20%" height="h-3.5" />
        <div className="flex gap-2 flex-wrap">
          {[50, 70, 55, 65, 80, 45].map((w, i) => (
            <div key={i} className="h-6 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <SkeletonLine width="30%" height="h-3.5" />
        <SkeletonLine />
        <SkeletonLine width="90%" />
        <SkeletonLine width="85%" />
      </div>
    </motion.div>
  );
}

/** Roadmap skeleton with phase blocks */
export function SkeletonRoadmap() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-2">
      {[1, 2, 3].map((phase) => (
        <div key={phase} className="space-y-2">
          <SkeletonLine width="40%" height="h-4" />
          <div className="ml-3 space-y-2 pt-1">
            <SkeletonLine width="95%" />
            <SkeletonLine width="88%" />
            <SkeletonLine width="75%" />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ── Rotating thinking text ─────────────────────────────────────────────────
export function ThinkingLabel({ steps }: { steps: string[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % steps.length), 2000);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <motion.span
      key={idx}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3 }}
      className="inline-block"
    >
      {steps[idx]}
    </motion.span>
  );
}
