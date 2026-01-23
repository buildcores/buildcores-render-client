export interface BuildRenderVideoProps {
  /**
   * Parts configuration for the build render.
   *
   * This object defines which PC components should be included in the 3D render.
   * Each part category contains an array with a single part ID that will be rendered.
   *
   * **Current Limitation**: Only 1 part per category is supported. Arrays must contain
   * exactly one part ID per category. Future versions will support multiple parts per category.
   *
   * @example
   * ```tsx
   * const parts = {
   *   parts: {
   *     CPU: ["7xjqsomhr"],              // AMD Ryzen 7 9800X3D
   *     GPU: ["z7pyphm9k"],              // ASUS GeForce RTX 5080 ASTRAL
   *     RAM: ["dpl1iyvb5"],              // PNY DDR5
   *     Motherboard: ["iwin2u9vx"],      // Asus ROG STRIX X870E-E GAMING WIFI
   *     PSU: ["m4kilv190"],              // LIAN LI 1300W
   *     Storage: ["0bkvs17po"],          // SAMSUNG 990 EVO
   *     PCCase: ["qq9jamk7c"],           // MONTECH KING 95 PRO
   *     CPUCooler: ["62d8zelr5"],        // ARCTIC LIQUID FREEZER 360
   *   }
   * };
   *
   * <BuildRender parts={parts} size={300} />
   * ```
   *
   * @example Minimal build (only required components)
   * ```tsx
   * const parts = {
   *   parts: {
   *     CPU: ["7xjqsomhr"],              // Single CPU required
   *     Motherboard: ["iwin2u9vx"],      // Single motherboard required
   *     PCCase: ["qq9jamk7c"],           // Single case required
   *   }
   * };
   * ```
   *
   * Note: Part IDs must correspond to valid components in the BuildCores database.
   * Use the available parts API to get valid part IDs for each category.
   */
  parts: RenderBuildRequest;

  /**
   * Width and height in pixels. If only `size` is provided, both width and height use it.
   * If `width`/`height` are provided, they override `size` individually.
   */
  width?: number;
  height?: number;
  size?: number;

  /**
   * API configuration for environment and authentication.
   * This is required to make API calls to the BuildCores rendering service.
   *
   * @example
   * ```tsx
   * <BuildRender
   *   parts={parts}
   *   size={300}
   *   apiConfig={{
   *     environment: 'staging',
   *     authToken: 'your-auth-token'
   *   }}
   * />
   * ```
   */
  apiConfig: ApiConfig;

  /**
   * Options to configure the internal useBuildRender hook
   * (e.g., choose async vs experimental rendering flow)
   */
  useBuildRenderOptions?: {
    mode?: "async" | "experimental";
  };

  /**
   * Optional mouse sensitivity for dragging (default: 0.005).
   *
   * Controls how responsive the 3D model rotation is to mouse movements.
   * Lower values make rotation slower and more precise, higher values make it faster.
   *
   * @example
   * ```tsx
   * <BuildRender
   *   parts={parts}
   *   size={300}
   *   mouseSensitivity={0.003}  // Slower, more precise
   * />
   *
   * <BuildRender
   *   parts={parts}
   *   size={300}
   *   mouseSensitivity={0.01}   // Faster rotation
   * />
   * ```
   *
   * @default 0.005
   */
  mouseSensitivity?: number;

  /**
   * Optional touch sensitivity for dragging (default: 0.01).
   *
   * Controls how responsive the 3D model rotation is to touch gestures on mobile devices.
   * Generally set higher than mouseSensitivity for better touch experience.
   *
   * @example
   * ```tsx
   * <BuildRender
   *   parts={parts}
   *   size={300}
   *   touchSensitivity={0.008}  // Slower touch rotation
   * />
   *
   * <BuildRender
   *   parts={parts}
   *   size={300}
   *   touchSensitivity={0.015}  // Faster touch rotation
   * />
   * ```
   *
   * @default 0.01
   */
  touchSensitivity?: number;
}

