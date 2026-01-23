import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useSpriteScrubbing } from "./hooks/useSpriteScrubbing";
import { useBouncePatternProgress } from "./hooks/useProgressOneSecond";
import { useSpriteRender, SpriteRenderInput } from "./hooks/useSpriteRender";
import { BuildRenderProps } from "./types";
import { LoadingErrorOverlay } from "./components/LoadingErrorOverlay";
import { InstructionTooltip } from "./components/InstructionTooltip";
import { useZoomPan } from "./hooks/useZoomPan";
import type { WheelEvent as ReactWheelEvent } from "react";

export const BuildRender: React.FC<BuildRenderProps> = ({
  parts,
  shareCode,
  width,
  height,
  size,
  apiConfig,
  useSpriteRenderOptions,
  mouseSensitivity = 0.2,
  touchSensitivity = 0.2,
  showGrid,
  cameraOffsetX,
  gridSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bouncingAllowed, setBouncingAllowed] = useState(false);

  const displayW = width ?? size ?? 300;
  const displayH = height ?? size ?? 300;

  // Build the render input - prefer shareCode if provided (preserves interactive state like case fan slots)
  const renderInput: SpriteRenderInput = useMemo(() => {
    if (shareCode) {
      return { 
        type: 'shareCode', 
        shareCode, 
        profile: parts?.profile,
        showGrid,
        cameraOffsetX,
        gridSettings,
      };
    }
    return { 
      type: 'parts', 
      parts: parts!,
      showGrid,
      cameraOffsetX,
      gridSettings,
    };
  }, [shareCode, parts, showGrid, cameraOffsetX, gridSettings]);

  // Use custom hook for sprite rendering
  const { spriteSrc, isRenderingSprite, renderError, spriteMetadata } =
    useSpriteRender(renderInput, apiConfig, undefined, useSpriteRenderOptions);

  const { value: progressValue, isBouncing } =
    useBouncePatternProgress(bouncingAllowed);

  const total = spriteMetadata ? spriteMetadata.totalFrames : 72;
  const cols = spriteMetadata ? spriteMetadata.cols : 12;
  const rows = spriteMetadata ? spriteMetadata.rows : 6;
  const frameRef = useRef(0);

  const {
    scale,
    handleWheel: handleZoomWheel,
    handleTouchStart: handleZoomTouchStart,
    reset: resetZoom,
  } = useZoomPan({
    displayWidth: displayW,
    displayHeight: displayH,
  });

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

      const scaledW = targetW * scale;
      const scaledH = targetH * scale;
      const offsetX = -((scaledW - targetW) / 2);
      const offsetY = -((scaledH - targetH) / 2);

      ctx.drawImage(img, sx, sy, sw, sh, offsetX, offsetY, scaledW, scaledH);
    },
    [img, frameW, frameH, displayW, displayH, cols, total, scale]
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

  // Reset zoom when sprite changes or container size updates
  useEffect(() => {
    resetZoom();
  }, [spriteSrc, displayW, displayH, resetZoom]);

  // Add native wheel event listener to prevent scrolling AND handle zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Manually trigger zoom since we're preventing the React event
      const deltaY =
        event.deltaMode === 1
          ? event.deltaY * 16
          : event.deltaMode === 2
          ? event.deltaY * (displayH ?? 300)
          : event.deltaY;

      const zoomFactor = Math.exp(-deltaY * 0.0015);
      const nextScale = scale * zoomFactor;
      
      // We need to call the zoom handler directly
      // Create a synthetic React event-like object
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
        currentTarget: container,
      } as any;
      
      handleZoomWheel(syntheticEvent);
      hasDragged.current = true;
    };

    // Add listener to container to catch all wheel events
    container.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [handleZoomWheel, scale, displayH]);

  // Initial draw once image is ready or zoom changes
  useEffect(() => {
    if (img && !isLoading) {
      draw(frameRef.current);
    }
  }, [img, isLoading, draw]);

  const handleCanvasTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (handleZoomTouchStart(event)) {
        hasDragged.current = true;
        return;
      }

      handleTouchStart(event);
    },
    [handleZoomTouchStart, handleTouchStart, hasDragged]
  );

  const handleCanvasWheel = useCallback(
    (event: ReactWheelEvent<Element>) => {
      hasDragged.current = true;
      handleZoomWheel(event);
    },
    [handleZoomWheel, hasDragged]
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: displayW,
        height: displayH,
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      {img && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleCanvasTouchStart}
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
