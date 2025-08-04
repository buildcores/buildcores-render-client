export interface BuildRenderProps {
  /**
   * Video source URL
   */
  src: string;

  /**
   * Video size in pixels (width and height will be the same)
   */
  size: number;

  /**
   * Optional mouse sensitivity for dragging (default: 0.005)
   */
  mouseSensitivity?: number;

  /**
   * Optional touch sensitivity for dragging (default: 0.01)
   */
  touchSensitivity?: number;

  /**
   * Optional delay before showing the bounce instruction in milliseconds (default: 2000)
   */
  instructionDelay?: number;

  /**
   * Optional custom icon URL for the drag instruction
   */
  instructionIcon?: string;

  /**
   * Optional callback when video loading starts
   */
  onLoadStart?: () => void;

  /**
   * Optional callback when video can start playing
   */
  onCanPlay?: () => void;

  /**
   * Optional callback with loading progress (0-100)
   */
  onProgress?: (progress: number) => void;
}
