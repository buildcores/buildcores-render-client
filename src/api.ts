import { 
  RenderBuildRequest, 
  AvailablePartsResponse, 
  ApiConfig, 
  PartCategory, 
  GetAvailablePartsOptions,
  BuildResponse,
  PartsResponse,
  RenderByShareCodeOptions,
  RenderByShareCodeJobResponse,
  RenderByShareCodeResponse,
} from "./types";

// API Configuration
const API_BASE_URL = "https://www.renderapi.buildcores.com";

// API Endpoints
export const API_ENDPOINTS = {
  RENDER_BUILD_EXPERIMENTAL: "/render-build-experimental",
  RENDER_BUILD: "/render-build",
  AVAILABLE_PARTS: "/available-parts",
  BUILD: "/build",
  PARTS: "/parts",
  RENDER_BY_SHARE_CODE: "/render-by-share-code",
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

// Async render job types (new endpoints)
export interface RenderJobCreateResponse {
  job_id: string;
  status: "queued" | "processing" | "completed" | "error";
}

export interface RenderJobStatusResponse {
  job_id: string;
  status: "queued" | "processing" | "completed" | "error";
  url?: string | null;
  video_url?: string | null;
  sprite_url?: string | null;
  error?: string | null;
  end_time?: string | null;
}

export interface RenderBuildAsyncResponse {
  /** Final URL to the rendered MP4 (or sprite) asset */
  videoUrl: string;
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
  getAvailableParts(
    category: PartCategory,
    config: ApiConfig,
    options?: GetAvailablePartsOptions
  ): Promise<AvailablePartsResponse>;
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API Implementation
export const renderBuildExperimental = async (
  request: RenderBuildRequest,
  config: ApiConfig
): Promise<RenderBuildResponse> => {
  const requestWithFormat = {
    ...request,
    format: request.format || "video", // Default to video format
    // Include width and height if provided
    ...(request.width !== undefined ? { width: request.width } : {}),
    ...(request.height !== undefined ? { height: request.height } : {}),
    // Include profile if provided
    ...(request.profile ? { profile: request.profile } : {}),
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

// New async endpoints implementation
export const createRenderBuildJob = async (
  request: RenderBuildRequest,
  config: ApiConfig
): Promise<RenderJobCreateResponse> => {
  const body = {
    parts: request.parts,
    // If provided, forward format; default handled server-side but we keep explicit default
    ...(request.format ? { format: request.format } : {}),
    // Include width and height if provided
    ...(request.width !== undefined ? { width: request.width } : {}),
    ...(request.height !== undefined ? { height: request.height } : {}),
    // Include profile if provided
    ...(request.profile ? { profile: request.profile } : {}),
    // Include composition settings
    ...(request.showGrid !== undefined ? { showGrid: request.showGrid } : {}),
    ...(request.cameraOffsetX !== undefined ? { cameraOffsetX: request.cameraOffsetX } : {}),
    ...(request.gridSettings ? { gridSettings: request.gridSettings } : {}),
    // Include frame quality for sprite rendering
    ...(request.frameQuality ? { frameQuality: request.frameQuality } : {}),
  };

  const response = await fetch(buildApiUrl(API_ENDPOINTS.RENDER_BUILD, config), {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Create render job failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as RenderJobCreateResponse;
  if (!data?.job_id) {
    throw new Error("Create render job failed: missing job_id in response");
  }
  return data;
};

export const getRenderBuildStatus = async (
  jobId: string,
  config: ApiConfig
): Promise<RenderJobStatusResponse> => {
  const url = buildApiUrl(`${API_ENDPOINTS.RENDER_BUILD}/${encodeURIComponent(jobId)}`, config);
  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(config),
  });

  if (response.status === 404) {
    throw new Error("Render job not found");
  }
  if (!response.ok) {
    throw new Error(`Get render job status failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as RenderJobStatusResponse;
};

export const renderBuild = async (
  request: RenderBuildRequest,
  config: ApiConfig,
  options?: { pollIntervalMs?: number; timeoutMs?: number }
): Promise<RenderBuildAsyncResponse> => {
  const pollIntervalMs = options?.pollIntervalMs ?? 1500;
  const timeoutMs = options?.timeoutMs ?? 120_000; // 2 minutes default

  const { job_id } = await createRenderBuildJob(request, config);

  const start = Date.now();
  // Poll until completed or error or timeout
  for (;;) {
    const status = await getRenderBuildStatus(job_id, config);
    if (status.status === "completed") {
      const requestedFormat = request.format ?? "video";
      const finalUrl =
        (requestedFormat === "sprite"
          ? status.sprite_url || status.url || undefined
          : status.video_url || status.url || undefined);
      if (!finalUrl) {
        throw new Error("Render job completed but no URL returned");
      }
      return { videoUrl: finalUrl };
    }
    if (status.status === "error") {
      throw new Error(status.error || "Render job failed");
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error("Timed out waiting for render job to complete");
    }

    await sleep(pollIntervalMs);
  }
};

export const renderSpriteExperimental = async (
  request: RenderBuildRequest,
  config: ApiConfig
): Promise<RenderSpriteResponse> => {
  const requestWithFormat = {
    ...request,
    format: "sprite",
    // Include width and height if provided
    ...(request.width !== undefined ? { width: request.width } : {}),
    ...(request.height !== undefined ? { height: request.height } : {}),
    // Include profile if provided
    ...(request.profile ? { profile: request.profile } : {}),
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
  category: PartCategory,
  config: ApiConfig,
  options?: GetAvailablePartsOptions
): Promise<AvailablePartsResponse> => {
  const base = buildApiUrl(API_ENDPOINTS.AVAILABLE_PARTS, config);
  const params = new URLSearchParams();
  params.set("category", category);
  if (typeof options?.limit === "number") params.set("limit", String(options.limit));
  if (typeof options?.skip === "number") params.set("skip", String(options.skip));
  const separator = base.includes("?") ? "&" : "?";
  const url = `${base}${separator}${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(config),
  });

  if (!response.ok) {
    throw new Error(
      `Get available parts failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as AvailablePartsResponse;
};

// ============================================
// Build and Parts API Functions
// ============================================

/**
 * Fetch a build by its share code.
 * Returns build metadata and parts organized by category.
 *
 * @param shareCode - The share code of the build to fetch
 * @param config - API configuration (environment, auth token)
 * @returns Promise with build details including parts
 *
 * @example
 * ```tsx
 * const build = await getBuildByShareCode('abc123xyz', {
 *   environment: 'prod',
 *   authToken: 'your-api-key'
 * });
 *
 * console.log(build.name); // "My Gaming PC"
 * console.log(build.parts.CPU); // ["7xjqsomhr"]
 *
 * // Use the parts directly with BuildRender
 * <BuildRender parts={{ parts: build.parts }} size={500} apiConfig={config} />
 * ```
 */
export const getBuildByShareCode = async (
  shareCode: string,
  config: ApiConfig
): Promise<BuildResponse> => {
  const url = buildApiUrl(`${API_ENDPOINTS.BUILD}/${encodeURIComponent(shareCode)}`, config);

  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(config),
  });

  if (response.status === 404) {
    throw new Error("Build not found");
  }

  if (!response.ok) {
    throw new Error(
      `Get build by share code failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as BuildResponse;
};

/**
 * Fetch part details by their BuildCores IDs.
 *
 * @param partIds - Array of BuildCores part IDs to fetch
 * @param config - API configuration (environment, auth token)
 * @returns Promise with part details
 *
 * @example
 * ```tsx
 * const response = await getPartsByIds(['7xjqsomhr', 'z7pyphm9k'], {
 *   environment: 'prod',
 *   authToken: 'your-api-key'
 * });
 *
 * response.parts.forEach(part => {
 *   console.log(`${part.name} (${part.category})`);
 * });
 * ```
 */
export const getPartsByIds = async (
  partIds: string[],
  config: ApiConfig
): Promise<PartsResponse> => {
  const url = buildApiUrl(API_ENDPOINTS.PARTS, config);

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify({ ids: partIds }),
  });

  if (!response.ok) {
    throw new Error(
      `Get parts by IDs failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as PartsResponse;
};

/**
 * Create a render job for a build by its share code.
 * Returns the job ID for polling status.
 *
 * @param shareCode - The share code of the build to render
 * @param config - API configuration (environment, auth token)
 * @param options - Render options (format, dimensions, profile)
 * @returns Promise with job creation response
 */
export const createRenderByShareCodeJob = async (
  shareCode: string,
  config: ApiConfig,
  options?: Omit<RenderByShareCodeOptions, "pollIntervalMs" | "timeoutMs">
): Promise<RenderByShareCodeJobResponse> => {
  const url = buildApiUrl(API_ENDPOINTS.RENDER_BY_SHARE_CODE, config);

  const body = {
    shareCode,
    ...(options?.format ? { format: options.format } : {}),
    ...(options?.width !== undefined ? { width: options.width } : {}),
    ...(options?.height !== undefined ? { height: options.height } : {}),
    ...(options?.profile ? { profile: options.profile } : {}),
    ...(options?.showGrid !== undefined ? { showGrid: options.showGrid } : {}),
    ...(options?.cameraOffsetX !== undefined ? { cameraOffsetX: options.cameraOffsetX } : {}),
    ...(options?.gridSettings ? { gridSettings: options.gridSettings } : {}),
    ...(options?.frameQuality ? { frameQuality: options.frameQuality } : {}),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify(body),
  });

  if (response.status === 404) {
    throw new Error("Build not found");
  }

  if (!response.ok) {
    throw new Error(
      `Create render job failed: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as RenderByShareCodeJobResponse;
  if (!data?.job_id) {
    throw new Error("Create render job failed: missing job_id in response");
  }

  return data;
};

/**
 * Render a build by its share code.
 * This is a convenience function that creates a render job and polls until completion.
 *
 * @param shareCode - The share code of the build to render
 * @param config - API configuration (environment, auth token)
 * @param options - Render options including polling configuration
 * @returns Promise with the final render URL
 *
 * @example
 * ```tsx
 * // Simple usage - just pass share code
 * const result = await renderByShareCode('abc123xyz', {
 *   environment: 'prod',
 *   authToken: 'your-api-key'
 * });
 * console.log(result.videoUrl); // URL to rendered video
 *
 * // With custom options
 * const result = await renderByShareCode('abc123xyz', config, {
 *   format: 'sprite',
 *   width: 1920,
 *   height: 1080,
 *   profile: 'cinematic',
 *   timeoutMs: 180000 // 3 minute timeout
 * });
 * ```
 */
export const renderByShareCode = async (
  shareCode: string,
  config: ApiConfig,
  options?: RenderByShareCodeOptions
): Promise<RenderByShareCodeResponse> => {
  const pollIntervalMs = options?.pollIntervalMs ?? 1500;
  const timeoutMs = options?.timeoutMs ?? 120_000; // 2 minutes default

  const { job_id } = await createRenderByShareCodeJob(shareCode, config, options);

  const start = Date.now();
  // Poll until completed or error or timeout
  for (;;) {
    const status = await getRenderBuildStatus(job_id, config);
    
    if (status.status === "completed") {
      const requestedFormat = options?.format ?? "video";
      const finalUrl =
        requestedFormat === "sprite"
          ? status.sprite_url || status.url || undefined
          : status.video_url || status.url || undefined;
      
      if (!finalUrl) {
        throw new Error("Render job completed but no URL returned");
      }
      return { videoUrl: finalUrl };
    }
    
    if (status.status === "error") {
      throw new Error(status.error || "Render job failed");
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error("Timed out waiting for render job to complete");
    }

    await sleep(pollIntervalMs);
  }
};

// Export the base URL for external use
export { API_BASE_URL };
