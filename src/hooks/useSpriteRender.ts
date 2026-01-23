import { useState, useEffect, useCallback, useRef } from "react";
import { RenderBuildRequest, ApiConfig } from "../types";
import { renderSpriteExperimental, renderBuild, renderByShareCode } from "../api";
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

/**
 * Grid settings for render composition
 */
export interface RenderGridSettings {
  cellThickness?: number;
  sectionThickness?: number;
  color?: string;
  fadeDistance?: number;
  renderOrder?: number;
}

/**
 * Input for sprite rendering - either parts (creates new build) or shareCode (uses existing build)
 */
export type SpriteRenderInput = 
  | { 
      type: 'parts'; 
      parts: RenderBuildRequest;
      showGrid?: boolean;
      cameraOffsetX?: number;
      gridSettings?: RenderGridSettings;
    }
  | { 
      type: 'shareCode'; 
      shareCode: string; 
      profile?: 'cinematic' | 'flat' | 'fast';
      showGrid?: boolean;
      cameraOffsetX?: number;
      gridSettings?: RenderGridSettings;
    };

export const useSpriteRender = (
  input: RenderBuildRequest | SpriteRenderInput,
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
  const previousInputRef = useRef<RenderBuildRequest | SpriteRenderInput | null>(null);

  // Normalize input to SpriteRenderInput format
  const normalizedInput: SpriteRenderInput = 
    'type' in input ? input : { type: 'parts', parts: input };

  const fetchRenderSprite = useCallback(
    async (currentInput: SpriteRenderInput) => {
      try {
        setIsRenderingSprite(true);
        setRenderError(null);
        onLoadStart?.();

        // Handle share code rendering - uses existing build with proper interactive state
        if (currentInput.type === 'shareCode') {
          const { videoUrl: spriteUrl } = await renderByShareCode(
            currentInput.shareCode,
            apiConfig,
            { 
              format: 'sprite', 
              profile: currentInput.profile,
              showGrid: currentInput.showGrid,
              cameraOffsetX: currentInput.cameraOffsetX,
              gridSettings: currentInput.gridSettings
            }
          );

          setSpriteSrc((prevSrc) => {
            if (prevSrc && prevSrc.startsWith("blob:")) {
              URL.revokeObjectURL(prevSrc);
            }
            return spriteUrl;
          });

          setSpriteMetadata({ cols: 12, rows: 6, totalFrames: 72 });
          return;
        }

        // Handle parts-based rendering (creates new build)
        const currentParts = currentInput.parts;
        const mode = options?.mode ?? "async";
        if (mode === "experimental") {
          const response = await renderSpriteExperimental(
            {
              ...currentParts,
              showGrid: currentInput.showGrid,
              cameraOffsetX: currentInput.cameraOffsetX,
              gridSettings: currentInput.gridSettings,
            },
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
            { 
              ...currentParts, 
              format: "sprite",
              showGrid: currentInput.showGrid,
              cameraOffsetX: currentInput.cameraOffsetX,
              gridSettings: currentInput.gridSettings,
            },
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

  // Check if inputs are equal
  const areInputsEqual = (a: SpriteRenderInput | null, b: SpriteRenderInput): boolean => {
    if (!a) return false;
    if (a.type !== b.type) return false;
    if (a.type === 'shareCode' && b.type === 'shareCode') {
      // Compare grid settings (shallow comparison of properties)
      const gridSettingsEqual = 
        JSON.stringify(a.gridSettings ?? {}) === JSON.stringify(b.gridSettings ?? {});
      return a.shareCode === b.shareCode && 
             a.profile === b.profile &&
             a.showGrid === b.showGrid &&
             a.cameraOffsetX === b.cameraOffsetX &&
             gridSettingsEqual;
    }
    if (a.type === 'parts' && b.type === 'parts') {
      // Compare grid settings (shallow comparison of properties)
      const gridSettingsEqual = 
        JSON.stringify(a.gridSettings ?? {}) === JSON.stringify(b.gridSettings ?? {});
      return arePartsEqual(a.parts, b.parts) &&
             a.showGrid === b.showGrid &&
             a.cameraOffsetX === b.cameraOffsetX &&
             gridSettingsEqual;
    }
    return false;
  };

  // Effect to call API when input changes
  useEffect(() => {
    const shouldFetch = !areInputsEqual(previousInputRef.current as SpriteRenderInput | null, normalizedInput);

    if (shouldFetch) {
      previousInputRef.current = normalizedInput;
      fetchRenderSprite(normalizedInput);
    }
  }, [normalizedInput, fetchRenderSprite]);

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
