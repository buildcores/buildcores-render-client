import { useRef, useState, useCallback, useEffect } from "react";
import {
  calculateCircularTime,
  useVideoScrubbing,
} from "./hooks/useVideoScrubbing";
import { useBouncePatternProgress } from "./hooks/useProgressOneSecond";
import { useBuildRender } from "./hooks/useBuildRender";
import { BuildRenderVideoProps } from "./types";
import { LoadingErrorOverlay } from "./components/LoadingErrorOverlay";
import { InstructionTooltip } from "./components/InstructionTooltip";

export const BuildRenderVideo: React.FC<BuildRenderVideoProps> = ({
  parts,
  width,
  height,
  size,
  apiConfig,
  mouseSensitivity = 0.01,
  touchSensitivity = 0.01,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bouncingAllowed, setBouncingAllowed] = useState(false);

  const displayW = width ?? size ?? 300;
  const displayH = height ?? size ?? 300;

  // Use custom hook for build rendering
  const { videoSrc, isRenderingBuild, renderError } = useBuildRender(
    parts,
    apiConfig
  );

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
    <div style={{ position: "relative", width: displayW, height: displayH }}>
      {videoSrc && (
        <video
          key={videoSrc} // Force React to recreate video element when src changes
          ref={videoRef}
          src={videoSrc} // Set src directly on video element
          width={displayW}
          height={displayH}
          autoPlay={true}
          preload="metadata"
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          {...({ "x-webkit-airplay": "deny" } as any)}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onLoadStart={handleLoadStartInternal}
          onCanPlay={handleCanPlayInternal}
          onLoadedData={() => {
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }}
          style={
            {
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none", // Prevents default touch behaviors like scrolling
              display: "block",
              // Completely hide video controls on all browsers including mobile
              WebkitMediaControls: "none",
              MozMediaControls: "none",
              OMediaControls: "none",
              msMediaControls: "none",
              mediaControls: "none",
              // Additional iOS-specific properties
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
            } as React.CSSProperties
          }
        >
          Your browser does not support the video tag.
        </video>
      )}

      <LoadingErrorOverlay
        isVisible={isLoading || isRenderingBuild || !!renderError}
        renderError={renderError || undefined}
        size={Math.min(displayW, displayH)}
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
