import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PUBLIC = new URL("./public/", import.meta.url);
const VISITOR_COOKIE = "nova_demo_visitor";
const DAY = 24 * 60 * 60 * 1000;
const STATIC_FILES = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/storefront.mjs", ["storefront.mjs", "text/javascript; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]]
]);

export function exactOrigin(value) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.origin !== value) {
    throw new Error("Configure an exact HTTP(S) origin without a trailing slash");
  }
  return url.origin;
}

/** This is merchant-server code. The private Render API credential never reaches the storefront. */
export async function provisionRetailer({ config, apiKey, fetchApi = fetch }) {
  const origin = exactOrigin(config.renderApiOrigin);
  const merchantOrigin = exactOrigin(config.merchantOrigin);
  if (!["staging", "prod"].includes(config.environment) || !apiKey) {
    throw new Error("A Render API key and staging or prod environment are required");
  }
  async function manage(path, method = "GET", data) {
    const response = await fetchApi(`${origin}${path}?environment=${config.environment}`, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Demo provisioning failed (${response.status})`);
    return response.json();
  }
  // hideUi is customer-wide. Use a dedicated demo customer, not a production merchant account.
  await manage("/embed-config", "PATCH", { embed: { hideUi: true } });
  const registrations = await manage("/embeds");
  const existing = registrations.find(
    (entry) =>
      entry.label === config.label &&
      entry.target.kind === config.source.kind &&
      entry.target.shareCode === config.source.shareCode
  );
  const values = { label: config.label, allowedOrigins: [merchantOrigin] };
  if (existing) return manage(`/embeds/${existing.embedId}`, "PATCH", { ...values, enabled: true });
  return manage("/embeds", "POST", { ...values, target: config.source });
}

function signGrant({ embed, apiKey, keyId, admission, renewal }) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "buildcores-customer-embed",
    aud: "buildcores-render-embed",
    typ: renewal ? "embed_edit" : "embed_bootstrap",
    sub: embed.customerId,
    environment: embed.environment,
    embedId: embed.embedId,
    embedRevision: embed.revision,
    targetId: embed.targetId,
    access: admission.stateless ? "configure" : "edit",
    externalBuildId: admission.externalBuildId,
    jti: admission.sessionId,
    iat: now,
    exp: now + 300
  };
  const unsigned = [{ alg: "HS256", typ: "JWT", kid: keyId }, payload]
    .map((value) => Buffer.from(JSON.stringify(value)).toString("base64url"))
    .join(".");
  return `${unsigned}.${createHmac("sha256", apiKey).update(unsigned).digest("base64url")}`;
}

async function readJson(request) {
  let data = "";
  for await (const chunk of request) {
    data += chunk;
    if (Buffer.byteLength(data) > 4096) throw new Error("Request is too large");
  }
  return JSON.parse(data || "{}");
}

/** A runnable anonymous demo session. Real merchants should bind this to their authenticated cart/customer. */
export function createRetailerServer({ config, embed, apiKey, keyId, sessionSecret = randomBytes(32) }) {
  const viewerOrigin = exactOrigin(config.renderApiOrigin);
  const merchantOrigin = exactOrigin(config.merchantOrigin);
  if (!apiKey || !keyId || embed.environment !== config.environment) {
    throw new Error("Matching server-side credentials and a provisioned embed are required");
  }
  const admissions = new Map();
  const cookieSignature = (id) => createHmac("sha256", sessionSecret).update(id).digest("base64url");
  function visitor(request, response) {
    const cookie = request.headers.cookie?.split("; ").find((part) => part.startsWith(`${VISITOR_COOKIE}=`));
    const [id, signature] = (cookie?.slice(VISITOR_COOKIE.length + 1) ?? "").split(".");
    if (id && signature) {
      const expected = Buffer.from(cookieSignature(id));
      const supplied = Buffer.from(signature);
      if (expected.length === supplied.length && timingSafeEqual(expected, supplied)) return id;
    }
    const next = randomUUID();
    let attributes = "; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400";
    if (merchantOrigin.startsWith("https:")) attributes += "; Secure";
    response.setHeader("Set-Cookie", `${VISITOR_COOKIE}=${next}.${cookieSignature(next)}${attributes}`);
    return next;
  }
  function json(response, status, value) {
    response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(value));
  }
  return createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    // The iframe origin check needs the merchant origin as its referrer.
    response.setHeader("Referrer-Policy", "strict-origin");
    response.setHeader(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'self' ${viewerOrigin}; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src ${viewerOrigin}; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`
    );
    void (async () => {
      const path = new URL(request.url ?? "/", merchantOrigin).pathname;
      const asset = STATIC_FILES.get(path);
      if (request.method === "GET" && asset) {
        response.writeHead(200, { "Content-Type": asset[1] });
        response.end(await readFile(new URL(asset[0], PUBLIC)));
        return;
      }
      if (request.method === "GET" && path === "/api/config") {
        json(response, 200, {
          viewerOrigin,
          brand: "BuildCores",
          title: config.title ?? "3D PC Builder Sample",
          catalogQueries: config.catalogQueries ?? {},
          preset: config.preset
        });
        return;
      }
      if (request.method !== "POST" || !["/api/editor/open", "/api/editor/renew"].includes(path)) {
        json(response, 404, { error: "Not found" });
        return;
      }
      if (request.headers.origin !== merchantOrigin) {
        json(response, 403, { error: "Use the configured merchant origin" });
        return;
      }
      const body = await readJson(request);
      const visitorId = visitor(request, response);
      const now = Date.now();
      for (const [id, entry] of admissions) if (now - entry.createdAt > DAY) admissions.delete(id);
      if (path === "/api/editor/open") {
        const editorSession = randomUUID();
        const stateless = config.source.kind === "pc";
        const admission = {
          visitorId,
          stateless,
          externalBuildId: stateless ? undefined : `nova:${visitorId}`,
          sessionId: randomUUID(),
          createdAt: now
        };
        admissions.set(editorSession, admission);
        const token = signGrant({ embed, apiKey, keyId, admission, renewal: false });
        json(response, 200, {
          editorSession,
          iframeUrl: `${viewerOrigin}/embed/${embed.embedId}#token=${encodeURIComponent(token)}`
        });
        return;
      }
      // The browser supplies only an opaque handle, never the JWT identity or externalBuildId.
      const admission = admissions.get(body.editorSession);
      if (!admission || admission.visitorId !== visitorId) {
        json(response, 401, { error: "Reopen the page to start an editor session" });
        return;
      }
      json(response, 200, { token: signGrant({ embed, apiKey, keyId, admission, renewal: true }) });
    })().catch(() => {
      // Do not log exceptions: upstream requests can contain private API credentials.
      if (!response.headersSent) json(response, 400, { error: "The demo request could not be completed" });
      else response.end();
    });
  });
}
