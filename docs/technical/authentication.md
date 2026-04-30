---
title: 2. Authentication
description: Delegated render session tokens and token security for BuildCores Render API integrations.
sidebar_position: 1
---

# 2. Authentication

All protected API requests require a Bearer token in the `Authorization` header.
Browser-facing clients should use delegated render session tokens. Your
long-lived API key stays on your server and should not be exposed to the
browser.

Legacy long-lived API-key auth still exists for server-side compatibility, but
browser requests that send long-lived keys are deprecated and receive an
`X-BuildCores-Auth-Deprecation` response header.

## 2.1. Render Session Token Flow

### Step 1: Mint a session token on your server

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

### Step 2: Use the session token in the browser

Pass the session token as a Bearer token for subsequent Render API requests:

```http
Authorization: Bearer <session_token>
```

The render client handles this automatically when configured with
`authMode: "session"`.

## 2.2. Token Security

- Session tokens are HMAC-SHA256 signed JWTs.
- Tokens are scoped, so a token without `render:submit` cannot create render jobs.
- Tokens are environment-bound. A token minted for `prod` cannot be used with `environment=staging`.
- Optional origin binding ensures a token minted for one HTTP(S) origin cannot be used from another browser origin.
- Expired tokens return `401 Unauthorized` and must be refreshed by minting a new session token.
