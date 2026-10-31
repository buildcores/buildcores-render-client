---
title: Sample storefront
description: Run a complete SDK v1.0 storefront with a Node backend and plain JavaScript controls.
---

# Sample storefront

The `example-sdk-v1` folder contains **NOVA PC**, a complete browser and backend
sample. It uses plain JavaScript and Node 22+, with no React or package installation.

## Run it

From the repository root:

```bash
cd example-sdk-v1
cp config.example.json config.json
```

1. Replace the part placeholders with [mapped BuildCores IDs](./catalog.md).
2. Set your demo customer's `RENDER_API_KEY` and `RENDER_API_KEY_ID` in the server
   process environment.
3. Run `node server.mjs config.json`, then open [localhost:3090](http://localhost:3090).

Startup registers that storefront origin and hides the built-in controls for the
whole demo customer, across staging and production. Use a dedicated demo customer.

The default PC sample keeps edits in the browser. `config.saved.example.json`
also supports saved PCs and [Setup Builder (Beta)](./setup-builder.md).
See the sample's `README.md` for configuration.

## What is included

- A 3D iframe with storefront controls for parts, fans, RGB, and scene settings.
- A Node backend that registers the viewer, signs tokens, and handles guest sessions.
- Working `/api/editor/open` and `/api/editor/renew` endpoints.
- A guided demo and SDK activity log.

The sample uses shorter endpoint paths than the [Browser quickstart](./quickstart.md);
the request and response contracts are the same. Replace the in-memory guest
sessions with your shop's session store when integrating it.