export interface BuildRenderProps {
  /**
   * Parts configuration for the sprite render.
   *
   * This object defines which PC components should be included in the 3D sprite render.
   * Each part category contains an array with a single part ID that will be rendered.
   *
   * **Note**: If `shareCode` is provided, it will be used instead of `parts`.
   * Using `shareCode` preserves the build's interactive state (including case fan slot placements).
   *
   * **Current Limitation**: Only 1 part per category is supported. Arrays must contain
   * exactly one part ID per category. Future versions will support multiple parts per category.
   *
   * @example
   * ```tsx
   * const parts = {
   *   parts: {
   *     CPU: ["7xjqsomhr"],              // AMD Ryzen 7 9800X3D
   *     GPU: ["z7pyphm9k"],              // ASUS GeForce RTX 5080 ASTRAL
   *     RAM: ["dpl1iyvb5"],              // PNY DDR5
   *     Motherboard: ["iwin2u9vx"],      // Asus ROG STRIX X870E-E GAMING WIFI
   *     PSU: ["m4kilv190"],              // LIAN LI 1300W
   *     Storage: ["0bkvs17po"],          // SAMSUNG 990 EVO
   *     PCCase: ["qq9jamk7c"],           // MONTECH KING 95 PRO
   *     CPUCooler: ["62d8zelr5"],        // ARCTIC LIQUID FREEZER 360
   *   }
   * };
   *
   * <SpriteRender parts={parts} size={300} />
   * ```
   */
  parts?: RenderBuildRequest;

  /**
   * Share code of an existing build to render.
   *
   * When provided, the build will be rendered using its existing interactive state,
   * which includes case fan slot placements. This is preferred over `parts` when
   * rendering builds that have already been configured with case fans.
   *
   * If both `shareCode` and `parts` are provided, `shareCode` takes precedence.
   *
   * @example
   * ```tsx
   * <BuildRender
   *   shareCode="abc123xyz"
   *   size={500}
   *   apiConfig={{ environment: 'prod', authToken: 'your-token' }}
   * />
   * ```
   */
  shareCode?: string;

  /**
   * Width and height in pixels. If only `size` is provided, both width and height use it.
   * If `width`/`height` are provided, they override `size` individually.
   */
  width?: number;
  height?: number;
  size?: number;

  /**
   * API configuration for environment and authentication.
   * This is required to make API calls to the BuildCores rendering service.
   *
   * @example
   * ```tsx
   * <SpriteRender
   *   parts={parts}
   *   size={300}
   *   apiConfig={{
   *     environment: 'staging',
   *     authToken: 'your-auth-token'
   *   }}
   * />
   * ```
   */
  apiConfig: ApiConfig;

  /**
   * Options to configure the internal useSpriteRender hook
   * (e.g., choose async vs experimental rendering flow)
   */
  useSpriteRenderOptions?: {
    mode?: "async" | "experimental";
  };

  /**
   * Optional mouse sensitivity for dragging (default: 0.05).
   *
   * Controls how responsive the 3D model rotation is to mouse movements.
   * Lower values make rotation slower and more precise, higher values make it faster.
   *
   * @default 0.2
   */
  mouseSensitivity?: number;

  /**
   * Optional touch sensitivity for dragging (default: 0.02).
   *
   * Controls how responsive the 3D model rotation is to touch gestures on mobile devices.
   * Generally set similar to mouseSensitivity for consistent experience.
   *
   * @default 0.2
   */
  touchSensitivity?: number;

  /**
   * Show grid in render.
   * Works for both parts and shareCode rendering.
   */
  showGrid?: boolean;

  /**
   * Camera offset X for composition.
   * Positive values shift the build to the right, leaving room for text overlay on the left.
   * Works for both parts and shareCode rendering.
   */
  cameraOffsetX?: number;

  /**
   * Grid appearance settings for thicker/more visible grid in renders.
   * Works for both parts and shareCode rendering.
   */
  gridSettings?: GridSettings;
}

// API Types

/**
 * API configuration for environment and authentication
 */
export interface ApiConfig {
  /**
   * Environment to use for API requests
   * - 'staging': Development/testing environment
   * - 'prod': Production environment
   *
   * @example
   * ```tsx
   * const config: ApiConfig = {
   *   environment: 'staging',
   *   authToken: 'your-bearer-token'
   * };
   * ```
   */
  environment?: "staging" | "prod";

  /**
   * Bearer token for API authentication
   *
   * @example
   * ```tsx
   * const config: ApiConfig = {
   *   environment: 'prod',
   *   authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   * };
   * ```
   */
  authToken?: string;
}

