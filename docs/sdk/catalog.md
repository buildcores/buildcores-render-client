---
title: Catalog mapping
description: Match your products to BuildCores IDs and retrieve specifications.
---

# Catalog mapping

The viewer uses public **BuildCores IDs**. Match your product variants once and
store each accepted ID alongside its SKU in your catalog. Your shop SKU is not
a lookup identifier: resolve its UPC, EAN, or ASIN, then retain the mapping.

Send the requests below from your backend to
**https://www.renderapi.buildcores.com**, with:

```http
Authorization: Bearer <STAGING_API_KEY>
Content-Type: application/json
```

Use `environment: "staging"` for testing and `"prod"` with a production key.
Both environments read the same public catalog.

## Match UPC, EAN, or ASIN

Send 1–100 identifiers to `POST /part-details/resolve`:

```json
{
  "environment": "staging",
  "identifiers": [
    { "type": "upc", "value": "YOUR_12_DIGIT_UPC" },
    { "type": "ean", "value": "YOUR_8_OR_13_DIGIT_EAN" },
    { "type": "asin", "value": "YOUR_10_CHARACTER_ASIN", "marketplace": "US" }
  ]
}
```

Replace the placeholders with your identifiers. Keep them as strings to preserve
leading zeroes. ASINs require a marketplace; UPC/EAN inputs do not accept one.

Each entry in `results` contains `status`, `matchCount`, and `matches`:

| Status      | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| `matched`   | One matching product; review and store its `buildcoresId`    |
| `not_found` | No match in the current catalog                              |
| `ambiguous` | Multiple matches; choose only after reviewing the candidates |

Results follow input order. `matchCount` reports all matches; `matches` includes
up to 20 candidates. Missing catalog identifiers can produce `not_found`.

## Read product details

Send 1–100 public IDs to `POST /part-details/by-ids`:

```json
{
  "environment": "staging",
  "ids": ["YOUR_CASE_BUILDCORES_ID", "YOUR_GPU_BUILDCORES_ID"],
  "includeSpecs": true
}
```

The response contains `parts` and `notFoundIds`. Each product includes its
category, name, image, and `has3dModel`. Specifications are included by default;
set `includeSpecs: false` for summaries. For identifier lookup, specifications
are opt-in with `includeSpecs: true`.

## Unmatched products and missing models

`pc.load()` accepts mapped BuildCores IDs, not EANs or shop SKUs. An unknown ID
rejects the load; it is not automatically replaced with a default product.
Resolve `not_found` and `ambiguous` results before loading that selection. Your
shop can keep its normal configurator available while the 3D view is unavailable.

A catalog match does not guarantee a product-specific 3D model. Check
`has3dModel` and preview the selected products. For missing models or mappings,
share your product list with BuildCores to confirm coverage.

## Load the viewer

```js
await editor.pc.load({
  parts: {
    PCCase: ["YOUR_CASE_BUILDCORES_ID"],
    GPU: ["YOUR_GPU_BUILDCORES_ID"]
  }
});
```

Use category names and arrays of public IDs. Individual part edits use the
catalog `id` returned by `searchParts`; see
[Use the right identifier](./client-reference.md#use-the-right-identifier).
