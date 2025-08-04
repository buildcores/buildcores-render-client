export interface BuildRenderProps {
  /**
   * Parts configuration for the build render
   */
  parts: RenderBuildRequest;

  /**
   * Video size in pixels (width and height will be the same)
   */
  size: number;

  /**
   * Optional mouse sensitivity for dragging (default: 0.005)
   */
  mouseSensitivity?: number;

  /**
   * Optional touch sensitivity for dragging (default: 0.01)
   */
  touchSensitivity?: number;
}

// API Types
export enum PartCategory {
  CPU = "CPU",
  GPU = "GPU",
  RAM = "RAM",
  Motherboard = "Motherboard",
  PSU = "PSU",
  Storage = "Storage",
  PCCase = "PCCase",
  CPUCooler = "CPUCooler",
}

export interface RenderBuildRequest {
  parts: {
    [K in PartCategory]?: string[];
  };
}

export type AvailablePartsResponse = {
  [K in PartCategory]: string[];
};
