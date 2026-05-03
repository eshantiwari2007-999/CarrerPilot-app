/**
 * TypewriterText — Streams text character by character for a premium AI typing feel.
 * Calls onDone() when the animation completes so the parent can re-enable scrolling.
 */
import { useEffect, useRef, useState } from "react";
import { AIResponseRenderer } from "./AIResponseRenderer";

interface Props {
  text: string;
  speed?: number; // ms per character
  onDone?: () => void;
}

export function TypewriterText({ text, speed = 12, onDone }: Props) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Reset whenever text changes (new message)
    indexRef.current = 0;
    setDisplayed("");

    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onDone?.();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text]);

  return <AIResponseRenderer text={displayed} animate={false} />;
}
