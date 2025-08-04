import { useRef, useState, useCallback, useEffect } from "react";
import {
  calculateCircularTime,
  useVideoScrubbing,
} from "./hooks/useVideoScrubbing";
import { useBouncePatternProgress } from "./hooks/useProgressOneSecond";
import { useBuildRender } from "./hooks/useBuildRender";
import { BuildRenderProps } from "./types";
import { LoadingErrorOverlay } from "./components/LoadingErrorOverlay";
import { InstructionTooltip } from "./components/InstructionTooltip";

export const BuildRender: React.FC<BuildRenderProps> = ({
  parts,
  size,
  mouseSensitivity = 0.01,
  touchSensitivity = 0.01,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bouncingAllowed, setBouncingAllowed] = useState(false);

  // Use custom hook for build rendering
  const { videoSrc, isRenderingBuild, renderError } = useBuildRender(parts);

  const { value: progressValue, isBouncing } =
    useBouncePatternProgress(bouncingAllowed);

  const { isDragging, handleMouseDown, handleTouchStart, hasDragged } =
    useVideoScrubbing(videoRef, {
      mouseSensitivity,
      touchSensitivity,
    });

  const handleLoadStartInternal = useCallback(() => {
    setIsLoading(true);
    setBouncingAllowed(false);
  }, []);

  const handleCanPlayInternal = useCallback(() => {
    setIsLoading(false);
    // Start bouncing animation after delay
    setTimeout(() => {
      setBouncingAllowed(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (hasDragged.current || !videoRef.current) return;

    const duration = videoRef.current.duration;
    if (!isFinite(duration)) return;

    const time = calculateCircularTime(0, progressValue, 0.5, duration);

    if (isFinite(time)) {
      videoRef.current.currentTime = time;
    }
  }, [progressValue, hasDragged]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {videoSrc && (
        <video
          key={videoSrc} // Force React to recreate video element when src changes
          ref={videoRef}
          src={videoSrc} // Set src directly on video element
          width={size}
          height={size}
          autoPlay={true}
          preload="metadata"
          muted
          playsInline
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onLoadStart={handleLoadStartInternal}
          onCanPlay={handleCanPlayInternal}
          onLoadedData={() => {
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none", // Prevents default touch behaviors like scrolling
            display: "block",
          }}
        >
          Your browser does not support the video tag.
        </video>
      )}

      <LoadingErrorOverlay
        isVisible={isLoading || isRenderingBuild || !!renderError}
        renderError={renderError || undefined}
        size={size}
      />

      <InstructionTooltip
        isVisible={
          !isLoading &&
          !isRenderingBuild &&
          !renderError &&
          isBouncing &&
          !hasDragged.current
        }
        progressValue={progressValue}
      />
    </div>
  );
};
