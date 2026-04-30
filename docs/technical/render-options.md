---
title: 5. Render Options
description: Render profiles, scene presets, seasonal defaults, and grid settings.
sidebar_position: 4
---

# 5. Render Options Reference

## 5.1. Render Profiles

| Profile | Description |
| --- | --- |
| `cinematic` | Full effects such as shadows, ambient occlusion, and bloom. Highest quality. Grid defaults on. |
| `flat` | Clean, neutral product shots without the cinematic effect stack. |
| `fast` | Minimal rendering for fastest processing speed. |

## 5.2. Scene Presets

Available values for `scene`:

```text
sunset
dawn
night
warehouse
forest
apartment
studio
studio_v2
city
park
lobby
```

Seasonal fallback behavior:

- `springMode` defaults `scene` to `dawn` and `showBackground` to `true` when those values are omitted.
- `winterMode` defaults `scene` to `studio_v2` and `showBackground` to `false` when those values are omitted.

## 5.3. Grid Settings

When `showGrid` is true, `gridSettings` can customize the grid:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `cellThickness` | number | `0.8` | Grid cell line thickness. |
| `sectionThickness` | number | `1.4` | Grid section line thickness. |
| `color` | string | `"#6f6f6f"` | Grid color as a hex string. |
| `fadeDistance` | number | `20` | Distance at which the grid fades out. |
| `renderOrder` | integer | `-1` | Depth sort order. Use `-1` to render behind objects. |
