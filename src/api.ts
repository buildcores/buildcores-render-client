import { RenderBuildRequest, AvailablePartsResponse } from "./types";

// API Configuration
const API_BASE_URL = "https://www.renderapi.buildcores.com";

// API Endpoints
export const API_ENDPOINTS = {
  RENDER_BUILD_EXPERIMENTAL: "/render-build-experimental",
  AVAILABLE_PARTS: "/available-parts",
} as const;

// API Response Types
export interface RenderBuildResponse {
  /**
   * The rendered MP4 video as a Blob (when format is "video")
   */
  video: Blob;
  /**
   * Optional metadata about the render
   */
  metadata?: {
    duration?: number;
    size?: number;
    format?: string;
  };
}

export interface RenderSpriteResponse {
  /**
   * The rendered sprite sheet as a Blob (when format is "sprite")
   */
  sprite: Blob;
  /**
   * Sprite sheet metadata
   */
  metadata?: {
    cols?: number;
    rows?: number;
    totalFrames?: number;
    size?: number;
    format?: string;
  };
}

// API Functions (definitions only - not implemented yet)
export interface RenderAPIService {
  /**
   * Submit a render build request
   * @param parts - The parts configuration for the build
   * @param config - API configuration (environment, auth token) - required
   * @returns Promise with the rendered MP4 video
   */
  renderBuildExperimental(
    parts: RenderBuildRequest,
    config: ApiConfig
  ): Promise<RenderBuildResponse>;

  /**
   * Get available parts for building
   * @param config - API configuration (environment, auth token) - required
   * @returns Promise with available parts by category
   */
  getAvailableParts(config: ApiConfig): Promise<AvailablePartsResponse>;
}

// API Configuration Types
export interface ApiConfig {
  environment?: "staging" | "prod";
  authToken?: string;
}

// API URL helpers
export const buildApiUrl = (endpoint: string, config: ApiConfig): string => {
  const baseUrl = `${API_BASE_URL}${endpoint}`;
  if (config.environment) {
    const separator = endpoint.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}environment=${config.environment}`;
  }
  return baseUrl;
};

// Helper to build request headers with auth token
export const buildHeaders = (config: ApiConfig): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    accept: "application/json",
  };

  if (config.authToken) {
    headers["Authorization"] = `Bearer ${config.authToken}`;
  }

  return headers;
};

// API Implementation
export const renderBuildExperimental = async (
  request: RenderBuildRequest,
  config: ApiConfig
): Promise<RenderBuildResponse> => {
  const requestWithFormat = {
    ...request,
    format: request.format || "video", // Default to video format
  };

  const response = await fetch(
    buildApiUrl(API_ENDPOINTS.RENDER_BUILD_EXPERIMENTAL, config),
    {
      method: "POST",
      headers: buildHeaders(config),
      body: JSON.stringify(requestWithFormat),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Render build failed: ${response.status} ${response.statusText}`
    );
  }

  const video = await response.blob();

  return {
    video,
    metadata: {
      size: video.size,
      format: "video/mp4",
    },
  };
};

export const renderSpriteExperimental = async (
  request: RenderBuildRequest,
  config: ApiConfig
): Promise<RenderSpriteResponse> => {
  const requestWithFormat = {
    ...request,
    format: "sprite",
  };

  const response = await fetch(
    buildApiUrl(API_ENDPOINTS.RENDER_BUILD_EXPERIMENTAL, config),
    {
      method: "POST",
      headers: buildHeaders(config),
      body: JSON.stringify(requestWithFormat),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Render sprite failed: ${response.status} ${response.statusText}`
    );
  }

  const sprite = await response.blob();

  return {
    sprite,
    metadata: {
      cols: 12, // Default sprite grid - could be returned from API
      rows: 6,
      totalFrames: 72,
      size: sprite.size,
      format: "image/webp",
    },
  };
};

export const getAvailableParts = async (
  config: ApiConfig
): Promise<AvailablePartsResponse> => {
  const response = await fetch(
    buildApiUrl(API_ENDPOINTS.AVAILABLE_PARTS, config),
    {
      method: "GET",
      headers: buildHeaders(config),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Get available parts failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

// Export the base URL for external use
export { API_BASE_URL };
