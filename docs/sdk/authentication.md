---
title: Backend authentication
description: Register a viewer and issue short-lived access tokens from your backend.
---

# Backend authentication

Your backend keeps the API key private and issues short-lived access tokens,
called **grants**, for each viewer. Use
**https://www.renderapi.buildcores.com** as the API base URL.

The [Sample storefront](./sample.md) includes a complete Node backend for this flow.

## 1. Register an embed

An embed identifies your viewer and the websites allowed to display it. Call
this endpoint from your backend with your staging API key:

```http
POST /embeds?environment=staging
Authorization: Bearer <STAGING_API_KEY>
Content-Type: application/json
```

```json
{
  "label": "PC configurator",
  "target": { "kind": "pc" },
  "allowedOrigins": ["https://your-store.example"]
}
```

Replace the example origin with your website's scheme, hostname, and port if
needed. Paths and wildcards are not accepted.

Store the returned registration as `embed`, including `embedId`, `customerId`,
`environment`, `target`, `targetId`, and `revision`. The signing helper below
uses these fields. Production registrations use `?environment=prod` and a
production key.

`GET /embeds?environment=staging` lists registrations.
`PATCH /embeds/:embedId?environment=staging` updates the label, allowed origins,
or `enabled` flag. Use the matching API key on both requests. Omitting
`environment` defaults to `prod`. An update changes the revision; open fresh
viewer sessions afterward. Register a new embed to change its source.

## 2. Create a viewer session

Your backend issues viewer access tokens for visitors, including guests.
No shopper login is required. For guests, use a cookie-backed session to
recognize the same visitor when issuing and renewing tokens.

Implement `POST /api/buildcores/editor/open` in your application:

1. Identify the visitor through a guest or signed-in session and check their access.
2. Create a session record with a fresh `crypto.randomUUID()` as `sessionId`,
   the embed ID/revision, and `access: "configure"`. Associate it with the visitor session.
3. Sign a token and return `{ iframeUrl, editorSession }`. `editorSession` is your
   opaque handle for that server-side record.

Each iframe opening needs its own session record, including separate tabs. Keep
all identity and access values server-controlled.

### Sign the token

This Node.js example uses `jsonwebtoken`. Other backends can sign the same
HS256 JWT claims. Pass the stored registration, key, and session record to this helper. `key.id` and `key.customerId` are the key ID and
customer ID supplied by BuildCores; `key.value` is the private API key.

Tokens use HS256 and expire after five minutes. Initial tokens use
`embed_bootstrap`; renewals use `embed_edit`.

```js
import jwt from "jsonwebtoken";

export function signEditorGrant(embed, key, admission, renewal = false) {
  if (key.customerId !== embed.customerId || key.environment !== embed.environment) {
    throw new Error("Key and embed must share a customer and environment");
  }
  if (admission.embedId !== embed.embedId || admission.embedRevision !== embed.revision) {
    throw new Error("Open a fresh session for the current embed registration");
  }
  if (admission.access !== "configure" && admission.access !== "edit") {
    throw new Error("An editing access mode is required");
  }
  if (admission.access === "configure" && embed.target.kind !== "pc") {
    throw new Error("Stateless configuration requires a PC registration");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const claims = {
    iss: "buildcores-customer-embed",
    aud: "buildcores-render-embed",
    typ: "embed_bootstrap",
    sub: embed.customerId,
    environment: embed.environment,
    embedId: embed.embedId,
    embedRevision: admission.embedRevision,
    targetId: embed.targetId,
    access: admission.access,
    jti: admission.sessionId,
    iat: issuedAt,
    exp: issuedAt + 300
  };

  if (renewal) claims.typ = "embed_edit";
  if (admission.access === "edit") {
    if (!admission.externalBuildId) throw new Error("Saved configuration identity is required");
    claims.externalBuildId = admission.externalBuildId;
  } else if (admission.externalBuildId !== undefined) {
    throw new Error("Stateless grants must omit externalBuildId");
  }

  return jwt.sign(claims, key.value, {
    algorithm: "HS256",
    header: { kid: key.id, typ: "JWT" }
  });
}
```

Build the initial iframe URL:

```js
const token = signEditorGrant(embed, key, admission);
const iframeUrl = new URL(`/embed/${embed.embedId}`, "https://www.renderapi.buildcores.com");
iframeUrl.hash = `token=${encodeURIComponent(token)}`;
// Return { iframeUrl: iframeUrl.href, editorSession: admissionHandle }.
```

The token goes in the URL fragment. Return `Cache-Control: no-store`; never log
the token or full iframe URL. Your API key stays on the server.

## 3. Renew access

Implement `POST /api/buildcores/editor/renew`. It accepts `{ editorSession }`:

1. Verify that the caller's guest or signed-in session owns the stored viewer session.
2. Recheck access and the embed revision.
3. Call `signEditorGrant(embed, key, admission, true)` and return `{ token }`
   with `Cache-Control: no-store`.

Keep the session ID, customer, environment, embed/revision, target, access, and
saved configuration identity unchanged. Renew only the token's times and purpose.
If the embed revision changed, require a new opening.

Use your normal session, CSRF, and rate-limit protection on both endpoints.
The browser SDK's `getGrant()` callback calls your renewal endpoint using the
handle from open. Do not issue tokens from iframe messages or `onReady` IDs.

## Saved configurations

For server autosave, use an authorized Build or Setup registration and
`access: "edit"`. Add an `externalBuildId` that your backend associates with the
shopper's saved configuration. Reuse that value to reopen it; create a new
`sessionId` for each opening.

See [Saved configurations](./client-reference.md#saved-configurations) for
registration targets and browser behavior.
