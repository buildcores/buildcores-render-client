import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRetailerServer, provisionRetailer } from "./merchant.mjs";

try {
  const config = JSON.parse(await readFile(resolve(process.argv[2] ?? "config.json"), "utf8"));
  const apiKey = process.env.RENDER_API_KEY;
  const keyId = process.env.RENDER_API_KEY_ID;
  if (!apiKey || !keyId) throw new Error("Set RENDER_API_KEY and RENDER_API_KEY_ID on the merchant server");
  const embed = await provisionRetailer({ config, apiKey });
  const server = createRetailerServer({ config, embed, apiKey, keyId });
  const address = new URL(config.merchantOrigin);
  const port = Number(address.port || 80);
  server.listen(port, "127.0.0.1", () => {
    process.stdout.write(`NOVA PC demo ready at ${address.origin}\n`);
  });
} catch {
  process.stderr.write(
    "Could not start the demo. Check config.json, server credentials, source ownership, and Render API availability.\n"
  );
  process.exitCode = 1;
}