/**
 * Enum defining all available PC part categories that can be rendered.
 *
 * Each category represents a different type of computer component that can be
 * included in the 3D build visualization.
 *
 * @example
 * ```tsx
 * // All available categories
 * const categories = [
 *   PartCategory.CPU,        // "CPU"
 *   PartCategory.GPU,        // "GPU"
 *   PartCategory.RAM,        // "RAM"
 *   PartCategory.Motherboard,// "Motherboard"
 *   PartCategory.PSU,        // "PSU"
 *   PartCategory.Storage,    // "Storage"
 *   PartCategory.PCCase,     // "PCCase"
 *   PartCategory.CPUCooler,  // "CPUCooler"
 * ];
 * ```
 */
export enum PartCategory {
  /** Central Processing Unit - The main processor */
  CPU = "CPU",
  /** Graphics Processing Unit - Video card for rendering */
  GPU = "GPU",
  /** Random Access Memory - System memory modules */
  RAM = "RAM",
  /** Main circuit board that connects all components */
  Motherboard = "Motherboard",
  /** Power Supply Unit - Provides power to all components */
  PSU = "PSU",
  /** Storage devices like SSDs, HDDs, NVMe drives */
  Storage = "Storage",
  /** PC Case - The enclosure that houses all components */
  PCCase = "PCCase",
  /** CPU Cooler - Air or liquid cooling for the processor */
  CPUCooler = "CPUCooler",
  /** Case Fans - Additional cooling fans for the case */
  CaseFan = "CaseFan",
}

/**
 * Request structure for rendering a PC build.
 *
 * This interface defines the parts configuration that will be sent to the
 * rendering service to generate a 3D visualization of a PC build.
 *
 * **Current Limitation**: Only one part per category is supported. Each category
 * array must contain exactly one part ID. Future versions will support multiple
 * parts per category for comparison views.
 *
 * @example Basic build configuration
 * ```tsx
 * const buildRequest: RenderBuildRequest = {
 *   parts: {
 *     CPU: ["7xjqsomhr"],              // AMD Ryzen 7 9800X3D
 *     GPU: ["z7pyphm9k"],              // ASUS GeForce RTX 5080 ASTRAL
 *     RAM: ["dpl1iyvb5"],              // PNY DDR5
 *     Motherboard: ["iwin2u9vx"],      // Asus ROG STRIX X870E-E GAMING WIFI
 *     PSU: ["m4kilv190"],              // LIAN LI 1300W
 *     Storage: ["0bkvs17po"],          // SAMSUNG 990 EVO
 *     PCCase: ["qq9jamk7c"],           // MONTECH KING 95 PRO
 *     CPUCooler: ["62d8zelr5"],        // ARCTIC LIQUID FREEZER 360
 *   },
 *   format: "video"                    // Request video format
 * };
 * ```
 *
 * @example Sprite format request
 * ```tsx
 * const spriteRequest: RenderBuildRequest = {
 *   parts: {
 *     CPU: ["7xjqsomhr"],              // AMD Ryzen 7 9800X3D
 *     GPU: ["z7pyphm9k"],              // ASUS GeForce RTX 5080 ASTRAL
 *     RAM: ["dpl1iyvb5"],              // PNY DDR5
 *     Motherboard: ["iwin2u9vx"],      // Asus ROG STRIX X870E-E GAMING WIFI
 *   },
 *   format: "sprite"                   // Request sprite sheet format
 * };
 * ```
 */
export interface RenderBuildRequest {
  /**
   * Object mapping part categories to arrays of part IDs.
   *
   * **Current Requirements**:
   * - Keys are part categories (CPU, GPU, RAM, etc.)
   * - Values are arrays containing exactly one part ID string
   * - All categories are optional - include only the parts you want to render
   * - Part IDs must be valid identifiers from the BuildCores parts database
   *
   * **Future Enhancement**: Multiple parts per category will be supported for comparison views.
   *
   * @see PartCategory for all available categories
   * @see AvailablePartsResponse for getting valid part IDs
   */
  parts: {
    [K in PartCategory]?: string[];
  };

  /**
   * Output format for the rendered build.
   *
   * - "video": Returns an MP4 video file for video-based 360° rotation
   * - "sprite": Returns a sprite sheet image for frame-based 360° rotation
   *
   * @default "video"
   */
  format?: "video" | "sprite";

  /**
   * Desired canvas pixel width (256-2000).
   * Must be provided together with height.
   *
   * @example
   * ```tsx
   * const request: RenderBuildRequest = {
   *   parts: { CPU: ["7xjqsomhr"] },
   *   width: 1920,
   *   height: 1080
   * };
   * ```
   */
  width?: number;

