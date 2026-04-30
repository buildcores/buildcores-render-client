---
title: 6. Full Integration Example
description: Complete backend token endpoint and frontend React viewer example.
sidebar_position: 5
---

# 6. Full Integration Example

## 6.1. Backend Token Endpoint (Node.js / Express)

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

## 6.2. Frontend React Integration

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
