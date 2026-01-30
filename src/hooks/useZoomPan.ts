import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

interface UseZoomOptions {
  displayWidth?: number;
  displayHeight?: number;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

interface UseZoomReturn {
  scale: number;
  isPinching: boolean;
  handleWheel: (event: ReactWheelEvent<Element>) => void;
  handleTouchStart: (event: ReactTouchEvent<HTMLCanvasElement>) => boolean;
  reset: () => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getTouchDistance = (touches: TouchList | React.TouchList) => {
  const first = touches[0];
  const second = touches[1];
  if (!first || !second) return 0;
  return Math.hypot(
    second.clientX - first.clientX,
    second.clientY - first.clientY
  );
};

export const useZoomPan = ({
  displayWidth,
  displayHeight,
  minScale = 0.5,
  maxScale = 2.5,
  initialScale = 1,
}: UseZoomOptions = {}): UseZoomReturn => {
  const [scale, setScale] = useState(initialScale);
  const [isPinching, setIsPinching] = useState(false);

  const scaleRef = useRef(initialScale);
  const pinchDataRef = useRef({
    initialDistance: 0,
    initialScale: 1,
  });

  const setScaleSafe = useCallback(
    (next: number) => {
      const clamped = clamp(next, minScale, maxScale);
      if (clamped === scaleRef.current) return;

      scaleRef.current = clamped;
      setScale(clamped);
    },
    [minScale, maxScale]
  );

  const handleWheel = useCallback(
    (event: ReactWheelEvent<Element>) => {
      event.preventDefault();
      event.stopPropagation();

      const deltaY =
        event.deltaMode === 1
          ? event.deltaY * 16
          : event.deltaMode === 2
          ? event.deltaY * (displayHeight ?? 300)
          : event.deltaY;

      const zoomFactor = Math.exp(-deltaY * 0.0015);
      const nextScale = scaleRef.current * zoomFactor;
      setScaleSafe(nextScale);
    },
    [setScaleSafe, displayHeight]
  );

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLCanvasElement>) => {
      if (event.touches.length < 2) {
        return false;
      }

      const distance = getTouchDistance(event.touches);
      if (!distance) {
        return false;
      }

      pinchDataRef.current = {
        initialDistance: distance,
        initialScale: scaleRef.current,
      };
      setIsPinching(true);
      event.preventDefault();
      return true;
    },
    []
  );

  useEffect(() => {
    if (!isPinching) return;

    const handleMove = (event: TouchEvent) => {
      if (event.touches.length < 2) return;
      const distance = getTouchDistance(event.touches);
      if (!distance || pinchDataRef.current.initialDistance === 0) return;

      const scaleFactor =
        distance / pinchDataRef.current.initialDistance;
      const nextScale = pinchDataRef.current.initialScale * scaleFactor;
      setScaleSafe(nextScale);
      event.preventDefault();
    };

    const handleEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        setIsPinching(false);
      }
    };

    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [isPinching, setScaleSafe]);

  const reset = useCallback(() => {
    scaleRef.current = initialScale;
    setScale(initialScale);
  }, [initialScale]);

  return {
    scale,
    isPinching,
    handleWheel,
    handleTouchStart,
    reset,
  };
};