  /**
   * Desired canvas pixel height (256-2000).
   * Must be provided together with width.
   *
   * @example
   * ```tsx
   * const request: RenderBuildRequest = {
   *   parts: { CPU: ["7xjqsomhr"] },
   *   width: 1920,
   *   height: 1080
   * };
   * ```
   */
  height?: number;

  /**
   * Render quality profile that controls visual effects and rendering speed.
   *
   * - **cinematic**: All effects enabled (shadows, ambient occlusion, bloom) for highest quality
   * - **flat**: No effects for clean, simple product shots
   * - **fast**: Minimal rendering for fastest processing speed
   *
   * @example
   * ```tsx
   * const request: RenderBuildRequest = {
   *   parts: { CPU: ["7xjqsomhr"] },
   *   profile: 'cinematic'  // High quality with all effects
   * };
   * ```
   *
   * @example Fast rendering
   * ```tsx
   * const request: RenderBuildRequest = {
   *   parts: { CPU: ["7xjqsomhr"] },
   *   profile: 'fast'  // Quick render, minimal effects
   * };
   * ```
   */
  profile?: 'cinematic' | 'flat' | 'fast';

  /**
   * Whether to show the 3D grid in the render.
   * Defaults to true for cinematic profile, false otherwise.
   */
  showGrid?: boolean;

  /**
   * Horizontal offset for the camera view.
   * Positive values shift the build to the right, leaving room for text overlay on the left.
   * Range: -0.3 to 0.3
   */
  cameraOffsetX?: number;

  /**
   * Custom grid appearance settings.
   * Only applies when showGrid is true.
   */
  gridSettings?: GridSettings;
}

/**
 * Response structure containing all available parts for each category.
 *
 * This type represents the response from the available parts API endpoint,
 * providing arrays of valid part IDs for each component category.
 *
 * @example Using available parts response
 * ```tsx
 * const availableParts: AvailablePartsResponse = {
 *   CPU: [
 *     { id: "7xjqsomhr", name: "AMD Ryzen 7 9800X3D", image: "https://..." },
 *     { id: "x2thvstj3", name: "AMD Ryzen 7 9700X", image: "https://..." },
 *   ],
 *   GPU: [
 *     { id: "z7pyphm9k", name: "ASUS GeForce RTX 5080 ASTRAL", image: "https://..." },
 *     { id: "4a0mjb360", name: "PNY GeForce RTX 5060 Ti 16GB", image: "https://..." },
 *   ],
 *   // ... all other categories
 * };
 *
 * // Select one part per category for current build request
 * const buildRequest: RenderBuildRequest = {
 *   parts: {
 *     CPU: [availableParts.CPU[0].id],     // Select first available CPU ID
 *     GPU: [availableParts.GPU[1].id],     // Select second available GPU ID
 *     RAM: [availableParts.RAM[0].id],     // Select first available RAM ID
 *   }
 * };
 * ```
 *
 * @example Dynamic part selection
 * ```tsx
 * // Function to create build with user-selected parts
 * const createBuild = (selectedPartIds: Record<string, string>) => {
 *   const buildRequest: RenderBuildRequest = {
 *     parts: {
 *       CPU: [selectedPartIds.cpu],          // Single selected CPU ID
 *       GPU: [selectedPartIds.gpu],          // Single selected GPU ID
 *       RAM: [selectedPartIds.ram],          // Single selected RAM ID
 *       // ... other single selections
 *     }
 *   };
 *   return buildRequest;
 * };
 * ```
 */
/**
 * Individual part information with details
 */
export interface PartDetails {
  /** Unique part identifier */
  id: string;
  /** Human-readable part name */
  name: string;
  /** URL to part image */
  image: string;
}

/**
 * Pagination metadata for available parts responses
 */
export interface AvailablePartsPagination {
  /** Total number of parts available for this category */
  total: number;
  /** Number of parts returned in this response */
  limit: number;
  /** Number of parts skipped */
  skip: number;
  /** Whether there are more parts available */
  hasNext: boolean;
  /** Whether there are previous parts available */
  hasPrev: boolean;
}

/**
 * Response envelope for the available parts endpoint.
 * Returns parts for the requested category under `data` keyed by category name.
 */
