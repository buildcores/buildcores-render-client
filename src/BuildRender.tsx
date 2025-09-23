import { useRef, useState, useCallback, useEffect } from "react";
import { useSpriteScrubbing } from "./hooks/useSpriteScrubbing";
import { useBouncePatternProgress } from "./hooks/useProgressOneSecond";
import { useSpriteRender } from "./hooks/useSpriteRender";
import { BuildRenderProps } from "./types";
import { LoadingErrorOverlay } from "./components/LoadingErrorOverlay";
import { InstructionTooltip } from "./components/InstructionTooltip";

export const BuildRender: React.FC<BuildRenderProps> = ({
  parts,
  width,
  height,
  size,
  apiConfig,
  useSpriteRenderOptions,
  mouseSensitivity = 0.2,
  touchSensitivity = 0.2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bouncingAllowed, setBouncingAllowed] = useState(false);

  const displayW = width ?? size ?? 300;
  const displayH = height ?? size ?? 300;

  // Use custom hook for sprite rendering
  const { spriteSrc, isRenderingSprite, renderError, spriteMetadata } =
    useSpriteRender(parts, apiConfig, undefined, useSpriteRenderOptions);

  const { value: progressValue, isBouncing } =
    useBouncePatternProgress(bouncingAllowed);

  const total = spriteMetadata ? spriteMetadata.totalFrames : 72;
  const cols = spriteMetadata ? spriteMetadata.cols : 12;
  const rows = spriteMetadata ? spriteMetadata.rows : 6;
  const frameRef = useRef(0);

  // Image/frame sizes
  const frameW = img ? img.width / cols : 0;
  const frameH = img ? img.height / rows : 0;

  // ---- Load sprite image ----
  useEffect(() => {
    if (!spriteSrc) {
      setImg(null);
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    const i = new Image();
    i.decoding = "async";
    i.loading = "eager";
    i.src = spriteSrc;
    i.onload = () => {
      setImg(i);
      setIsLoading(false);
      // Start bouncing animation after delay
      setTimeout(() => {
        setBouncingAllowed(true);
      }, 2000);
    };
    i.onerror = () => {
      setImg(null);
      setIsLoading(false);
    };
  }, [spriteSrc]);

  // ---- Drawing function ----
  const draw = useCallback(
    (frameIndex: number) => {
      const cnv = canvasRef.current;
      if (!cnv || !img || !frameW || !frameH) return;

      const ctx = cnv.getContext("2d");
      if (!ctx) return;

      // Backing store sized for HiDPI; CSS size stays `size`
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const targetW = Math.round(displayW * dpr);
      const targetH = Math.round(displayH * dpr);
      if (cnv.width !== targetW || cnv.height !== targetH) {
        cnv.width = targetW;
        cnv.height = targetH;
      }

      // Snap to integer frame (never between tiles)
      let n = Math.round(frameIndex) % total;
      if (n < 0) n += total;

      const r = Math.floor(n / cols);
      const c = n % cols;

      // Use integer source rects to avoid sampling bleed across tiles
      const sx = Math.round(c * frameW);
      const sy = Math.round(r * frameH);
      const sw = Math.round(frameW);
      const sh = Math.round(frameH);

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    },
    [img, frameW, frameH, displayW, displayH, cols, total]
  );

  const { isDragging, handleMouseDown, handleTouchStart, hasDragged } =
    useSpriteScrubbing(canvasRef, total, {
      mouseSensitivity,
      touchSensitivity,
      onFrameChange: (newFrame: number) => {
        frameRef.current = newFrame;
        draw(newFrame);
      },
    });

  const handleLoadStartInternal = useCallback(() => {
    setIsLoading(true);
    setBouncingAllowed(false);
  }, []);

  // Auto-rotate when bouncing is allowed and not dragged
  useEffect(() => {
    if (hasDragged.current || !img) return;

    // Calculate frame based on progress value (similar to video time calculation)
    const frame = ((progressValue / 5) * total) % total;
    frameRef.current = frame;
    draw(frame);
  }, [progressValue, hasDragged, img, total, draw]);

  // Initial draw once image is ready
  useEffect(() => {
    if (img && !isLoading) {
      draw(frameRef.current);
    }
  }, [img, isLoading, draw]);

  return (
    <div
      style={{
        position: "relative",
        width: displayW,
        height: displayH,
        backgroundColor: "black",
      }}
    >
      {img && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            width: displayW,
            height: displayH,
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none", // Prevents default touch behaviors like scrolling
            display: "block",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          }}
          role="img"
          aria-label="360° viewer"
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      <LoadingErrorOverlay
        isVisible={isLoading || isRenderingSprite || !!renderError}
        renderError={renderError || undefined}
        size={Math.min(displayW, displayH)}
      />

      <InstructionTooltip
        isVisible={
          !isLoading &&
          !isRenderingSprite &&
          !renderError &&
          isBouncing &&
          !hasDragged.current
        }
        progressValue={progressValue}
      />
    </div>
  );
};
