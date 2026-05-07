import assert from "node:assert/strict";
import {
  arePartsEqual,
  createRenderBuildJob,
  getInteractiveConfigOptions,
  renderBuild,
} from "../dist/index.esm.js";

const originalFetch = globalThis.fetch;

try {
  const baseRequest = {
    parts: {
      PCCase: ["case-a"],
      CPUCooler: ["cooler-a"],
    },
  };

  assert.equal(
    arePartsEqual(baseRequest, {
      ...baseRequest,
      interactiveConfig: {
        showSidePanel: true,
      },
    }),
    false,
    "interactiveConfig changes should trigger a new render"
  );

  assert.equal(
    arePartsEqual(
      {
        ...baseRequest,
        profile: "fast",
      },
      {
        ...baseRequest,
        profile: "cinematic",
        modelQuality: "high",
      }
    ),
    false,
    "quality changes should trigger a new render"
  );

  let capturedRenderBody = null;
  let capturedRenderUrl = null;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({
      job_id: "job-1",
      status: "processing",
    }),
  });

  globalThis.fetch = async (url, init) => {
    capturedRenderUrl = url;
    capturedRenderBody = JSON.parse(init.body);
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        job_id: "job-1",
        status: "processing",
      }),
    };
  };

  await createRenderBuildJob(
    {
      ...baseRequest,
      profile: "fast",
      frameQuality: "high",
      cameraZoom: 1.3,
      modelQuality: "medium",
      interactiveConfig: {
        caseFans: [
          {
            slotId: "case:front",
            partId: "fan-a",
            flip: true,
          },
        ],
      },
    },
    {
      environment: "prod",
      authToken: "test-token",
      apiBaseUrl: "http://127.0.0.1:3002",
    }
  );

  assert.equal(
    capturedRenderUrl,
    "http://127.0.0.1:3002/render-build?environment=prod",
    "apiBaseUrl should override the default render API origin"
  );
  assert.equal(capturedRenderBody.profile, "fast");
  assert.equal(capturedRenderBody.frameQuality, "high");
  assert.equal(capturedRenderBody.cameraZoom, 1.3);
  assert.equal(capturedRenderBody.modelQuality, "medium");
  assert.deepEqual(capturedRenderBody.interactiveConfig.caseFans[0], {
    slotId: "case:front",
    partId: "fan-a",
    flip: true,
  });

  let capturedOptionsBody = null;
  let capturedOptionsUrl = null;
  globalThis.fetch = async (url, init) => {
    capturedOptionsUrl = url;
    capturedOptionsBody = JSON.parse(init.body);
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        defaultConfig: {},
        slots: [],
        availableFans: [],
        availableCoolers: [],
        warnings: [],
      }),
    };
  };

  await getInteractiveConfigOptions(
    baseRequest.parts,
    {
      environment: "prod",
      authToken: "test-token",
      apiBaseUrl: "http://127.0.0.1:3002",
    }
  );

  assert.equal(
    capturedOptionsUrl,
    "http://127.0.0.1:3002/interactive-options?environment=prod",
    "interactive options should use apiBaseUrl"
  );
  assert.deepEqual(capturedOptionsBody, {
    parts: baseRequest.parts,
  });

  let cachedRenderCalls = [];
  globalThis.fetch = async (url, init) => {
    cachedRenderCalls.push({ url, body: init?.body ? JSON.parse(init.body) : null });
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        job_id: "cached-job",
        status: "completed",
        sprite_url: "https://static.buildcores.com/render-api/sprite_sheet/cached-job/cached-job.webp",
        cached: true,
      }),
    };
  };

  const cachedRender = await renderBuild(
    {
      ...baseRequest,
      format: "sprite",
    },
    {
      environment: "prod",
      authToken: "test-token",
      apiBaseUrl: "http://127.0.0.1:3002",
    }
  );

  assert.equal(
    cachedRender.videoUrl,
    "https://static.buildcores.com/render-api/sprite_sheet/cached-job/cached-job.webp",
    "cached completed create responses should return their URL without polling status"
  );
  assert.equal(cachedRenderCalls.length, 1, "completed create responses should not trigger a status poll");
} finally {
  globalThis.fetch = originalFetch;
}