export interface AvailablePartsResponse {
  /**
   * Parts grouped by category. Only the requested category key is expected
   * to be present in the response.
   */
  data: Partial<Record<PartCategory, PartDetails[]>>;
  /** The requested category */
  category: PartCategory;
  /** Optional pagination information */
  pagination?: AvailablePartsPagination;
}

/**
 * Query options for fetching available parts
 */
export interface GetAvailablePartsOptions {
  /** Number of parts to return (default 20, min 1, max 100) */
  limit?: number;
  /** Number of parts to skip for pagination (default 0) */
  skip?: number;
}

// ============================================
// Build and Parts API Types
// ============================================

/**
 * Extended part details including category information
 */
export interface PartDetailsWithCategory {
  /** Unique part identifier (BuildCores ID) */
  id: string;
  /** Human-readable part name */
  name: string;
  /** URL to part image (may be null) */
  image: string | null;
  /** Part category */
  category: PartCategory;
}

/**
 * Response from the get build by share code endpoint.
 * Contains build metadata and parts organized by category.
 *
 * @example
 * ```tsx
 * const build = await getBuildByShareCode('abc123xyz', config);
 * console.log(build.name); // "My Gaming PC"
 * console.log(build.parts.CPU); // ["7xjqsomhr"]
 * console.log(build.partDetails.CPU[0].name); // "AMD Ryzen 7 9800X3D"
 * ```
 */
export interface BuildResponse {
  /** The share code of the build */
  shareCode: string;
  /** Build name/title */
  name: string;
  /** Build description */
  description: string;
  /**
   * Part IDs mapped by category.
   * Use these IDs directly with RenderBuildRequest.
   */
  parts: {
    [K in PartCategory]?: string[];
  };
  /**
   * Detailed part information mapped by category.
   * Includes name, image URL, and category for each part.
   */
  partDetails: {
    [K in PartCategory]?: PartDetailsWithCategory[];
  };
}

/**
 * Response from the get parts by IDs endpoint.
 *
 * @example
 * ```tsx
 * const response = await getPartsByIds(['7xjqsomhr', 'z7pyphm9k'], config);
 * response.parts.forEach(part => {
 *   console.log(`${part.name} (${part.category})`);
 * });
 * ```
 */
export interface PartsResponse {
  /** Array of part details */
  parts: PartDetailsWithCategory[];
}

/**
 * Grid appearance settings for renders
 */
export interface GridSettings {
  /** Grid cell line thickness (default: 0.6) */
  cellThickness?: number;
  /** Grid section line thickness (default: 1.2) */
  sectionThickness?: number;
  /** Grid color as hex string (default: #6f6f6f) */
  color?: string;
  /** Distance at which grid starts to fade (default: 3) */
  fadeDistance?: number;
  /** Render order for depth sorting (default: 0, use -1 to render before other objects) */
  renderOrder?: number;
}

/**
 * Options for rendering a build by share code
 */
export interface RenderByShareCodeOptions {
  /** Output format - video (MP4) or sprite (WebP sprite sheet) */
  format?: "video" | "sprite";
  /** Desired canvas pixel width (256-8192) */
  width?: number;
  /** Desired canvas pixel height (256-8192) */
  height?: number;
  /** Render quality profile */
  profile?: "cinematic" | "flat" | "fast";
  /** Show grid in render (default: true for cinematic profile) */
  showGrid?: boolean;
  /** Camera offset X for composition (positive = shift build right to leave room for text overlay) */
  cameraOffsetX?: number;
  /** Grid appearance settings (for thicker/more visible grid in renders) */
  gridSettings?: GridSettings;
  /** Polling interval in milliseconds (default: 1500) */
  pollIntervalMs?: number;
  /** Timeout in milliseconds (default: 120000 = 2 minutes) */
  timeoutMs?: number;
}

/**
 * Response from the render by share code endpoint (job creation).
 */
export interface RenderByShareCodeJobResponse {
  /** Unique job identifier for polling status */
  job_id: string;
  /** Current job status */
  status: "queued" | "processing" | "completed" | "error";
  /** The share code of the build being rendered */
  share_code: string;
}

/**
 * Final response after render by share code completes.
 *
 * @example
 * ```tsx
 * const result = await renderByShareCode('abc123xyz', config);
 * // Use result.videoUrl to display the rendered video
 * ```
 */
export interface RenderByShareCodeResponse {
  /** URL to the rendered video or sprite sheet */
  videoUrl: string;
}
