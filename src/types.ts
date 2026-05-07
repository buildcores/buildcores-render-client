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

  /** Render quality profile. Overrides parts.profile when provided. */
  profile?: RenderQualityProfile;

  /** Frame quality for sprite/video capture requests that support frame grids. */
  frameQuality?: RenderFrameQuality;

  /** Camera zoom level for server-side rendering. */
  cameraZoom?: number;

  /** 3D model asset quality used by the server renderer. */
  modelQuality?: RenderModelQuality;
}

export type RenderInteractiveConfigTheme = "light" | "dark" | "system";
export type RenderInteractiveConfigPanelPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export type RenderInteractiveConfigPanelHeight = "compact" | "max" | number | string;
export type RenderModelQuality = "low" | "medium" | "high";

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
   * Render quality profile. Overrides parts.profile when provided.
   */
  profile?: RenderQualityProfile;

  /**
   * Show grid in render.
   * Works for both parts and shareCode rendering.
   */
  showGrid?: boolean;

  /**
   * Environment scene preset for rendering.
   */
  scene?: RenderScene;

  /**
   * Whether to show the environment background.
   */
  showBackground?: boolean;

  /**
   * Enable winter mode effects.
   * Mutually exclusive with springMode.
   */
  winterMode?: boolean;

  /**
   * Enable spring mode effects.
   * Mutually exclusive with winterMode.
   */
  springMode?: boolean;

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

  /**
   * Animation mode for the auto-rotation.
   * 
   * - **bounce**: (default) Quick back-and-forth partial rotation with pauses
   * - **spin360**: Slow continuous 360° rotation
   * 
   * @example
   * ```tsx
   * // Continuous slow spin (good for showcases)
   * <BuildRender
   *   shareCode="abc123"
   *   animationMode="spin360"
   *   spinDuration={12000}  // 12 seconds per full rotation
   * />
   * ```
   * 
   * @default "bounce"
   */
  animationMode?: 'bounce' | 'spin360';

  /**
   * Duration in milliseconds for one full 360° rotation.
   * Only applies when `animationMode` is "spin360".
   * 
   * @example
   * ```tsx
   * <BuildRender
   *   shareCode="abc123"
   *   animationMode="spin360"
   *   spinDuration={15000}  // 15 seconds per rotation
   * />
   * ```
   * 
   * @default 10000 (10 seconds)
   */
  spinDuration?: number;

  /**
   * Whether to enable user interaction (drag to rotate, scroll to zoom).
   * 
   * When set to `false`:
   * - Drag-to-rotate is disabled
   * - Scroll-to-zoom is disabled
   * - Cursor shows as "pointer" instead of "grab"
   * - Click events pass through (useful for wrapping in a link)
   * 
   * @example
   * ```tsx
   * // Non-interactive showcase with link
   * <a href="https://buildcores.com/build/abc123">
   *   <BuildRender
   *     shareCode="abc123"
   *     animationMode="spin360"
   *     interactive={false}
   *   />
   * </a>
   * ```
   * 
   * @default true
   */
  interactive?: boolean;

  /**
   * Frame quality for sprite renders.
   * - **standard**: 72 frames (default) - good balance of quality and file size
   * - **high**: 144 frames - smoother animation, larger file size (~2x file size)
   * 
   * @example
   * ```tsx
   * <BuildRender
   *   shareCode="abc123"
   *   frameQuality="high"  // 144 frames for smoother rotation
   * />
   * ```
   * 
   * @default "standard"
   */
  frameQuality?: RenderFrameQuality;

  /**
   * Initial zoom level for the build.
   * Range: 0.5 (50%) to 2.5 (250%). Values less than 1 make the build appear smaller,
   * values greater than 1 make it appear larger.
   * 
   * @example
   * ```tsx
   * <BuildRender
   *   shareCode="abc123"
   *   zoom={0.7}  // 70% size - build appears smaller
   * />
   * 
   * <BuildRender
   *   shareCode="abc123"
   *   zoom={1.5}  // 150% size - build appears larger
   * />
   * ```
   * 
   * @default 1
   */
  zoom?: number;

  /**
   * Camera zoom level for server-side rendering.
   * Values > 1 move the camera further away (build appears smaller in the sprite).
   * Values < 1 move the camera closer (build appears larger in the sprite).
   * 
   * Use this for higher quality scaled-down renders vs client-side zoom scaling.
   * Range: 0.5 to 2.0
   * 
   * @example
   * ```tsx
   * <BuildRender
   *   shareCode="abc123"
   *   cameraZoom={1.3}  // Camera 30% further away - smaller build in sprite
   * />
   * ```
   * 
   * @default 1
   */
  cameraZoom?: number;

  /**
   * 3D model asset quality used by the server renderer. Overrides parts.modelQuality when provided.
   */
  modelQuality?: RenderModelQuality;

  /**
   * Show a gear button in the bottom-right corner of the viewer that opens the
   * built-in fan, radiator, RGB, and side-panel configuration panel.
   *
   * The embedded panel is available for parts-based async renders. It is hidden
   * for share-code renders because those render the saved build state directly.
   *
   * @default false
   */
  showInteractiveConfigButton?: boolean;

  /**
   * Controlled interactive configuration for the embedded viewer UI.
   * Use with `onInteractiveConfigChange` when the host app wants to store or
   * preview the selected config outside of `BuildRender`.
   */
  interactiveConfig?: RenderInteractiveConfig;

  /**
   * Initial interactive configuration for the embedded viewer UI when using
   * `BuildRender` in uncontrolled mode.
   */
  defaultInteractiveConfig?: RenderInteractiveConfig;

  /**
   * Called when the customer applies changes in the embedded configuration panel.
   * In uncontrolled mode, `BuildRender` also stores the config internally and
   * triggers a new render.
   */
  onInteractiveConfigChange?: (config: RenderInteractiveConfig) => void;

  /**
   * Disable the embedded interactive configuration controls while keeping the
   * viewer visible.
   */
  interactiveConfigDisabled?: boolean;

  /**
   * Accessible label and tooltip for the embedded configuration gear button.
   */
  interactiveConfigButtonLabel?: string;

  /**
   * Title shown at the top of the embedded configuration panel.
   */
  interactiveConfigPanelTitle?: string;

  /**
   * Theme for the embedded fan/radiator configuration UI.
   * Use "system" to follow prefers-color-scheme.
   *
   * @default "system"
   */
  interactiveConfigTheme?: RenderInteractiveConfigTheme;

  /**
   * Screen corner where the embedded configuration panel opens.
   *
   * @default "top-left"
   */
  interactiveConfigPanelPosition?: RenderInteractiveConfigPanelPosition;

  /**
   * Height of the embedded configuration panel.
   * Use "compact" for a shorter scrollable menu, "max" for viewport-height,
   * or pass a CSS height string / pixel number for a custom value.
   *
   * @default "max"
   */
  interactiveConfigPanelHeight?: RenderInteractiveConfigPanelHeight;
}

