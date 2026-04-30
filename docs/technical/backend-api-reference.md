---
title: 4. Backend API Reference
description: Endpoint reference for BuildCores Render API authentication, parts, build lookup, and render jobs.
sidebar_position: 3
---

# 4. Backend API Reference

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

## 4.1. `POST /auth/render-session`

Mints a short-lived delegated render session token. This endpoint is
authenticated with your long-lived API key. See [Render Session Token Flow](../authentication/#21-render-session-token-flow).

## 4.2. `GET /available-parts`

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

## 4.3. `POST /render-build`

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

## 4.4. `GET /render-build/:jobId`

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

## 4.5. `POST /render-by-share-code`

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

## 4.6. `GET /build/:shareCode`

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

## 4.7. `POST /parts`

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

## 4.8. `POST /render-build-experimental`

Returns a pregenerated 360-degree MP4 video or WebP sprite sheet as binary data
for a given set of parts. This legacy endpoint serves cached pregenerated
content only. If the exact visible-part combination has not been pregenerated,
it returns `404`.

Required scope: `render:submit`

The async `/render-build` and `/render-by-share-code` endpoints are preferred
for new integrations.
