import { useAnimationFrame } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export interface ContinuousSpinResult {
  /** Current frame index (integer part) */
  frame: number;
  /** Next frame index for interpolation */
  nextFrame: number;
  /** Blend factor between frames (0-1), used for cross-fade interpolation */
  blend: number;
}

/**
 * Hook for continuous 360° spin animation with smooth interpolation support.
 * 
 * @param enabled - Whether the animation is enabled
 * @param duration - Duration in ms for one full rotation (default: 10000ms = 10 seconds)
 * @param totalFrames - Total number of frames in the sprite (default: 72)
 * @returns Object with current frame, next frame, and blend factor for smooth interpolation
 */
export function useContinuousSpin(
  enabled = true,
  duration = 10000,
  totalFrames = 72
): ContinuousSpinResult {
  const [result, setResult] = useState<ContinuousSpinResult>({ 
    frame: 0, 
    nextFrame: 1, 
    blend: 0 
  });
  const startTime = useRef<number | null>(null);
  
  // Use refs to avoid stale closures in useAnimationFrame
  const totalFramesRef = useRef(totalFrames);
  const durationRef = useRef(duration);
  
  // Keep refs in sync with props
  useEffect(() => {
    totalFramesRef.current = totalFrames;
  }, [totalFrames]);
  
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useAnimationFrame((time) => {
    if (!enabled) {
      if (startTime.current !== null) {
        startTime.current = null;
      }
      return;
    }

    if (startTime.current === null) {
      startTime.current = time;
    }

    const elapsed = time - startTime.current;
    const currentDuration = durationRef.current;
    const currentTotalFrames = totalFramesRef.current;
    
    // Calculate progress through the full rotation (0 to 1)
    const progress = (elapsed % currentDuration) / currentDuration;
    // Convert to fractional frame position
    const exactFrame = progress * currentTotalFrames;
    const currentFrame = Math.floor(exactFrame) % currentTotalFrames;
    const nextFrame = (currentFrame + 1) % currentTotalFrames;
    // Blend is the fractional part - how far between current and next frame
    const blend = exactFrame - Math.floor(exactFrame);
    
    setResult({ frame: currentFrame, nextFrame, blend });
  });

  return result;
}
