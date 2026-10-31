---
title: Browser quickstart
description: Add a viewer and load your first PC configuration.
---

# Browser quickstart

This example displays an interactive 3D PC in an iframe using plain JavaScript.
No React or frontend package installation is required. Changes stay in the
browser until you save a snapshot in your own application.

The built-in controls are visible by default. If your shop already has a parts
selector, see [Use your existing configurator](#use-your-existing-configurator).

For a complete browser and backend example, run the [Sample storefront](./sample.md).

Complete [Get started](./get-started.md) and implement these
[backend endpoints](./authentication.md):

| Your endpoint                       | Returns                        |
| ----------------------------------- | ------------------------------ |
| `POST /api/buildcores/editor/open`  | `{ iframeUrl, editorSession }` |
| `POST /api/buildcores/editor/renew` | `{ token }`                    |

These routes belong to your application. Use a guest or signed-in session and
your usual CSRF protection. The open token uses `access: "configure"`.

## Add the viewer

Replace the two part placeholders with public BuildCores IDs. Serve the page
from a URL allowed by your embed registration.

```html
<iframe
  id="buildcores"
  title="PC configurator"
  referrerpolicy="strict-origin"
  style="width: 100%; height: 640px; border: 0;"
></iframe>

<script type="module">
  import { connectRenderEmbedCustomer } from "https://www.renderapi.buildcores.com/embed-assets/customer-sdk.js";

  const viewerOrigin = "https://www.renderapi.buildcores.com";
  const iframe = document.querySelector("#buildcores");
  const opened = await fetch("/api/buildcores/editor/open", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store"
  });
  if (!opened.ok) throw new Error("Could not open the viewer");

  const { iframeUrl, editorSession } = await opened.json();
  const url = new URL(iframeUrl);
  if (url.origin !== viewerOrigin) throw new Error("Unexpected viewer URL");

  const editor = connectRenderEmbedCustomer({
    iframe,
    viewerOrigin,
    async getGrant() {
      const response = await fetch("/api/buildcores/editor/renew", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editorSession })
      });
      if (!response.ok) throw new Error("Could not renew access");
      return (await response.json()).token;
    }
  });

  window.addEventListener("pagehide", () => editor.dispose(), { once: true });
  // Connect the SDK before loading the iframe.
  iframe.src = url.href;
  await editor.ready;
  await editor.pc.load({
    parts: {
      PCCase: ["YOUR_CASE_BUILDCORES_ID"],
      GPU: ["YOUR_GPU_BUILDCORES_ID"]
    }
  });
</script>
```

Keep `referrerpolicy="strict-origin"` so token renewal works. If your site uses
Content Security Policy, allow the SDK and iframe from the host above. An iframe
sandbox must permit scripts and same-origin execution.

## Use your existing configurator

Keep product selection, pricing, and checkout in your shop. Before opening the
viewer, [hide its built-in controls](./client-reference.md#use-your-own-controls).
The iframe keeps the 3D view, camera interaction, and BuildCores branding.
Keep `access: "configure"` so your page can update the displayed PC.

[Map your SKUs or EANs](./catalog.md) to public BuildCores IDs, then pass the
selected parts to `editor.pc.load()`. No share code or saved BuildCores build is
needed. Call it again when your shop's selection changes.

Each `pc.load()` replaces the current PC. To preserve shopper adjustments while
changing individual parts, use the [part-editing commands](./client-reference.md#use-the-right-identifier).

## Keep a shopper's changes

Export the configuration and store the returned JSON in your cart or session:

```js
const snapshot = await editor.pc.export();
```

After opening a new viewer, restore it instead of loading the initial parts:

```js
await editor.ready;
await editor.pc.restore(snapshot);
```

Store snapshots unchanged. A page refresh otherwise starts from your initial
parts list. See [Saved configurations](./client-reference.md#saved-configurations)
for server autosave and Setup editors.

Call `editor.dispose()` when removing the viewer or opening another session.
Handle rejected commands in your UI; see [Errors](./client-reference.md#errors).