// API Types

/**
 * API configuration for environment and authentication
 */
export interface ApiConfig {
  /**
   * Override the Render API base URL.
   * Useful for local development against a locally running render_api server.
   *
   * @example "http://127.0.0.1:3002"
   */
  apiBaseUrl?: string;

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

  /**
   * Auth mode for API requests.
   * - legacy: Sends `authToken` directly as bearer token.
   * - session: Uses `getRenderSessionToken` to fetch short-lived delegated tokens.
   *
   * @default "legacy"
   */
  authMode?: 'legacy' | 'session';

  /**
   * Session token supplier used when `authMode` is "session".
   * Should call your backend endpoint that brokers BuildCores session tokens.
   */
  getRenderSessionToken?: () => Promise<{
    token: string;
    expiresAt: string;
  }>;
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

export type RenderQualityProfile = 'cinematic' | 'flat' | 'fast';
export type RenderFrameQuality = 'standard' | 'high';

export interface RenderInteractiveFanPlacement {
  slotId: string;
  partId: string;
  quantity?: number;
  flip?: boolean;
}

export interface RenderInteractiveRadiatorConfig {
  slotId?: string;
  partId?: string;
  flip?: boolean;
  fans?: RenderInteractiveFanPlacement[];
}

export interface RenderInteractiveRgbConfig {
  color?: string;
  rgbPattern?: string;
  brightness?: number;
  v2lighting?: {
    uvScale?: number;
    script?: {
      id?: string;
      params?: Record<string, any>;
    };
  };
}

export interface RenderInteractiveConfig {
  caseFans?: RenderInteractiveFanPlacement[];
  radiator?: RenderInteractiveRadiatorConfig;
  rgb?: RenderInteractiveRgbConfig;
  showSidePanel?: boolean;
}

export interface RenderInteractivePartSummary {
  partId: string;
  name: string;
  category: string;
  image?: string | null;
  count?: number;
  isBundled?: boolean;
  fromRadiatorInventory?: boolean;
  flip?: boolean;
}

export interface RenderInteractiveSlotOption {
  slotId: string;
  group: 'case' | 'radiator';
  side: string;
  label: string;
  size: number;
  supportedFanSizesMm: number[];
  radiatorSupportMm: number[];
  maxRadiatorThicknessMm: number;
  accepts: string[];
  availablePartIds: string[];
  occupiedParts: RenderInteractivePartSummary[];
}

export interface RenderInteractiveConfigOptions {
  defaultConfig: RenderInteractiveConfig;
  slots: RenderInteractiveSlotOption[];
  availableFans: RenderInteractivePartSummary[];
  availableCoolers: RenderInteractivePartSummary[];
  warnings: string[];
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
  profile?: RenderQualityProfile;

