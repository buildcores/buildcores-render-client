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
      cameraZoom?: number;
      gridSettings?: RenderGridSettings;
      frameQuality?: 'standard' | 'high';
    }
  | { 
      type: 'shareCode'; 
      shareCode: string; 
      profile?: 'cinematic' | 'flat' | 'fast';
      showGrid?: boolean;
      cameraOffsetX?: number;
      cameraZoom?: number;
      gridSettings?: RenderGridSettings;
      frameQuality?: 'standard' | 'high';
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
              cameraZoom: currentInput.cameraZoom,
              gridSettings: currentInput.gridSettings,
              frameQuality: currentInput.frameQuality
            }
          );

          // Set metadata BEFORE sprite URL to avoid race condition
          // (image load starts immediately when spriteSrc changes)
          const rows = currentInput.frameQuality === 'high' ? 12 : 6;
          setSpriteMetadata({ cols: 12, rows, totalFrames: 12 * rows });

          setSpriteSrc((prevSrc) => {
            if (prevSrc && prevSrc.startsWith("blob:")) {
              URL.revokeObjectURL(prevSrc);
            }
            return spriteUrl;
          });
          return;
        }

        // Handle parts-based rendering (creates new build)
        const currentParts = currentInput.parts;
        const mode = options?.mode ?? "async";
        const frameQuality = currentInput.frameQuality;
        const rows = frameQuality === 'high' ? 12 : 6;
        
        if (mode === "experimental") {
          const response = await renderSpriteExperimental(
            {
              ...currentParts,
              showGrid: currentInput.showGrid,
              cameraOffsetX: currentInput.cameraOffsetX,
              cameraZoom: currentInput.cameraZoom,
              gridSettings: currentInput.gridSettings,
              frameQuality,
            },
            apiConfig
          );
          const objectUrl = URL.createObjectURL(response.sprite);

          // Set sprite metadata BEFORE sprite URL to avoid race condition
          setSpriteMetadata({
            cols: response.metadata?.cols || 12,
            rows: response.metadata?.rows || rows,
            totalFrames: response.metadata?.totalFrames || 12 * rows,
          });

          // Clean up previous sprite URL before setting new one
          setSpriteSrc((prevSrc) => {
            if (prevSrc && prevSrc.startsWith("blob:")) {
              URL.revokeObjectURL(prevSrc);
            }
            return objectUrl;
          });
        } else {
          // Async job-based flow: request sprite format and use returned URL
          const { videoUrl: spriteUrl } = await renderBuild(
            { 
              ...currentParts, 
              format: "sprite",
              showGrid: currentInput.showGrid,
              cameraOffsetX: currentInput.cameraOffsetX,
              cameraZoom: currentInput.cameraZoom,
              gridSettings: currentInput.gridSettings,
              frameQuality,
            },
            apiConfig
          );

          // Set metadata BEFORE sprite URL to avoid race condition
          setSpriteMetadata({ cols: 12, rows, totalFrames: 12 * rows });

          setSpriteSrc((prevSrc) => {
            if (prevSrc && prevSrc.startsWith("blob:")) {
              URL.revokeObjectURL(prevSrc);
            }
            return spriteUrl;
          });
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
             a.cameraZoom === b.cameraZoom &&
             a.frameQuality === b.frameQuality &&
             gridSettingsEqual;
    }
    if (a.type === 'parts' && b.type === 'parts') {
      // Compare grid settings (shallow comparison of properties)
      const gridSettingsEqual = 
        JSON.stringify(a.gridSettings ?? {}) === JSON.stringify(b.gridSettings ?? {});
      return arePartsEqual(a.parts, b.parts) &&
             a.showGrid === b.showGrid &&
             a.cameraOffsetX === b.cameraOffsetX &&
             a.cameraZoom === b.cameraZoom &&
             a.frameQuality === b.frameQuality &&
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