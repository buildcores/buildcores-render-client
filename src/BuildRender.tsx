import { useRef, useState, useCallback, useEffect } from "react";
import {
  calculateCircularTime,
  useVideoScrubbing,
} from "./hooks/useVideoScrubbing";
import { useBouncePatternProgress } from "./hooks/useProgressOneSecond";
import { BuildRenderProps } from "./types";
import { DragIcon } from "./components/DragIcon";

export const BuildRender: React.FC<BuildRenderProps> = ({
  src,
  size,
  mouseSensitivity = 0.005,
  touchSensitivity = 0.01,
  instructionDelay = 2000,
  instructionIcon,
  onLoadStart,
  onCanPlay,
  onProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [bouncingAllowed, setBouncingAllowed] = useState(false);

  const { value: progressValue, isBouncing } =
    useBouncePatternProgress(bouncingAllowed);

  const { isDragging, handleMouseDown, handleTouchStart, hasDragged } =
    useVideoScrubbing(videoRef, {
      mouseSensitivity,
      touchSensitivity,
    });

  const handleLoadStartInternal = useCallback(() => {
    setIsLoading(true);
    setLoadProgress(0);
    setBouncingAllowed(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleProgressInternal = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100;
          setLoadProgress(progress);
          onProgress?.(progress);
        }
      }
    }
  }, [onProgress]);

  const handleCanPlayInternal = useCallback(() => {
    setIsLoading(false);
    onCanPlay?.();
    // Start bouncing animation after delay
    setTimeout(() => {
      setBouncingAllowed(true);
    }, instructionDelay);
  }, [onCanPlay, instructionDelay]);

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
      <video
        ref={videoRef}
        width={size}
        height={size}
        autoPlay={true}
        preload="metadata"
        muted
        playsInline
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onLoadStart={handleLoadStartInternal}
        onProgress={handleProgressInternal}
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
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            zIndex: 10,
          }}
        >
          <div style={{ marginBottom: "20px", fontSize: "18px" }}>
            Loading Build...
          </div>
          <div
            style={{
              width: Math.min(300, size * 0.6),
              height: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#4CAF50",
                borderRadius: "2px",
                width: `${loadProgress}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            {Math.round(loadProgress)}%
          </div>
        </div>
      )}

      {!isLoading && isBouncing && !hasDragged.current && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translateX(${
              progressValue * 100
            }px)`,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            pointerEvents: "none",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {instructionIcon ? (
            <img
              src={instructionIcon}
              alt="drag to view 360"
              style={{
                width: "24px",
                height: "24px",
                filter: "invert(1)", // Makes the icon white
              }}
            />
          ) : (
            <DragIcon
              width={24}
              height={24}
              style={{
                color: "white",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
