---
title: SDK v1.0
description: Accurate 3D PC models, maintained hardware specs, and fast browser rendering for your website.
slug: /
hide_table_of_contents: true
---

import Link from "@docusaurus/Link";
import SdkBenefits from "@site/src/components/SdkBenefits";

# BuildCores SDK v1.0

Bring real PC hardware to your website. Add an interactive 3D configurator with
your own controls or the built-in editor.

<Link className="button button--primary" to="/sdk/get-started/">Get started</Link>

<SdkBenefits />

Your backend handles access; BuildCores handles the viewer and 3D models.

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
- [3D PC Builder Sample](./sample.md): run a complete browser and backend example.
- [Backend authentication](./authentication.md): register an embed and issue access tokens.
- [SDK reference](./client-reference.md): edit configurations and save changes.
- [Catalog mapping](./catalog.md): connect your products to BuildCores IDs.
