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
   * Video size in pixels (width and height will be the same).
   *
   * This determines the resolution of the rendered 3D video. Higher values
   * provide better quality but may impact performance.
   *
   * @example
   * ```tsx
   * <BuildRender parts={parts} size={300} />  // 300x300px
   * <BuildRender parts={parts} size={500} />  // 500x500px
   * <BuildRender parts={parts} size={800} />  // 800x800px - high quality
   * ```
   *
   * Recommended sizes:
   * - 300px: Good for thumbnails or small previews
   * - 500px: Standard size for most use cases
   * - 800px+: High quality for detailed viewing
   */
  size: number;

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
  parts: RenderBuildRequest;

  /**
   * Sprite size in pixels (width and height will be the same).
   *
   * This determines the display size of the rendered 3D sprite. The sprite sheet
   * itself is rendered at a fixed resolution, but this controls the display size.
   *
   * @example
   * ```tsx
   * <SpriteRender parts={parts} size={300} />  // 300x300px
   * <SpriteRender parts={parts} size={500} />  // 500x500px
   * <SpriteRender parts={parts} size={800} />  // 800x800px - larger display
   * ```
   */
  size: number;

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

export type AvailablePartsResponse = {
  [K in PartCategory]: PartDetails[];
};
