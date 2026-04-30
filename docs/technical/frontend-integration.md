---
title: 3. Frontend Integration
description: React package setup, BuildRender usage, helper APIs, and part categories for @buildcores/render-client.
sidebar_position: 2
---

# 3. Frontend Integration: `@buildcores/render-client`

Install the React client:

```bash
npm install @buildcores/render-client
```

Peer dependencies:

```text
react >= 16.8.0
react-dom >= 16.8.0
```

## 3.1. Authentication Setup

Configure `ApiConfig` to use session token auth. The frontend callback should
call your backend, and your backend should call `POST /auth/render-session`.
The client caches session tokens and refreshes them after a `401` response.

```tsx
import { BuildRender, type ApiConfig } from "@buildcores/render-client";

const apiConfig: ApiConfig = {
  environment: "prod",
  authMode: "session",
  getRenderSessionToken: async () => {
    const res = await fetch("/api/buildcores-token", { method: "POST" });
    if (!res.ok) {
      throw new Error("Failed to mint BuildCores session token");
    }
    const data = await res.json();
    return {
      token: data.session_token,
      expiresAt: data.expires_at,
    };
  },
};
```

## 3.2. `<BuildRender />` Component

`BuildRender` displays a sprite-based interactive 360-degree viewer. It can
render directly from part IDs or from an existing BuildCores share code.

Render by part IDs:

```tsx
import { BuildRender } from "@buildcores/render-client";

<BuildRender
  parts={{
    parts: {
      PCCase: ["qq9jamk7c"],
      GPU: ["z7pyphm9k"],
      Motherboard: ["iwin2u9vx"],
      CPUCooler: ["62d8zelr5"],
      RAM: ["dpl1iyvb5"],
    },
    profile: "cinematic",
  }}
  size={500}
  apiConfig={apiConfig}
/>;
```

Render by share code:

```tsx
<BuildRender
  shareCode="abc123xyz"
  size={500}
  apiConfig={apiConfig}
/>;
```

Use `shareCode` when rendering an existing configured build. It preserves the
build's saved interactive state, including case fan and radiator placements.

Component props:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `parts` | `RenderBuildRequest` | - | Parts configuration. Required unless `shareCode` is provided. `parts.profile` is where render profile is configured for parts-based renders. |
| `shareCode` | string | - | Share code of an existing build. Takes precedence over `parts`. |
| `size` | number | `300` | Square width and height in CSS pixels. |
| `width` / `height` | number | - | Override display width and height individually. |
| `apiConfig` | `ApiConfig` | required | Auth and environment configuration. |
| `mouseSensitivity` | number | `0.2` | Rotation sensitivity for mouse drag. |
| `touchSensitivity` | number | `0.2` | Rotation sensitivity for touch drag. |
| `animationMode` | `"bounce" \| "spin360"` | `"bounce"` | Auto-rotation animation style. |
| `spinDuration` | number | `10000` | Duration in milliseconds for one full 360-degree rotation in `spin360` mode. |
| `interactive` | boolean | `true` | Enables drag-to-rotate and scroll-to-zoom. Set `false` for non-interactive showcase embeds. |
| `zoom` | number | `1` | Client-side initial zoom level. Intended range is `0.5` to `2.5`. |
| `cameraZoom` | number | `1` | Server-side camera distance. Values are clamped from `0.5` to `2.0`. |
| `showGrid` | boolean | profile-dependent | Show the 3D ground grid. |
| `scene` | `RenderScene` | - | Environment scene preset. |
| `showBackground` | boolean | - | Show the environment background. |
| `winterMode` | boolean | `false` | Enable winter visual effects. Mutually exclusive with `springMode`. |
| `springMode` | boolean | `false` | Enable spring visual effects. Mutually exclusive with `winterMode`. |
| `cameraOffsetX` | number | `0` | Horizontal camera offset. Server clamps values from `-0.3` to `0.3`. |
| `gridSettings` | `GridSettings` | - | Custom grid appearance settings. |
| `frameQuality` | `"standard" \| "high"` | `"standard"` | `standard` renders 72 frames; `high` renders 144 frames. |
| `useSpriteRenderOptions.mode` | `"async" \| "experimental"` | `"async"` | Selects async job rendering or the legacy pregenerated endpoint. |

## 3.3. API Functions

The package exports helper functions for direct API use:

```tsx
import {
  PartCategory,
  getAvailableParts,
  getBuildByShareCode,
  getPartsByIds,
  renderByShareCode,
} from "@buildcores/render-client";

const gpus = await getAvailableParts(PartCategory.GPU, apiConfig, {
  limit: 20,
  skip: 0,
});

console.log(gpus.data.GPU);

const build = await getBuildByShareCode("abc123xyz", apiConfig);
const parts = await getPartsByIds(["7xjqsomhr", "z7pyphm9k"], apiConfig);

const result = await renderByShareCode("abc123xyz", apiConfig, {
  profile: "cinematic",
  format: "sprite",
});

console.log(result.videoUrl);
```

Exported helpers include:

| Function | Description |
| --- | --- |
| `getAvailableParts(category, config, options)` | Fetch renderable parts for one category with pagination. |
| `getBuildByShareCode(shareCode, config)` | Fetch build metadata and part IDs for an existing share code. |
| `getPartsByIds(partIds, config)` | Fetch part details for up to 100 BuildCores IDs. |
| `renderByShareCode(shareCode, config, options)` | Create a share-code render job and poll until a media URL is available. |
| `createRenderByShareCodeJob(shareCode, config, options)` | Create a share-code render job without polling. |
| `renderBuildExperimental(request, config)` | Fetch a pregenerated MP4 from the legacy cached endpoint. |
| `renderSpriteExperimental(request, config)` | Fetch a pregenerated WebP sprite from the legacy cached endpoint. |

## 3.4. Part Categories

Valid categories are:

```text
CPU
GPU
RAM
Motherboard
PSU
Storage
PCCase
CPUCooler
CaseFan
```
