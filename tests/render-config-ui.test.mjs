import assert from "node:assert/strict";
import React, { useState } from "react";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://127.0.0.1/",
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { act, cleanup, fireEvent, render, screen } = await import("@testing-library/react");
const { PartCategory, RenderInteractiveConfigBuilder, RenderInteractiveConfigOverlay } = await import("../dist/index.esm.js");

function setPrefersDark(matches) {
  window.matchMedia = () => ({
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
}

const parts = {
  [PartCategory.PCCase]: ["case-a"],
  [PartCategory.CPUCooler]: ["cooler-a"],
  [PartCategory.CaseFan]: ["fan-a", "fan-a"],
};

const apiConfig = {
  environment: "prod",
  authToken: "test-token",
  apiBaseUrl: "http://127.0.0.1:3002",
};

function makeOptions() {
  return {
    defaultConfig: {
      rgb: {
        color: "#ffffff",
        rgbPattern: "wave",
        brightness: 100,
      },
      showSidePanel: true,
    },
    slots: [
      {
        slotId: "radiator:Top",
        group: "radiator",
        side: "Top",
        label: "Radiator",
        size: 360,
        supportedFanSizesMm: [120],
        radiatorSupportMm: [],
        maxRadiatorThicknessMm: 60,
        accepts: [PartCategory.CaseFan],
        availablePartIds: ["fan-a", "fan-a"],
        occupiedParts: [],
      },
      {
        slotId: "case:Front",
        group: "case",
        side: "Front",
        label: "Case Front",
        size: 280,
        supportedFanSizesMm: [120, 140],
        radiatorSupportMm: [],
        maxRadiatorThicknessMm: 60,
        accepts: [PartCategory.CaseFan],
        availablePartIds: ["fan-a", "fan-a"],
        occupiedParts: [],
      },
      {
        slotId: "case:Top",
        group: "case",
        side: "Top",
        label: "Case Top",
        size: 360,
        supportedFanSizesMm: [120, 140],
        radiatorSupportMm: [120, 240, 360],
        maxRadiatorThicknessMm: 60,
        accepts: [PartCategory.CaseFan, PartCategory.CPUCooler],
        availablePartIds: ["fan-a", "fan-a"],
        occupiedParts: [],
      },
    ],
    availableFans: [
      {
        partId: "fan-a",
        name: "LL120 RGB 120mm Fan",
        category: PartCategory.CaseFan,
        count: 2,
        image: null,
      },
    ],
    availableCoolers: [
      {
        partId: "cooler-a",
        name: "ARCTIC Liquid Freezer 360",
        category: PartCategory.CPUCooler,
        count: 1,
        image: null,
      },
    ],
    warnings: [],
  };
}

function makeDefaultFanOptions() {
  return {
    defaultConfig: {
      showSidePanel: true,
    },
    slots: [
      {
        slotId: "case:Front",
        group: "case",
        side: "Front",
        label: "Case Front",
        size: 240,
        supportedFanSizesMm: [120],
        radiatorSupportMm: [],
        maxRadiatorThicknessMm: 60,
        accepts: [PartCategory.CaseFan],
        availablePartIds: ["fan-default", "fan-default"],
        occupiedParts: [],
      },
      {
        slotId: "case:Top",
        group: "case",
        side: "Top",
        label: "Case Top",
        size: 240,
        supportedFanSizesMm: [120],
        radiatorSupportMm: [],
        maxRadiatorThicknessMm: 60,
        accepts: [PartCategory.CaseFan],
        availablePartIds: ["fan-default", "fan-default"],
        occupiedParts: [],
      },
    ],
    availableFans: [
      {
        partId: "fan-default",
        name: "Default RGB Fan",
        category: PartCategory.CaseFan,
        count: 3,
        image: null,
      },
    ],
    availableCoolers: [],
    warnings: [],
  };
}

let capturedConfig = {};
let fetchBodies = [];
let currentOptions = makeOptions;
const originalFetch = globalThis.fetch;

globalThis.fetch = async (_url, init) => {
  const body = init?.body ? JSON.parse(init.body) : {};
  fetchBodies.push(body);

  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => currentOptions(),
  };
};

function ConfigHarness({ theme = "light", requestParts = parts }) {
  const [config, setConfig] = useState({});
  capturedConfig = config;

  return React.createElement(RenderInteractiveConfigBuilder, {
    parts: requestParts,
    apiConfig,
    value: config,
    onChange: (nextConfig) => {
      capturedConfig = nextConfig;
      setConfig(nextConfig);
    },
    theme,
  });
}

async function waitForBuilderReady() {
  await waitForCondition(() => {
    assert.equal(screen.queryByText("Loading case slots..."), null);
    assert.ok(screen.queryByText("Front"));
  });
}

async function placeFanInFront() {
  await placeInventoryItem("LL120 RGB 120mm Fan", "Front");
}

async function placeInventoryItem(partName, targetName) {
  await click(screen.getByRole("button", { name: `Place ${partName}` }));
  await click(screen.getByRole("button", { name: `Place ${partName} in ${targetName}` }));
}

async function flushReact() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function waitForCondition(assertion, attempts = 30) {
  let lastError = null;

  for (let index = 0; index < attempts; index += 1) {
    await flushReact();

    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function click(element) {
  await act(async () => {
    fireEvent.click(element);
  });
}

try {
  setPrefersDark(true);
  render(React.createElement(ConfigHarness, { theme: "system" }));
  await waitForBuilderReady();

  const systemBuilder = screen.getByTestId("render-config-builder");
  assert.equal(systemBuilder.getAttribute("data-buildcores-config-theme"), "dark");
  assert.equal(systemBuilder.style.getPropertyValue("--bcrc-surface"), "#0d0e10");
  cleanup();

  setPrefersDark(false);
  render(React.createElement(ConfigHarness, { theme: "light" }));
  await waitForBuilderReady();

  const lightBuilder = screen.getByTestId("render-config-builder");
  assert.equal(lightBuilder.getAttribute("data-buildcores-config-theme"), "light");
  assert.equal(lightBuilder.style.getPropertyValue("--bcrc-surface"), "#ffffff");
  cleanup();

  fetchBodies = [];
  capturedConfig = {};
  render(React.createElement(ConfigHarness, { theme: "dark" }));
  await waitForBuilderReady();

  const darkBuilder = screen.getByTestId("render-config-builder");
  assert.equal(darkBuilder.getAttribute("data-buildcores-config-theme"), "dark");
  assert.equal(darkBuilder.style.getPropertyValue("--bcrc-surface"), "#0d0e10");
  assert.equal(screen.queryByText("120/240/360mm radiator"), null);
  await click(screen.getByRole("button", { name: "Case Top details" }));
  assert.ok(screen.getByRole("tooltip"));
  assert.ok(screen.getByText("120/240/360mm radiator"));

  const sidePanelToggle = screen.getByLabelText("Show side panel");
  assert.equal(sidePanelToggle.checked, true);
  await act(async () => {
    fireEvent.click(sidePanelToggle);
  });
  await waitForCondition(() => assert.equal(capturedConfig.showSidePanel, false));
  assert.equal(screen.getByLabelText("Show side panel").checked, false);

  await click(screen.getByRole("button", { name: "Place ARCTIC Liquid Freezer 360" }));
  await click(screen.getByRole("button", { name: "Place ARCTIC Liquid Freezer 360 in Top" }));
  await waitForCondition(() => assert.equal(capturedConfig.radiator?.slotId, "case:Top"));

  await placeFanInFront();
  await waitForCondition(() => assert.equal(capturedConfig.caseFans?.length, 1));

  await placeFanInFront();
  await waitForCondition(() => assert.equal(capturedConfig.caseFans?.length, 2));

  const flipButtons = screen.getAllByRole("button", { name: "Flip fan airflow from Intake" });
  assert.equal(flipButtons.length, 2);
  await click(flipButtons[0]);
  await waitForCondition(() => assert.equal(capturedConfig.caseFans?.[0]?.flip, true));

  assert.equal(capturedConfig.radiator?.partId, "cooler-a");
  assert.deepEqual(capturedConfig.caseFans?.map((fan) => fan.slotId), ["case:Front", "case:Front"]);
  assert.ok(screen.getByText("No unplaced items"));
  assert.equal(fetchBodies.length, 1);
  assert.deepEqual(fetchBodies[0], { parts });
  cleanup();

  currentOptions = makeDefaultFanOptions;
  capturedConfig = {};
  const defaultFanParts = {
    [PartCategory.PCCase]: ["case-a"],
  };
  render(React.createElement(ConfigHarness, { theme: "dark", requestParts: defaultFanParts }));
  await waitForBuilderReady();
  assert.ok(screen.getByText("3 available"));
  await placeInventoryItem("Default RGB Fan", "Front");
  await waitForCondition(() => assert.equal(capturedConfig.caseFans?.length, 1));
  assert.ok(screen.getByText("2 available"));
  cleanup();
  currentOptions = makeOptions;

  let appliedOverlayConfig = null;
  render(
    React.createElement(RenderInteractiveConfigOverlay, {
      parts,
      apiConfig,
      value: {
        showSidePanel: true,
      },
      onApply: (nextConfig) => {
        appliedOverlayConfig = nextConfig;
      },
      theme: "dark",
    })
  );

  await click(screen.getByTestId("render-config-gear"));
  await waitForCondition(() => assert.ok(screen.queryByTestId("render-config-panel")));
  const panel = screen.getByTestId("render-config-panel");
  assert.equal(panel.getAttribute("data-buildcores-config-theme"), "dark");
  assert.equal(panel.style.getPropertyValue("--bcrc-surface"), "#0d0e10");
  assert.equal(screen.getByTestId("render-config-builder").getAttribute("data-buildcores-config-theme"), "dark");
  await click(screen.getByRole("button", { name: "Apply" }));
  await waitForCondition(() => assert.equal(appliedOverlayConfig?.showSidePanel, true));
} finally {
  cleanup();
  globalThis.fetch = originalFetch;
  dom.window.close();
}
