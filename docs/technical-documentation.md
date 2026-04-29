---
layout: default
title: 3D Configurator API 2.0
description: Current technical documentation for the BuildCores Render API and @buildcores/render-client.
---

<article class="content" markdown="1">

# BuildCores 3D Configurator API: Technical Documentation

Version 2.0.

<div class="toc">
  <strong>Contents</strong>
  <ul>
    <li><a href="#1-high-level-overview">High-Level Overview</a></li>
    <li><a href="#2-authentication">Authentication</a></li>
    <li><a href="#3-frontend-integration-buildcoresrender-client">Frontend Integration</a></li>
    <li><a href="#4-backend-api-reference">Backend API Reference</a></li>
    <li><a href="#5-render-options-reference">Render Options Reference</a></li>
    <li><a href="#6-full-integration-example">Full Integration Example</a></li>
    <li><a href="#7-error-codes">Error Codes</a></li>
    <li><a href="#8-technical-support">Technical Support</a></li>
  </ul>
</div>

## 1. High-Level Overview

BuildCores lets PC shoppers and builders visualize selected computer components
as interactive 360-degree renders. The BuildCores 3D Configurator API exposes:

- A backend REST API for fetching renderable part data, fetching existing build data, and creating cloud-rendered 3D build assets as video or sprite-sheet media.
- A frontend React component library, `@buildcores/render-client`, for embedding drag-to-rotate viewers in partner sites and applications.

<div class="wide-image">
  <img src="{{ '/assets/images/render-api-flow.png' | relative_url }}" alt="BuildCores Render API integration flow">
  <p class="caption">Render API and <code>@buildcores/render-client</code> integration flow.</p>
</div>

## 2. Authentication

All protected API requests require a Bearer token in the `Authorization` header.
Browser-facing clients should use delegated render session tokens. Your
long-lived API key stays on your server and should not be exposed to the
browser.

Legacy long-lived API-key auth still exists for server-side compatibility, but
browser requests that send long-lived keys are deprecated and receive an
`X-BuildCores-Auth-Deprecation` response header.

### 2.1. Render Session Token Flow

#### Step 1: Mint a session token on your server

Your backend calls the BuildCores Render API with your long-lived API key:

```bash
curl -X POST "https://www.renderapi.buildcores.com/auth/render-session" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "ttl_seconds": 120,
    "scopes": ["render:submit", "render:status", "data:read"],
    "origin": "https://yoursite.com"
  }'
```

Response:

```json
{
  "session_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 120,
  "expires_at": "2026-04-06T12:02:00.000Z",
  "scopes": ["render:submit", "render:status", "data:read"],
  "environment": "prod"
}
```

Parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `ttl_seconds` | integer | No | Token lifetime in seconds. Min `30`, max `300`, default `120`. `ttlSeconds` is also accepted. |
| `scopes` | string[] | No | Permissions granted to the token. Default is `["render:submit", "render:status"]`. Request `data:read` when the browser needs parts or build data. |
| `origin` | string | No | Optional HTTP(S) origin binding. If present, browser requests using the token must send a matching `Origin` header. |

Available scopes:

| Scope | Grants Access To |
| --- | --- |
| `render:submit` | `POST /render-build`, `POST /render-by-share-code`, `POST /internal-render`, `POST /render-build-experimental` |
| `render:status` | `GET /render-build/:jobId` |
| `data:read` | `GET /available-parts`, `GET /build/:shareCode`, `POST /parts` |

#### Step 2: Use the session token in the browser

Pass the session token as a Bearer token for subsequent Render API requests:

```http
Authorization: Bearer <session_token>
```

The render client handles this automatically when configured with
`authMode: "session"`.

### 2.2. Token Security

- Session tokens are HMAC-SHA256 signed JWTs.
- Tokens are scoped, so a token without `render:submit` cannot create render jobs.
- Tokens are environment-bound. A token minted for `prod` cannot be used with `environment=staging`.
- Optional origin binding ensures a token minted for one HTTP(S) origin cannot be used from another browser origin.
- Expired tokens return `401 Unauthorized` and must be refreshed by minting a new session token.

