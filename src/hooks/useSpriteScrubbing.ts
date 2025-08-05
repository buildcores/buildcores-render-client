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

// Helper to calculate new frame with circular wrapping
export const calculateCircularFrame = (
  startFrame: number,
  deltaX: number,
  sensitivity: number,
  totalFrames: number
): number => {
  const frameDelta = deltaX * sensitivity;
  let newFrame = startFrame + frameDelta;

  // Make it circular - wrap around when going past boundaries
  newFrame = newFrame % totalFrames;
  if (newFrame < 0) {
    newFrame += totalFrames;
  }

  return newFrame;
};

interface UseSpiteScrubbingOptions {
  mouseSensitivity?: number;
  touchSensitivity?: number;
  onFrameChange?: (frame: number) => void;
}

export const useSpriteScrubbing = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  totalFrames: number,
  options: UseSpiteScrubbingOptions = {}
) => {
  const {
    mouseSensitivity = 0.1,
    touchSensitivity = 0.1,
    onFrameChange,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartFrame, setDragStartFrame] = useState(0);
  const hasDragged = useRef(false);
  const currentFrame = useRef(0);

  // Helper to start dragging (common logic for mouse and touch)
  const startDrag = useCallback(
    (clientX: number, event: Event) => {
      if (!canvasRef.current) return;

      setIsDragging(true);
      setDragStartX(clientX);
      setDragStartFrame(currentFrame.current);
      hasDragged.current = true;
      event.preventDefault();
    },
    [canvasRef]
  );

  // Helper to handle drag movement (common logic for mouse and touch)
  const handleDragMove = useCallback(
    (clientX: number, sensitivity: number) => {
      if (!isDragging || !canvasRef.current) return;

      const deltaX = clientX - dragStartX;

      const newFrame = calculateCircularFrame(
        dragStartFrame,
        deltaX, // Positive for natural "spin right" feel
        sensitivity,
        totalFrames
      );

      currentFrame.current = newFrame;

      // Call the frame change callback if provided
      if (onFrameChange) {
        onFrameChange(newFrame);
      }

      return newFrame;
    },
    [isDragging, dragStartX, dragStartFrame, totalFrames, onFrameChange]
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
      return handleDragMove(getClientX(e), mouseSensitivity);
    },
    [handleDragMove, mouseSensitivity]
  );

  const handleDocumentTouchMove = useCallback(
    (e: TouchEvent) => {
      return handleDragMove(getClientX(e), touchSensitivity);
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
    currentFrame: currentFrame.current,
    setCurrentFrame: (frame: number) => {
      currentFrame.current = frame;
    },
  };
};
