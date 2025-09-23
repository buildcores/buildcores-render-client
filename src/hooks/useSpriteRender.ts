import { useState, useEffect, useCallback, useRef } from "react";
import { RenderBuildRequest, ApiConfig } from "../types";
import { renderSpriteExperimental, renderBuild } from "../api";
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

export interface UseSpriteRenderOptions {
  /**
   * Choose which backend flow to use
   * - 'async' (default): uses /render-build and polls /render-build/{jobId} with format 'sprite'
   * - 'experimental': uses /render-build-experimental and returns Blob
   */
  mode?: "async" | "experimental";
}

export const useSpriteRender = (
  parts: RenderBuildRequest,
  apiConfig: ApiConfig,
  onLoadStart?: () => void,
  options?: UseSpriteRenderOptions
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

        const mode = options?.mode ?? "async";
        if (mode === "experimental") {
          const response = await renderSpriteExperimental(
            currentParts,
            apiConfig
          );
          const objectUrl = URL.createObjectURL(response.sprite);

          // Clean up previous sprite URL before setting new one
          setSpriteSrc((prevSrc) => {
            if (prevSrc && prevSrc.startsWith("blob:")) {
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
        } else {
          // Async job-based flow: request sprite format and use returned URL
          const { videoUrl: spriteUrl } = await renderBuild(
            { ...currentParts, format: "sprite" },
            apiConfig
          );

          setSpriteSrc((prevSrc) => {
            if (prevSrc && prevSrc.startsWith("blob:")) {
              URL.revokeObjectURL(prevSrc);
            }
            return spriteUrl;
          });

          // No metadata from async endpoint; keep defaults
          setSpriteMetadata({ cols: 12, rows: 6, totalFrames: 72 });
        }
      } catch (error) {
        setRenderError(
          error instanceof Error ? error.message : "Failed to render sprite"
        );
      } finally {
        setIsRenderingSprite(false);
      }
    },
    [apiConfig, onLoadStart, options?.mode]
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
      if (spriteSrc && spriteSrc.startsWith("blob:")) {
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