## 3. Frontend Integration: `@buildcores/render-client`

Install the React client:

```bash
npm install @buildcores/render-client
```

Peer dependencies:

```text
react >= 16.8.0
react-dom >= 16.8.0
```

### 3.1. Authentication Setup

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

### 3.2. `<BuildRender />` Component

`BuildRender` displays a sprite-based interactive 360-degree viewer. It can
render directly from part IDs or from an existing BuildCores share code.

Render by part IDs:

{% raw %}
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
{% endraw %}

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

### 3.3. API Functions

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

### 3.4. Part Categories

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

## 4. Backend API Reference

Base URL:

```text
https://www.renderapi.buildcores.com
```

Interactive API documentation is available at:

```text
https://www.renderapi.buildcores.com/api-docs
```

All endpoints except `/auth/render-session` and `/health` require Bearer auth.
Session tokens are scope-gated.

### 4.1. `POST /auth/render-session`

Mints a short-lived delegated render session token. This endpoint is
authenticated with your long-lived API key. See [Render Session Token Flow](#21-render-session-token-flow).

### 4.2. `GET /available-parts`

Retrieves renderable parts for a specific category.

Required scope: `data:read`

Query parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `category` | string | Yes | Part category, such as `GPU`, `CPU`, or `PCCase`. |
| `limit` | integer | No | Results per page. Default `20`, max `100`. |
| `skip` | integer | No | Number of results to skip. Default `0`. |

Example:

```bash
curl "https://www.renderapi.buildcores.com/available-parts?category=GPU&limit=2" \
  -H "Authorization: Bearer <session_token>"
```

Response:

```json
{
  "data": {
    "GPU": [
      { "id": "z7pyphm9k", "name": "ASUS GeForce RTX 5080 ASTRAL", "image": "https://..." },
      { "id": "4a0mjb360", "name": "PNY GeForce RTX 5060 Ti 16GB", "image": "https://..." }
    ]
  },
  "category": "GPU",
  "pagination": {
    "total": 150,
    "limit": 2,
    "skip": 0,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 4.3. `POST /render-build`

Submits an asynchronous render job from part IDs and returns a `job_id` for polling.

Required scope: `render:submit`

The current implementation only accepts `prod` for the async render environment.

Request body:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `parts` | `{ [category]: string[] }` | Yes | Part IDs mapped by category. The object cannot be empty. |
| `format` | `"video" \| "sprite"` | No | Output format. Default is `"video"`. |
| `width` | integer | No | Canvas width. Must be provided with `height`. Range `256` to `8192`. |
| `height` | integer | No | Canvas height. Must be provided with `width`. Range `256` to `8192`. |
| `profile` | `"cinematic" \| "flat" \| "fast"` | No | Render quality profile. |
| `scene` | string | No | Environment scene preset. |
| `showBackground` | boolean | No | Show the environment background. |
| `showGrid` | boolean | No | Show the 3D ground grid. Defaults to `true` unless profile is `flat` or `fast`. |
| `winterMode` | boolean | No | Winter visual effects. Mutually exclusive with `springMode`. |
| `springMode` | boolean | No | Spring visual effects. Mutually exclusive with `winterMode`. |
| `cameraOffsetX` | number | No | Horizontal camera offset. Clamped from `-0.3` to `0.3`. |
| `cameraZoom` | number | No | Server-side camera distance. Clamped from `0.5` to `2.0`. |
| `gridSettings` | object | No | Custom grid appearance settings. |
| `frameQuality` | `"standard" \| "high"` | No | Sprite frame count. `standard` is 72 frames; `high` is 144 frames. |

Example:

```bash
curl -X POST "https://www.renderapi.buildcores.com/render-build" \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "parts": {
      "PCCase": ["qq9jamk7c"],
      "GPU": ["z7pyphm9k"],
      "Motherboard": ["iwin2u9vx"],
      "CPUCooler": ["62d8zelr5"]
    },
    "format": "video",
    "profile": "cinematic"
  }'
