---
title: Get started
description: Set up access, connect your backend, and add the BuildCores viewer to your site.
---

# Get started

You need a website and a backend. The browser displays the 3D viewer; your
backend keeps the API key private.

Your backend issues viewer access tokens for visitors, including guests.
No shopper login is required.

## 1. Get access

Create a [BuildCores account](https://www.buildcores.com/) and email
[harsh@buildcores.com](mailto:harsh@buildcores.com) with your account email,
technical contact, and a sample product list.

BuildCores provides a staging API key, customer ID, and key ID for testing.

## 2. Connect your backend

Use **https://www.renderapi.buildcores.com** as the API base URL.

Register your viewer, then add two endpoints to your backend: one to open it and
one to renew its access token. Tokens last up to five minutes. Keep your API key
on the server.

Follow [Backend authentication](./authentication.md).

## 3. Add the viewer

Import the [hosted SDK](./overview.md#hosted-sdk), add an iframe to your page,
and connect it to your backend endpoints. No frontend package installation is
required.

Use the [Browser quickstart](./quickstart.md), or run the complete
[Sample storefront](./sample.md).

## 4. Load your products

Pass BuildCores part IDs to `editor.pc.load()`. If your catalog uses SKU, UPC,
EAN, or ASIN identifiers, follow [Catalog mapping](./catalog.md).

Already have a configurator? [Keep your controls and add the 3D view](./quickstart.md#use-your-existing-configurator).
The [SDK reference](./client-reference.md) covers editing and saving configurations.
For a full workspace with desk products, use [Setup Builder (Beta)](./setup-builder.md).

## 5. Test and launch

Check that parts load, edits work, and access renews after five minutes. Test on
your supported browsers and devices, then contact BuildCores for production
credentials.
