import { useState, useEffect, useCallback, useRef } from "react";
import { RenderBuildRequest, PartCategory } from "../types";
import { renderBuildExperimental } from "../api";

/**
 * Compares two RenderBuildRequest objects for equality by checking if the same IDs
 * are present in each category array, regardless of order.
 */
export const arePartsEqual = (
  parts1: RenderBuildRequest,
  parts2: RenderBuildRequest
): boolean => {
  const categories = Object.values(PartCategory);

  for (const category of categories) {
    const arr1 = parts1.parts[category] || [];
    const arr2 = parts2.parts[category] || [];

    // Check if arrays have the same length
    if (arr1.length !== arr2.length) {
      return false;
    }

    // Check if arrays contain the same elements (order doesn't matter)
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    if (set1.size !== set2.size) {
      return false;
    }

    for (const id of set1) {
      if (!set2.has(id)) {
        return false;
      }
    }
  }

  return true;
};

export interface UseBuildRenderReturn {
  videoSrc: string | null;
  isRenderingBuild: boolean;
  renderError: string | null;
}

export const useBuildRender = (
  parts: RenderBuildRequest,
  onLoadStart?: () => void
): UseBuildRenderReturn => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isRenderingBuild, setIsRenderingBuild] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const previousPartsRef = useRef<RenderBuildRequest | null>(null);

  const fetchRenderBuild = useCallback(
    async (currentParts: RenderBuildRequest) => {
      console.log("fetchRenderBuild", currentParts.parts.PCCase);
      try {
        setIsRenderingBuild(true);
        setRenderError(null);
        onLoadStart?.();

        const response = await renderBuildExperimental(currentParts);
        const objectUrl = URL.createObjectURL(response.video);

        // Clean up previous video URL before setting new one
        setVideoSrc((prevSrc) => {
          if (prevSrc) {
            URL.revokeObjectURL(prevSrc);
          }
          return objectUrl;
        });
      } catch (error) {
        setRenderError(
          error instanceof Error ? error.message : "Failed to render build"
        );
      } finally {
        setIsRenderingBuild(false);
      }
    },
    [onLoadStart]
  );

  // Effect to call API when parts content changes (using custom equality check)
  useEffect(() => {
    const shouldFetch =
      previousPartsRef.current === null ||
      !arePartsEqual(previousPartsRef.current, parts);

    if (shouldFetch) {
      previousPartsRef.current = parts;
      fetchRenderBuild(parts);
    }
  }, [parts, fetchRenderBuild]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  return {
    videoSrc,
    isRenderingBuild,
    renderError,
  };
};