  /**
   * Whether to show the 3D grid in the render.
   * Defaults to true for cinematic profile, false otherwise.
   */
  showGrid?: boolean;

  /**
   * Environment scene preset.
   */
  scene?: RenderScene;

  /**
   * Whether to show the environment background.
   */
  showBackground?: boolean;

  /**
   * Enable winter mode effects.
   * Mutually exclusive with springMode.
   */
  winterMode?: boolean;

  /**
   * Enable spring mode effects.
   * Mutually exclusive with winterMode.
   */
  springMode?: boolean;

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

  /**
   * Frame quality for sprite renders.
   * - **standard**: 72 frames (default) - good balance of quality and file size
   * - **high**: 144 frames - smoother animation, larger file size
   * 
   * @default "standard"
   */
  frameQuality?: RenderFrameQuality;

  /**
   * Camera zoom level for server-side rendering.
   * Values > 1 move the camera further away (build appears smaller in the sprite).
   * Values < 1 move the camera closer (build appears larger in the sprite).
   * Range: 0.5 to 2.0
   * 
   * @default 1
   */
  cameraZoom?: number;

  /**
   * 3D model asset quality used by the server renderer.
   * - **low**: fastest loading, smaller assets
   * - **medium**: balanced asset detail and load time
   * - **high**: highest-detail model assets
   */
  modelQuality?: RenderModelQuality;

  /**
   * Optional one-off interactive layout for case fans, radiator/cooler placement,
   * RGB lighting, and side-panel visibility.
   */
  interactiveConfig?: RenderInteractiveConfig;
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
  /**
   * Whether the case in this build has an interactive 3D model available.
   * If false, the build cannot be rendered in 3D.
   */
  hasInteractiveModel: boolean;
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
 * Supported environment scene presets for render API endpoints.
 */
export type RenderScene =
  | "sunset"
  | "dawn"
  | "night"
  | "warehouse"
  | "forest"
  | "apartment"
  | "studio"
  | "studio_v2"
  | "city"
  | "park"
  | "lobby";

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
  profile?: RenderQualityProfile;
  /** Environment scene preset */
  scene?: RenderScene;
  /** Whether to show the environment background */
  showBackground?: boolean;
  /** Show grid in render (default: true for cinematic profile) */
  showGrid?: boolean;
  /** Enable winter mode effects (mutually exclusive with springMode) */
  winterMode?: boolean;
  /** Enable spring mode effects (mutually exclusive with winterMode) */
  springMode?: boolean;
  /** Camera offset X for composition (positive = shift build right to leave room for text overlay) */
  cameraOffsetX?: number;
  /** Grid appearance settings (for thicker/more visible grid in renders) */
  gridSettings?: GridSettings;
  /** Frame quality - 'standard' (72 frames) or 'high' (144 frames for smoother animation) */
  frameQuality?: RenderFrameQuality;
  /** Camera zoom level for rendering. Values > 1 move camera further (build appears smaller). Range: 0.5 to 2.0 */
  cameraZoom?: number;
  /** 3D model asset quality used by the server renderer. */
  modelQuality?: RenderModelQuality;
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
  /** Final render URL when the create endpoint returns a cached completed job */
  url?: string | null;
  /** Final video URL when the create endpoint returns a cached completed job */
  video_url?: string | null;
  /** Final sprite URL when the create endpoint returns a cached completed job */
  sprite_url?: string | null;
  /** Error text when the create endpoint returns an error status */
  error?: string | null;
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