```

Response, new job:

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "processing"
}
```

Response, cache hit:

```json
{
  "job_id": "existing-job-uuid",
  "status": "completed",
  "video_url": "https://...",
  "cached": true
}
```

Response, in-flight reuse:

```json
{
  "job_id": "existing-job-uuid",
  "status": "processing",
  "reused": true
}
```

### 4.4. `GET /render-build/:jobId`

Polls the status of a render job.

Required scope: `render:status`

Session tokens can only fetch jobs owned by the same customer. Jobs outside the
customer scope return `404`.

Response:

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "job_type": "render",
  "url": "https://cdn.buildcores.com/renders/...",
  "video_url": "https://cdn.buildcores.com/renders/...",
  "sprite_url": null,
  "screenshot_url": null,
  "end_time": "2026-04-06T12:05:30.000Z"
}
```

Status values are `queued`, `processing`, `completed`, and `error`.

### 4.5. `POST /render-by-share-code`

Creates a render job for an existing BuildCores build share code. This is the
preferred path when a build already exists and saved interactive state, such as
case fan slot placement, should be preserved.

Required scope: `render:submit`

Request body:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `shareCode` | string | Yes | Share code of the build to render. |
| `format` | `"video" \| "sprite"` | No | Output format. Default is `"video"`. |
| `profile` | `"cinematic" \| "flat" \| "fast"` | No | Render quality profile. |
| `width` / `height` | integer | No | Canvas dimensions. Must be provided together. Range `256` to `8192`. |
| Render options | mixed | No | Same scene, grid, camera, seasonal, and frame-quality options as `/render-build`. |

Example:

```bash
curl -X POST "https://www.renderapi.buildcores.com/render-by-share-code" \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "shareCode": "abc123xyz",
    "format": "sprite",
    "profile": "cinematic",
    "showGrid": true
  }'
```

Response:

```json
{
  "job_id": "a1b2c3d4-...",
  "status": "processing",
  "share_code": "abc123xyz"
}
```

Poll with `GET /render-build/:jobId`.

### 4.6. `GET /build/:shareCode`

Fetches build details by share code, including part IDs organized by category
and available part details.

Required scope: `data:read`

Example:

```bash
curl "https://www.renderapi.buildcores.com/build/abc123xyz" \
  -H "Authorization: Bearer <session_token>"
