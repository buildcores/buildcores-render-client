# 3D PC Builder Sample

A minimal, light-mode PC builder with plain JavaScript, a Node backend, and the
hosted BuildCores 3D viewer. No React, package installation, or build step is required.

The storefront supplies its own controls for parts, fans, RGB, rendering, and
Setup products. The iframe keeps camera interaction, BuildCores branding,
disclaimer, and save feedback.

## Run locally

Requires Node 22+ and your BuildCores staging API key and key ID.

From the repository root:

```bash
cd example-sdk-v1
cp config.example.json config.json
```

Replace the part placeholders in `config.json` with public BuildCores IDs.
Use [Catalog mapping](https://buildcores.github.io/buildcores-render-client/sdk/catalog/)
to map your products. The API host is `https://www.renderapi.buildcores.com`.

Set your BuildCores API key as `BUILDCORES_API_KEY` and your key ID as
`BUILDCORES_API_KEY_ID` in the server process environment, then run:

```bash
node server.mjs config.json
```

Open [localhost:3090](http://localhost:3090). Use this exact origin; if you
change it, update `merchantOrigin` in the config. `npm start` runs the same server
with `config.json`.

Startup registers your storefront origin and sets `embed.hideUi: true` for your
BuildCores account. This hides built-in controls across all your staging and
production embeds.

## PC configuration

The default `source: { "kind": "pc" }` loads `preset.parts` and optional visual
settings through `editor.pc.load()`. No share code or saved build is needed.
Edits stay in the browser; refreshing restores the preset. Your application can
save the unchanged JSON from `editor.pc.export()` and restore it with
`editor.pc.restore(snapshot)`.

Open **Parts**, **RGB lighting**, **Case fans**, or **Scene** to try each feature.
**Model options** discovers model-specific controls. Only one section opens at a
time; **SDK activity** shows the commands sent to the viewer.

**Run feature demo** changes the GPU, places and flips a fan, adjusts RGB and the scene,
and resets the camera. It needs a case with authored fan slots, an available
replacement GPU, and a compatible fan. Optional `catalogQueries` can set search
defaults, such as `{ "GPU": "GeForce", "CaseFan": "120" }`.

## Saved PC or Setup

Use `config.saved.example.json` as the template instead. Set `source.shareCode`
to a Build owned by your BuildCores account or an authorized published Build. **Setup Builder mode is in beta.**
For desk products and positioning, set `source.kind` to `"setup"` and use an authorized Setup containing
a PC. Your account must also be authorized for any attached PCs.

Saved mode autosaves changes and reopens the same guest configuration after a
refresh. Keep `preset` out of saved-mode configuration so reopening does not
replace the saved edits. Setup controls are enabled only for a Setup source.

## How it works

| File                                    | Purpose                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| `server.mjs`                            | Read config and server credentials, provision the embed, and start the server     |
| `merchant.mjs`                          | Register the viewer, sign grants, manage guest sessions, and serve the storefront |
| `public/storefront.mjs`                 | Connect the hosted SDK and drive the viewer from storefront controls              |
| `public/index.html`, `public/style.css` | Storefront markup and styles                                                      |

The sample implements `POST /api/editor/open` and `POST /api/editor/renew`.
These are the same contracts described in the documentation under
`/api/buildcores/editor/open` and `/api/buildcores/editor/renew`; the sample uses
shorter route names.

The backend keeps your BuildCores API key private. An HttpOnly guest cookie identifies the
visitor; no shopper login is required. Renewal checks that the visitor owns the
session and preserves its identity. The SDK connects before the iframe loads.

Guest sessions and their signing secret live in memory. Restarting the server
or clearing cookies starts a new guest. In saved mode, earlier configurations
remain on BuildCores servers. For your shop, use your normal guest/customer cart
identity, persistent session store, and access limits. This sample binds to
loopback and includes no checkout.

## Check the sample

```bash
npm run check
```

This checks JavaScript syntax. Rendering requires the configured API access and
valid product IDs.

Adapted from [BuildCoresBase PR #1961](https://github.com/buildcores/BuildCoresBase/pull/1961),
`examples/render-embed-retailer` at `c4b29467cf28c4ec1472484c2a2e52459018a588`.
The SDK controls and session flow come from that sample; the interface is simplified
and uses light mode. The default config selects stateless PC mode, with a separate
saved-PC/Setup example.
