---
title: Setup Builder (Beta)
description: Add a saved 3D workspace with PCs, desks, monitors, and accessories.
---

# Setup Builder (Beta)

Let shoppers arrange PCs, desks, monitors, and accessories in a shared 3D
workspace. Setup Builder mode is in beta and uses the same browser SDK.

Use the built-in controls or [connect your own interface](./client-reference.md#use-your-own-controls).

## 1. Register a Setup

Follow [Backend authentication](./authentication.md), using this registration
target:

```json
{ "kind": "setup", "shareCode": "YOUR_SETUP_SHARE_CODE" }
```

Your customer must own the source Setup and its attached PCs, or have permission
to use the published source. The source stays unchanged; shoppers edit a separate
saved configuration.

## 2. Issue editing access

Use `access: "edit"` and a stable, backend-owned `externalBuildId` for each
shopper's configuration. Reuse that value to reopen saved changes, and create a
new session ID for each opening.

Guests are supported. Associate the configuration with your guest session or
cart; no shopper login is required.

## 3. Open the workspace

Use the [Browser quickstart](./quickstart.md) connection and renewal code. Replace
its initial `pc.load()` call with:

```js
await editor.ready;
await editor.setView({ mode: "setup" });
```

The viewer loads the saved workspace, starting from the registered Setup on its
first opening.

## 4. Edit products

Add products using public IDs from [Catalog mapping](./catalog.md):

```js
await editor.setup.addProduct({
  category: "Keyboard",
  buildcoresId: "YOUR_KEYBOARD_BUILDCORES_ID"
});
```

| Command                                        | Use                                                        |
| ---------------------------------------------- | ---------------------------------------------------------- |
| `setup.replaceProduct`                         | Replace a product                                          |
| `setup.copy`, `setup.remove`                   | Copy or remove a product                                   |
| `setup.setVisibility`                          | Show or hide an item                                       |
| `configuration.discover`, `configuration.edit` | Discover and edit supported positioning and model controls |
| `setView({ mode: "build", buildId })`          | Edit a PC within the workspace                             |

Read `getState()` for current entity and build IDs. Available controls depend on
the selected product.

## Saving

Changes autosave on BuildCores. Use the same `externalBuildId` when reopening.
Camera and selection remain local.

Setup mode requires a saved workspace. The `pc.load`, `pc.export`, and
`pc.restore` methods apply to PCs, not whole Setups.

## Try the sample

In the [Sample storefront](./sample.md), start from
`config.saved.example.json`. Set `source.kind` to `"setup"` and
`source.shareCode` to your authorized Setup's share code. Omit `preset`.
Include a PC in the Setup to try the sample's guided demo.