```

Response:

```json
{
  "shareCode": "abc123xyz",
  "name": "My Gaming PC",
  "description": "RTX 5080 build",
  "parts": {
    "CPU": ["7xjqsomhr"],
    "GPU": ["z7pyphm9k"],
    "Motherboard": ["iwin2u9vx"],
    "PCCase": ["qq9jamk7c"]
  },
  "partDetails": {
    "CPU": [
      { "id": "7xjqsomhr", "name": "AMD Ryzen 7 9800X3D", "image": "https://...", "category": "CPU" }
    ],
    "GPU": [
      { "id": "z7pyphm9k", "name": "ASUS GeForce RTX 5080 ASTRAL", "image": "https://...", "category": "GPU" }
    ]
  },
  "hasInteractiveModel": true
}
```

### 4.7. `POST /parts`

Fetches part details by BuildCores IDs.

Required scope: `data:read`

Request body:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `ids` | string[] | Yes | Array of BuildCores part IDs. Max `100`. An empty array returns `{ "parts": [] }`. |

Response:

```json
{
  "parts": [
    { "id": "7xjqsomhr", "name": "AMD Ryzen 7 9800X3D", "image": "https://...", "category": "CPU" },
    { "id": "z7pyphm9k", "name": "ASUS GeForce RTX 5080 ASTRAL", "image": "https://...", "category": "GPU" }
  ]
}
```

### 4.8. `POST /render-build-experimental`

Returns a pregenerated 360-degree MP4 video or WebP sprite sheet as binary data
for a given set of parts. This legacy endpoint serves cached pregenerated
content only. If the exact visible-part combination has not been pregenerated,
it returns `404`.

Required scope: `render:submit`

The async `/render-build` and `/render-by-share-code` endpoints are preferred
for new integrations.

## 5. Render Options Reference

### 5.1. Render Profiles

| Profile | Description |
| --- | --- |
| `cinematic` | Full effects such as shadows, ambient occlusion, and bloom. Highest quality. Grid defaults on. |
| `flat` | Clean, neutral product shots without the cinematic effect stack. |
| `fast` | Minimal rendering for fastest processing speed. |

### 5.2. Scene Presets

Available values for `scene`:

```text
sunset
dawn
night
warehouse
forest
apartment
studio
studio_v2
city
park
lobby
```

Seasonal fallback behavior:

- `springMode` defaults `scene` to `dawn` and `showBackground` to `true` when those values are omitted.
- `winterMode` defaults `scene` to `studio_v2` and `showBackground` to `false` when those values are omitted.

### 5.3. Grid Settings

When `showGrid` is true, `gridSettings` can customize the grid:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `cellThickness` | number | `0.8` | Grid cell line thickness. |
| `sectionThickness` | number | `1.4` | Grid section line thickness. |
| `color` | string | `"#6f6f6f"` | Grid color as a hex string. |
| `fadeDistance` | number | `20` | Distance at which the grid fades out. |
| `renderOrder` | integer | `-1` | Depth sort order. Use `-1` to render behind objects. |

## 6. Full Integration Example

### 6.1. Backend Token Endpoint (Node.js / Express)

```ts
import express from "express";

const app = express();
app.use(express.json());

app.post("/api/buildcores-token", async (req, res) => {
  const response = await fetch(
    "https://www.renderapi.buildcores.com/auth/render-session",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BUILDCORES_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ttl_seconds: 120,
        scopes: ["render:submit", "render:status", "data:read"],
        origin: req.get("origin"),
      }),
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
});
```

### 6.2. Frontend React Integration

{% raw %}
```tsx
import {
  BuildRender,
  PartCategory,
  getAvailableParts,
  type ApiConfig,
} from "@buildcores/render-client";

const apiConfig: ApiConfig = {
  environment: "prod",
  authMode: "session",
  getRenderSessionToken: async () => {
    const res = await fetch("/api/buildcores-token", { method: "POST" });
    if (!res.ok) {
      throw new Error("Failed to mint BuildCores session token");
    }
    const data = await res.json();
    return { token: data.session_token, expiresAt: data.expires_at };
  },
};

async function loadGpus() {
  const response = await getAvailableParts(PartCategory.GPU, apiConfig, {
    limit: 20,
  });
  return response.data.GPU ?? [];
}

export function PCViewer() {
  return (
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
      animationMode="spin360"
      spinDuration={12000}
    />
  );
}
```
{% endraw %}

## 7. Error Codes

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Malformed request body, missing required fields, invalid categories, invalid dimensions, unsupported environment, or conflicting options such as both `winterMode` and `springMode`. |
| `401 Unauthorized` | Missing, invalid, expired, or environment/origin-mismatched token. |
| `403 Forbidden` | Session token does not have the required scope. |
| `404 Not Found` | Part ID, build share code, render job, customer-owned job, or pregenerated render not found. |
| `500 Internal Server Error` | Server-side error. |

## 8. Technical Support

- API documentation: `https://www.renderapi.buildcores.com/api-docs`
- Health check: `GET /health`, no auth required, returns `{ "status": "ok" }`
- Package: `@buildcores/render-client`
- Support: contact BuildCores through the partner or API channel for onboarding, integration questions, issue escalation, and non-React integration guidance.

</article>
