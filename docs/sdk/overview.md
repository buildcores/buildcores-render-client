---
title: SDK v1.0
description: Add an interactive 3D PC or Setup configurator to your website.
slug: /sdk/
---

import sdkPreview from "@site/static/assets/images/local-configurator.png";

# BuildCores SDK v1.0

Add an interactive 3D PC configurator to your website, or a full workspace with
[Setup Builder (Beta)](./setup-builder.md). The SDK runs in the browser and lets
shoppers change parts, lighting, cooling, and supported model settings.

Use the built-in controls or connect your own interface. Your backend handles
access; BuildCores handles the viewer and 3D models.

<figure className="doc-figure">
  <img src={sdkPreview} alt="BuildCores interactive 3D PC configurator" />
</figure>

**[Get started](./get-started.md)** to set up access and add your first viewer.

## Hosted SDK

API base URL: **https://www.renderapi.buildcores.com**

Browser module:

```text
https://www.renderapi.buildcores.com/embed-assets/customer-sdk.js
```

Load it directly with a JavaScript module import. No React dependency or npm
installation is required.

## Guides

- [Browser quickstart](./quickstart.md): add a viewer to your page.
- [Setup Builder (Beta)](./setup-builder.md): add PCs and desk products to a saved workspace.
- [Sample storefront](./sample.md): run a complete browser and backend example.
- [Backend authentication](./authentication.md): register an embed and issue access tokens.
- [SDK reference](./client-reference.md): edit configurations and save changes.
- [Catalog mapping](./catalog.md): connect your products to BuildCores IDs.
