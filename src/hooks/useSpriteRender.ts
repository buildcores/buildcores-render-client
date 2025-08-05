import { useState, useEffect, useCallback, useRef } from "react";
import { RenderBuildRequest } from "../types";
import { renderSpriteExperimental } from "../api";
import { arePartsEqual } from "./useBuildRender";

export interface UseSpriteRenderReturn {
  spriteSrc: string | null;
  isRenderingSprite: boolean;
  renderError: string | null;
  spriteMetadata: {
    cols: number;
    rows: number;
    totalFrames: number;
  } | null;
}

export const useSpriteRender = (
  parts: RenderBuildRequest,
  onLoadStart?: () => void
): UseSpriteRenderReturn => {
  const [spriteSrc, setSpriteSrc] = useState<string | null>(null);
  const [isRenderingSprite, setIsRenderingSprite] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [spriteMetadata, setSpriteMetadata] = useState<{
    cols: number;
    rows: number;
    totalFrames: number;
  } | null>(null);
  const previousPartsRef = useRef<RenderBuildRequest | null>(null);

  const fetchRenderSprite = useCallback(
    async (currentParts: RenderBuildRequest) => {
      try {
        setIsRenderingSprite(true);
        setRenderError(null);
        onLoadStart?.();

        const response = await renderSpriteExperimental(currentParts);
        const objectUrl = URL.createObjectURL(response.sprite);

        // Clean up previous sprite URL before setting new one
        setSpriteSrc((prevSrc) => {
          if (prevSrc) {
            URL.revokeObjectURL(prevSrc);
          }
          return objectUrl;
        });

        // Set sprite metadata
        setSpriteMetadata({
          cols: response.metadata?.cols || 12,
          rows: response.metadata?.rows || 6,
          totalFrames: response.metadata?.totalFrames || 72,
        });
      } catch (error) {
        setRenderError(
          error instanceof Error ? error.message : "Failed to render sprite"
        );
      } finally {
        setIsRenderingSprite(false);
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
      fetchRenderSprite(parts);
    }
  }, [parts, fetchRenderSprite]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (spriteSrc) {
        URL.revokeObjectURL(spriteSrc);
      }
    };
  }, [spriteSrc]);

  return {
    spriteSrc,
    isRenderingSprite,
    renderError,
    spriteMetadata,
  };
};
