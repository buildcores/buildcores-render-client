# Changelog

All notable changes to `@buildcores/render-client` will be documented in this file.

## [1.7.0] - 2026-03-05

### Added

- Added session-based API authentication via `apiConfig.authMode = "session"` and `apiConfig.getRenderSessionToken`, with automatic token reuse and refresh-on-401 behavior.
- Added render environment controls across the SDK request types and component props: `scene`, `showBackground`, `winterMode`, and `springMode`.
- Added `screenshot_url` to render job status responses.
- Exported additional SDK types including `RenderScene`, `RenderJobCreateResponse`, and `RenderJobStatusResponse`.

### Changed

- Updated `BuildRender` and `useSpriteRender` to pass environment and composition options consistently for both parts-based and share-code rendering flows.
- Updated `createRenderByShareCodeJob`, async render job creation, and experimental render endpoints to forward the new environment options.
- Expanded the docs and Vite example app to demonstrate session auth and the new scene/background/season controls.

### Deprecated

- Legacy browser API key auth remains supported for compatibility, but session auth is now the recommended integration mode.
