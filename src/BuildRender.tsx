import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useSpriteScrubbing } from "./hooks/useSpriteScrubbing";
import { useBouncePatternProgress } from "./hooks/useProgressOneSecond";
import { useContinuousSpin } from "./hooks/useContinuousSpin";
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
  cameraZoom,
  gridSettings,
  animationMode = 'bounce',
  spinDuration = 10000,
  interactive = true,
  frameQuality,
  zoom = 1,
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
        cameraZoom,
        gridSettings,
        frameQuality,
      };
    }
    return { 
      type: 'parts', 
      parts: parts!,
      showGrid,
      cameraOffsetX,
      cameraZoom,
      gridSettings,
      frameQuality,
    };
  }, [shareCode, parts, showGrid, cameraOffsetX, cameraZoom, gridSettings, frameQuality]);

  // Use custom hook for sprite rendering
  const { spriteSrc, isRenderingSprite, renderError, spriteMetadata } =
    useSpriteRender(renderInput, apiConfig, undefined, useSpriteRenderOptions);

  const total = spriteMetadata ? spriteMetadata.totalFrames : 72;

  // Animation hooks - only one will be active based on animationMode
  const { value: progressValue, isBouncing } =
    useBouncePatternProgress(bouncingAllowed && animationMode === 'bounce');
  
  const spinResult = useContinuousSpin(
    bouncingAllowed && animationMode === 'spin360',
    spinDuration,
    total
  );
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
    initialScale: zoom,
  });

  // Image/frame sizes - only calculate if image dimensions match expected metadata
  // This prevents using stale image with new metadata during transitions
  const frameW = img ? img.width / cols : 0;
  const frameH = img ? img.height / rows : 0;
  
  // Track expected rows to detect stale images
  const expectedRowsRef = useRef(rows);
  expectedRowsRef.current = rows;

  // ---- Load sprite image ----
  useEffect(() => {
    if (!spriteSrc) {
      setImg(null);
      setIsLoading(true);
      return;
    }

    // Clear current image immediately when source changes to prevent 
    // using old image with new metadata
    setImg(null);
    setIsLoading(true);
    setBouncingAllowed(false);
    
    const i = new Image();
    i.decoding = "async";
    i.loading = "eager";
    i.src = spriteSrc;
    i.onload = () => {
      // Only set the image if rows haven't changed since we started loading
      // This prevents race conditions where metadata updates mid-load
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
    
    // Cleanup: if this effect re-runs (due to spriteSrc or rows change), 
    // the new effect will clear the image
    return () => {
      // Abort loading if component updates before load completes
      i.onload = null;
      i.onerror = null;
    };
  }, [spriteSrc, rows]);

  // ---- Drawing function with optional cross-fade interpolation ----
  const draw = useCallback(
    (frameIndex: number, nextFrameIndex?: number, blend?: number) => {
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

      // Calculate destination dimensions (letterboxing)
      const sw = Math.round(frameW);
      const sh = Math.round(frameH);
      const frameAspect = sw / sh;
      const canvasAspect = targetW / targetH;

      let drawW: number, drawH: number;
      if (frameAspect > canvasAspect) {
        drawW = targetW;
        drawH = targetW / frameAspect;
      } else {
        drawH = targetH;
        drawW = targetH * frameAspect;
      }

      // Apply zoom scale
      drawW *= scale;
      drawH *= scale;

      // Center in canvas
      const drawX = (targetW - drawW) / 2;
      const drawY = (targetH - drawH) / 2;

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Helper to draw a specific frame
      const drawFrame = (frameIdx: number, opacity: number) => {
        let n = Math.round(frameIdx) % total;
        if (n < 0) n += total;
        
        const r = Math.floor(n / cols);
        const c = n % cols;
        const sx = Math.round(c * frameW);
        const sy = Math.round(r * frameH);

        ctx.globalAlpha = opacity;
        ctx.drawImage(img, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
      };

      // Cross-fade interpolation for smooth animation
      if (nextFrameIndex !== undefined && blend !== undefined && blend > 0.01) {
        // Draw current frame at full opacity first
        drawFrame(frameIndex, 1);
        // Then overlay next frame with blend opacity for smooth transition
        drawFrame(nextFrameIndex, blend);
        ctx.globalAlpha = 1; // Reset
      } else {
        // Single frame draw (no interpolation)
        drawFrame(frameIndex, 1);
      }
    },
    [img, frameW, frameH, displayW, displayH, cols, rows, total, scale]
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

  // Auto-rotate when animation is allowed and user hasn't manually dragged
  useEffect(() => {
    if ((interactive && hasDragged.current) || !img) return;

    if (animationMode === 'spin360') {
      // Continuous 360 spin with cross-fade interpolation for smoothness
      frameRef.current = spinResult.frame;
      draw(spinResult.frame, spinResult.nextFrame, spinResult.blend);
    } else {
      // Bounce animation (no interpolation needed - it pauses between movements)
      const frame = ((progressValue / 5) * total) % total;
      frameRef.current = frame;
      draw(frame);
    }
  }, [progressValue, spinResult, hasDragged, img, total, draw, animationMode, interactive]);

  // Reset zoom when sprite changes or container size updates
  useEffect(() => {
    resetZoom();
  }, [spriteSrc, displayW, displayH, resetZoom]);

  // Add native wheel event listener to prevent scrolling AND handle zoom (only when interactive)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !interactive) return;

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
  }, [handleZoomWheel, scale, displayH, interactive]);

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
          onMouseDown={interactive ? handleMouseDown : undefined}
          onTouchStart={interactive ? handleCanvasTouchStart : undefined}
          style={{
            width: displayW,
            height: displayH,
            cursor: interactive ? (isDragging ? "grabbing" : "grab") : "pointer",
            touchAction: interactive ? "none" : "auto",
            display: "block",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            pointerEvents: interactive ? "auto" : "none", // Allow click-through when not interactive
          }}
          role="img"
          aria-label="360° viewer"
          onContextMenu={interactive ? (e) => e.preventDefault() : undefined}
        />
      )}

      <LoadingErrorOverlay
        isVisible={isLoading || isRenderingSprite || !!renderError}
        renderError={renderError || undefined}
        size={Math.min(displayW, displayH)}
      />

      <InstructionTooltip
        isVisible={
          interactive &&
          animationMode === 'bounce' &&
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
