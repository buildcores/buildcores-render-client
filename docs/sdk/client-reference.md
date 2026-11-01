---
title: SDK reference
description: Control the viewer, edit parts, and save configurations.
---

# SDK reference

Connect the SDK before setting `iframe.src`, then await `editor.ready`.
See the [Browser quickstart](./quickstart.md) for a working page structure.

## Connection options

| Option             | Purpose                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| `iframe`           | Your iframe element                                                      |
| `viewerOrigin`     | `https://www.renderapi.buildcores.com`                                   |
| `getGrant()`       | Return a renewed token from your backend for the current visitor session |
| `onReady(message)` | Receive readiness information; do not use it to authorize access         |
| `onChange(state)`  | Receive edits and save-status updates                                    |
| `onError(error)`   | Handle failed token renewal                                              |
| `requestTimeoutMs` | Command timeout; defaults to 30 seconds, including readiness             |

## Commands

| Method                                                                           | Action                                                             |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `getState()`                                                                     | Read the current configuration, selected parts, and save status    |
| `pc.load({ parts, interactiveConfig })`                                          | Load a PC from public BuildCores IDs; visual settings are optional |
| `pc.export()`, `pc.restore(snapshot)`                                            | Export or restore a PC snapshot; store the JSON unchanged          |
| `searchParts({ category, query })`                                               | Search the public parts catalog                                    |
| `parts.add`, `parts.replace`, `parts.remove`                                     | Edit installed PC parts                                            |
| `cooling.get`, `cooling.place`, `cooling.move`, `cooling.flip`, `cooling.remove` | Discover fan/radiator slots and edit placements                    |
| `rgb.set`                                                                        | Change global or per-part lighting                                 |
| `configuration.discover`, `configuration.edit`                                   | Find and edit model-specific controls, such as mounts and joints   |
| `setup.addProduct`, `setup.replaceProduct`                                       | Add or replace a Setup product                                     |
| `setup.copy`, `setup.remove`, `setup.setVisibility`                              | Copy, delete, show, or hide a Setup entity                         |
| `setView`, `select`, `resetCamera`                                               | Change the view, selection, or camera framing                      |
| `setRenderPreferences`                                                           | Change rendering and environment settings                          |
| `flush()`, `reload()`                                                            | Finish pending edits or reload the configuration                   |
| `dispose()`                                                                      | Remove SDK listeners; your application removes the iframe          |

Available controls depend on the model. Use discovery results for descriptor
IDs, slot keys, and supported values. Commit sliders on release or debounce
updates.

## Use the right identifier

| Identifier               | Use                                                    |
| ------------------------ | ------------------------------------------------------ |
| `buildcoresId`           | PC presets, Setup products, and your SKU mapping       |
| Catalog `id` as `partId` | PC add/replace commands; returned by `searchParts`     |
| `instanceId`             | An installed part occurrence; returned by `getState()` |
| `buildId`                | The PC being edited, including a PC inside a Setup     |
| `entityId`               | A Setup item                                           |

Refresh state after replacing a part because its occurrence ID can change.

```js
await editor.rgb.set({ color: "#4466ff", brightness: 70 });
await editor.setRenderPreferences({ environment: { showGrid: false } });

const state = await editor.getState();
const pc = state.builds[0];
const gpu = pc?.parts.find((part) => part.category === "GPU");
const catalog = await editor.searchParts({ category: "GPU", query: "GeForce" });
// Example: use the first result. Your UI should let the shopper select a product.
const replacement = catalog.parts[0];
if (pc && gpu && replacement) {
  await editor.parts.replace({
    buildId: pc.id,
    instanceId: gpu.instanceId,
    partId: replacement.id
  });
}
```

## Saved configurations

The quickstart uses **stateless PC mode**: edits stay in the browser. To enable
BuildCores autosave, register an authorized source instead:

```json
{ "kind": "build", "shareCode": "YOUR_BUILD_SHARE_CODE" }
```

For [Setup Builder (Beta)](./setup-builder.md):

```json
{ "kind": "setup", "shareCode": "YOUR_SETUP_SHARE_CODE" }
```

Your BuildCores account must own the source, including attached PCs, or use an authorized
published source. Sources stay unchanged. A different source needs a new embed.
Issue `access: "edit"` tokens with a stable, backend-owned `externalBuildId`.

Keep the quickstart's connection code. Remove the initial `pc.load()` call so
reopening loads the shopper's saved changes. `pc.load` and `pc.restore` can
replace a saved PC, but cannot replace a Setup workspace.

|                | Stateless PC                                 | Saved PC / Setup                                    |
| -------------- | -------------------------------------------- | --------------------------------------------------- |
| Edit completes | After local acceptance and model preparation | After the server saves it                           |
| `saveStatus`   | `idle`                                       | Current save status                                 |
| `flush()`      | Wait for earlier commands                    | Finish saves or retry a retained uncertain save     |
| `reload()`     | Reset to the last loaded preset/snapshot     | Load the server version, discarding unsaved changes |

Camera and selection stay local. Rendering preferences persist in saved mode.

## Use your own controls

The built-in editor is visible by default. To hide its controls, call
`PATCH /embed-config?environment=staging` from your backend with your API key:

```json
{ "embed": { "hideUi": true } }
```

This setting applies to your whole BuildCores account, across staging and production, on
next open/reload. Branding, disclaimer, save status, and error feedback remain.
Your page can then use the SDK commands to provide controls.

## Errors

Catch command promise rejections. `RenderEmbedCommandError` includes `code`,
`message`, and an optional HTTP `status`.

| Code          | Recovery                                                         |
| ------------- | ---------------------------------------------------------------- |
| `CONFLICT`    | Ask before discarding unsaved edits with `reload()`              |
| `SAVE_FAILED` | Show the failure; `flush()` can retry a retained uncertain save  |
| `TIMEOUT`     | Read state before retrying; the original edit may still complete |

Commands are not automatically replayed. Respect `Retry-After` for HTTP 429.

## Usage

One accepted viewer opening counts as one admission. A new opening can count
again, including when reopening a saved configuration. Renewals, edits, and
catalog reads add no admissions. Rendering failures do not undo an admission.

Read `GET /embed-usage?environment=staging` from your backend; use `prod` for
production. Add `month=YYYY-MM` for a UTC month. Request limits are not monthly
spending caps; confirm commercial terms with BuildCores.
