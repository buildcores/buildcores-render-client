---
title: 3D Configurator API 2.0
description: Current technical documentation for the BuildCores Render API and @buildcores/render-client.
sidebar_position: 3
---

import renderApiFlow from "@site/static/assets/images/render-api-flow.png";

# BuildCores 3D Configurator API: Technical Documentation

Version 2.0.

## 1. High-Level Overview

BuildCores lets PC shoppers and builders visualize selected computer components
as interactive 360-degree renders. The BuildCores 3D Configurator API exposes:

- A backend REST API for fetching renderable part data, fetching existing build data, and creating cloud-rendered 3D build assets as video or sprite-sheet media.
- A frontend React component library, `@buildcores/render-client`, for embedding drag-to-rotate viewers in partner sites and applications.

<figure className="doc-figure">
  <img src={renderApiFlow} alt="BuildCores Render API integration flow" />
  <figcaption>Render API and <code>@buildcores/render-client</code> integration flow.</figcaption>
</figure>

## Technical Sections

<section className="doc-card-grid" aria-label="Technical documentation sections">
  <a className="doc-card" href="../technical/authentication/">
    <strong>2. Authentication</strong>
    <span>Mint short-lived render session tokens and apply scoped browser-safe auth.</span>
  </a>
  <a className="doc-card" href="../technical/frontend-integration/">
    <strong>3. Frontend Integration</strong>
    <span>Install and configure <code>@buildcores/render-client</code>, including component props and helper APIs.</span>
  </a>
  <a className="doc-card" href="../technical/backend-api-reference/">
    <strong>4. Backend API Reference</strong>
    <span>Review endpoint contracts for parts, build lookups, render jobs, and share-code rendering.</span>
  </a>
  <a className="doc-card" href="../technical/render-options/">
    <strong>5. Render Options</strong>
    <span>Choose render profiles, scene presets, grid settings, and seasonal options.</span>
  </a>
  <a className="doc-card" href="../technical/full-integration-example/">
    <strong>6. Full Integration Example</strong>
    <span>Use a complete Express token endpoint and React viewer example as a starting point.</span>
  </a>
  <a className="doc-card" href="../technical/error-codes/">
    <strong>7. Error Codes</strong>
    <span>Map HTTP responses to authentication, validation, render, and server-side failures.</span>
  </a>
  <a className="doc-card" href="../technical/technical-support/">
    <strong>8. Technical Support</strong>
    <span>Find API docs, health check details, package information, and partner support contacts.</span>
  </a>
</section>
