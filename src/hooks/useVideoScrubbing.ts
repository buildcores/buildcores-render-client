import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type RefObject,
} from "react";

// Helper to extract clientX from mouse or touch events
const getClientX = (e: MouseEvent | TouchEvent): number => {
  return "touches" in e ? e.touches[0].clientX : e.clientX;
};

// Helper to calculate new video time with circular wrapping
export const calculateCircularTime = (
  startTime: number,
  deltaX: number,
  sensitivity: number,
  duration: number
): number => {
  const timeDelta = deltaX * sensitivity;
  let newTime = startTime + timeDelta;

  // Make it circular - wrap around when going past boundaries
  newTime = newTime % duration;
  if (newTime < 0) {
    newTime += duration;
  }

  return newTime;
};

interface UseVideoScrubbingOptions {
  mouseSensitivity?: number;
  touchSensitivity?: number;
  progressSensitivity?: number;
  useProgressScrubbing?: boolean;
}

export const useVideoScrubbing = (
  videoRef: RefObject<HTMLVideoElement | null>,
  options: UseVideoScrubbingOptions = {}
) => {
  const { mouseSensitivity = 0.01, touchSensitivity = 0.01 } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const hasDragged = useRef(false);

  // Helper to start dragging (common logic for mouse and touch)
  const startDrag = useCallback(
    (clientX: number, event: Event) => {
      if (!videoRef.current) return;

      setIsDragging(true);
      setDragStartX(clientX);
      setDragStartTime(videoRef.current.currentTime);
      hasDragged.current = true;
      event.preventDefault();
    },
    [videoRef]
  );

  // Helper to handle drag movement (common logic for mouse and touch)
  const handleDragMove = useCallback(
    (clientX: number, sensitivity: number) => {
      if (!isDragging || !videoRef.current) return;

      const deltaX = clientX - dragStartX;
      const duration = videoRef.current.duration || 0;

      if (duration > 0) {
        const newTime = calculateCircularTime(
          dragStartTime,
          deltaX,
          sensitivity,
          duration
        );
        videoRef.current.currentTime = newTime;
      }
    },
    [isDragging, dragStartX, dragStartTime, videoRef]
  );

  // Helper to end dragging (common logic for mouse and touch)
  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startDrag(e.clientX, e.nativeEvent);
    },
    [startDrag]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startDrag(e.touches[0].clientX, e.nativeEvent);
    },
    [startDrag]
  );

  const handleDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(getClientX(e), mouseSensitivity);
    },
    [handleDragMove, mouseSensitivity]
  );

  const handleDocumentTouchMove = useCallback(
    (e: TouchEvent) => {
      handleDragMove(getClientX(e), touchSensitivity);
    },
    [handleDragMove, touchSensitivity]
  );

  const handleDocumentMouseUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleDocumentTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  // Add document-level event listeners when dragging starts
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDocumentMouseMove);
      document.addEventListener("mouseup", handleDocumentMouseUp);
      document.addEventListener("touchmove", handleDocumentTouchMove);
      document.addEventListener("touchend", handleDocumentTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleDocumentMouseMove);
        document.removeEventListener("mouseup", handleDocumentMouseUp);
        document.removeEventListener("touchmove", handleDocumentTouchMove);
        document.removeEventListener("touchend", handleDocumentTouchEnd);
      };
    }
  }, [
    isDragging,
    handleDocumentMouseMove,
    handleDocumentMouseUp,
    handleDocumentTouchMove,
    handleDocumentTouchEnd,
  ]);

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
    hasDragged,
  };
};
