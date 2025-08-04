import { useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";

export function useBouncePatternProgress(enabled = true) {
  const [value, setValue] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const start = useRef<number | null>(null);

  useAnimationFrame((t) => {
    if (!enabled) {
      // Reset animation when disabled
      if (start.current !== null) {
        start.current = null;
        setValue(0);
        setIsBouncing(false);
      }
      return;
    }

    if (start.current === null) start.current = t;

    const elapsed = (t - start.current) % 3000; // 3s full cycle

    let progress = 0;
    const bouncing = elapsed < 1000; // Bouncing during first 1 second

    if (elapsed < 500) {
      // 0 → 1
      progress = elapsed / 500;
    } else if (elapsed < 1000) {
      // 1 → 0
      progress = 1 - (elapsed - 500) / 500;
    } else {
      // Pause at 0 for 2 seconds
      progress = 0;
    }

    setValue(progress);
    setIsBouncing(bouncing);
  });

  return { value, isBouncing };
}
