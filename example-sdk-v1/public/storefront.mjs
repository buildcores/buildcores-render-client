const $ = (id) => document.getElementById(id);
export let editor;
let state;
let cooling;
let products = [];
let descriptors = [];
let sdk;
let catalogQueries = {};

function errorMessage(error) {
  let message = "The demo request could not be completed";
  if (error instanceof Error) message = error.message;
  return message
    .replace(/https?:\/\/[^\s"'<>]+/g, "[service URL]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[grant]")
    .replace(/Bearer\s+[^\s"']+/gi, "[credential]");
}

async function api(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {})
  });
  if (!response.ok) throw new Error(`Merchant backend request failed (${response.status})`);
  return response.json();
}

function activity(method, input, result) {
  const item = document.createElement("li");
  let detail = "";
  if (input) detail = ` ${JSON.stringify(input)}`;
  let outcome = "complete";
  if (typeof result?.revision === "number") {
    const status = result.mode === sdk.RenderEmbedMode.Stateless ? "updated" : "saved";
    outcome = `${status} · revision ${result.revision}`;
  }
  item.textContent = `${method}${detail} → ${outcome}`;
  $("activity").prepend(item);
  while ($("activity").children.length > 40) $("activity").lastElementChild.remove();
}

function options(id, rows, value, label, empty) {
  const select = $(id);
  const previous = select.value;
  select.replaceChildren();
  for (const row of rows) select.add(new Option(label(row), value(row)));
  if (!rows.length) select.add(new Option(empty, ""));
  if (rows.some((row) => value(row) === previous)) select.value = previous;
}

function update(next) {
  state = next;
  $("revision").textContent = `Configuration ${next.buildId.slice(-6)} · revision ${next.revision}`;
  const failed = next.saveStatus === sdk.RenderEmbedSaveStatus.FAILED;
  const stateless = next.mode === sdk.RenderEmbedMode.Stateless;
  if (stateless) $("connection").textContent = "Connected · Changes stay in this page";
  else $("connection").textContent = failed ? "Save failed — reload to recover" : "Connected · Autosave on";
  $("persistence-note").textContent = stateless
    ? "Refresh resets to your preset."
    : "Every change saves automatically.";
  options(
    "build",
    next.builds,
    (build) => build.id,
    (build) => build.name,
    "No PC in this source"
  );
  renderInstances();
  $("setup-controls").disabled = !next.setup;
  if (next.setup) {
    $("setup-note").textContent = next.setup.name;
    options(
      "entity",
      next.setup.entities,
      (entity) => entity.entityId,
      (entity) => `${entity.name}${entity.enabled ? "" : " (hidden)"}`,
      "No setup items"
    );
  }
  $("quality").value = next.renderPreferences.engine.modelSettings.quality;
  $("grid").checked = next.renderPreferences.environment.showGrid;
  $("background").checked = next.renderPreferences.environment.showBackground;
}

function selectedBuild() {
  const build = state.builds.find((entry) => entry.id === $("build").value);
  if (!build) throw new Error("Select a PC in this configuration first");
  return build;
}

function renderInstances() {
  const build = state.builds.find((entry) => entry.id === $("build").value);
  const installed = (build?.parts ?? []).filter((part) => part.category === $("part-category").value);
  options(
    "instance",
    installed,
    (part) => part.instanceId,
    (part) => part.name,
    "No installed component"
  );
}

function required(id) {
  const value = $(id).value;
  if (!value) throw new Error("Choose an available item first");
  return value;
}

async function call(method, input, run) {
  const result = await run();
  activity(method, input, result);
  if (result?.builds) update(result);
  return result;
}

async function syncLighting() {
  const available = await editor.configuration.discover();
  let descriptor = available.find(
    (entry) => entry.id === sdk.ViewerConfigurationId.SETUP_SCENE_LIGHTING && entry.editable
  );
  if (!descriptor) {
    descriptor = available.find(
      (entry) =>
        entry.id === sdk.ViewerConfigurationId.BUILD_LIGHTING || entry.id === sdk.ViewerConfigurationId.SETUP_LIGHTING
    );
  }
  const lighting = descriptor?.value.lighting;
  if (!lighting) return;
  if (typeof lighting.color === "string") $("rgb-color").value = lighting.color;
  if (typeof lighting.brightness === "number") {
    $("brightness").value = String(lighting.brightness);
    $("brightness-value").textContent = `${lighting.brightness}%`;
  }
}

async function changeView(input) {
  await call("setView", input, () => editor.setView(input));
}

async function act(run) {
  $("controls").disabled = true;
  $("tour").disabled = true;
  $("error").hidden = true;
  document.body.dataset.busy = "true";
  try {
    await run();
    await syncLighting();
  } catch (error) {
    $("error").textContent = errorMessage(error);
    $("error").hidden = false;
  } finally {
    $("controls").disabled = false;
    $("tour").disabled = false;
    document.body.dataset.busy = "false";
  }
}

function on(id, run) {
  $(id).addEventListener("click", () => void act(run));
}

async function search(kind) {
  const setup = kind === "setup";
  const category = $(setup ? "setup-category" : "part-category").value;
  const query = $(setup ? "setup-query" : "part-query").value || catalogQueries[category] || "";
  const result = await call("searchParts", { category, query }, () => editor.searchParts({ category, query }));
  if (setup) products = result.parts;
  options(
    setup ? "setup-catalog" : "catalog",
    result.parts,
    (part) => part.id,
    (part) => part.name,
    "No matching products"
  );
}

async function refreshCooling() {
  if (!state.builds.length) return;
  cooling = await editor.cooling.get({ buildId: selectedBuild().id });
  options(
    "fan",
    cooling.available,
    (fan) => fan.partId,
    (fan) => fan.name,
    "Add a case fan to inventory"
  );
  renderSlots();
  const placed = cooling.slots.flatMap((slot) => slot.placements.map((fan) => ({ slot, fan })));
  options(
    "move-slot",
    cooling.slots,
    (slot) => slot.key,
    (slot) => slot.label,
    "No authored slots"
  );
  options(
    "placement",
    placed,
    (entry) => JSON.stringify({ slotKey: entry.slot.key, index: entry.fan.index }),
    (entry) => `${entry.slot.label}: ${entry.fan.name}${entry.fan.flipped ? " (flipped)" : ""}`,
    "No placed fans"
  );
}

function renderSlots() {
  const fan = cooling?.available.find((entry) => entry.partId === $("fan").value);
  const slots = cooling?.slots.filter((slot) => fan?.slotKeys.includes(slot.key)) ?? [];
  options(
    "fan-slot",
    slots,
    (slot) => slot.key,
    (slot) => slot.label,
    "No compatible slots"
  );
}

async function changePart(action) {
  const buildId = selectedBuild().id;
  const input = { buildId };
  if (action === "add") {
    input.category = $("part-category").value;
    input.partId = required("catalog");
  } else {
    input.instanceId = required("instance");
    if (action === "replace") input.partId = required("catalog");
  }
  await call(`parts.${action}`, input, () => editor.parts[action](input));
  await refreshCooling();
}

async function changeFan(action) {
  const input = { buildId: selectedBuild().id };
  if (action === "place") {
    input.slotKey = required("fan-slot");
    input.partId = required("fan");
  } else {
    Object.assign(input, JSON.parse(required("placement")));
    if (action === "move") input.toSlotKey = required("move-slot");
  }
  await call(`cooling.${action}`, input, () => editor.cooling[action](input));
  await refreshCooling();
}

function entityTarget() {
  return { kind: sdk.ViewerTargetKind.INSTANCE, ownerId: state.setup.id, instanceId: required("entity") };
}

function selectedProduct() {
  const product = products.find((entry) => entry.id === required("setup-catalog"));
  if (!product) throw new Error("Find a setup product first");
  return { category: product.category, buildcoresId: product.buildcoresId };
}

async function discover() {
  let target;
  if (state.view.mode === sdk.ViewerViewMode.SETUP && $("entity").value) target = entityTarget();
  descriptors = await call("configuration.discover", target, () => editor.configuration.discover(target));
  descriptors = descriptors.filter((entry) => entry.editable);
  options(
    "descriptor",
    descriptors,
    (entry) => entry.id,
    (entry) => entry.label,
    "No editable controls"
  );
  showDescriptor();
}

function showDescriptor() {
  const descriptor = descriptors.find((entry) => entry.id === $("descriptor").value);
  $("configuration").value = JSON.stringify(descriptor?.value ?? {}, null, 2);
}

async function runDemo() {
  document.body.dataset.tour = "running";
  try {
    if (state.setup) await changeView({ mode: sdk.ViewerViewMode.BUILD, buildId: selectedBuild().id });
    const build = selectedBuild();
    const catalog = await call("searchParts", { category: "GPU" }, () =>
      editor.searchParts({ category: "GPU", query: catalogQueries.GPU ?? "" })
    );
    const current = build.parts.find((part) => part.category === "GPU");
    const next = catalog.parts.find((part) => part.id !== current?.partId);
    if (!next) throw new Error("This source needs an available GPU in its catalog for the tour");
    if (current) {
      const input = { buildId: build.id, instanceId: current.instanceId, partId: next.id };
      await call("parts.replace", input, () => editor.parts.replace(input));
    } else {
      const input = { buildId: build.id, category: "GPU", partId: next.id };
      await call("parts.add", input, () => editor.parts.add(input));
    }
    const fans = await call("searchParts", { category: "CaseFan" }, () =>
      editor.searchParts({ category: "CaseFan", query: catalogQueries.CaseFan ?? "" })
    );
    if (fans.parts[0]) {
      const input = { buildId: build.id, category: "CaseFan", partId: fans.parts[0].id };
      await call("parts.add", input, () => editor.parts.add(input));
    }
    await refreshCooling();
    const fan = cooling.available.find((entry) => entry.slotKeys.length);
    if (!fan) throw new Error("The tour needs a case with authored fan slots and a compatible case fan");
    const input = { buildId: build.id, slotKey: fan.slotKeys[0], partId: fan.partId };
    await call("cooling.place", input, () => editor.cooling.place(input));
    await refreshCooling();
    const placement = cooling.slots.find((slot) => slot.key === input.slotKey).placements.at(-1);
    const flip = { buildId: build.id, slotKey: input.slotKey, index: placement.index };
    await call("cooling.flip", flip, () => editor.cooling.flip(flip));
    await call("rgb.set", { color: "#8cffb5", brightness: 80 }, () =>
      editor.rgb.set({ color: "#8cffb5", brightness: 80 })
    );
    const preferences = { engine: { modelSettings: { quality: "medium" } }, environment: { showGrid: true } };
    await call("setRenderPreferences", preferences, () => editor.setRenderPreferences(preferences));
    if (state.setup) {
      await changeView({ mode: sdk.ViewerViewMode.SETUP });
      const catalog = await editor.searchParts({ category: "Keyboard", query: catalogQueries.Keyboard ?? "" });
      if (catalog.parts[0]) {
        const product = catalog.parts[0];
        const input = { category: product.category, buildcoresId: product.buildcoresId };
        const before = new Set(state.setup.entities.map((entity) => entity.entityId));
        await call("setup.addProduct", input, () => editor.setup.addProduct(input));
        const added = state.setup.entities.find((entity) => !before.has(entity.entityId));
        if (added) {
          await call("setup.setVisibility", { entityId: added.entityId, enabled: false }, () =>
            editor.setup.setVisibility({ entityId: added.entityId, enabled: false })
          );
          await call("setup.setVisibility", { entityId: added.entityId, enabled: true }, () =>
            editor.setup.setVisibility({ entityId: added.entityId, enabled: true })
          );
        }
      }
    }
    await call("resetCamera", undefined, () => editor.resetCamera());
    await refreshCooling();
    document.body.dataset.tour = "complete";
  } catch (error) {
    document.body.dataset.tour = "failed";
    throw error;
  }
}

async function start() {
  const response = await fetch("/api/config");
  if (!response.ok) throw new Error("The merchant demo configuration is unavailable");
  const config = await response.json();
  $("title").textContent = config.title;
  catalogQueries = config.catalogQueries;
  sdk = await import(`${config.viewerOrigin}/embed-assets/customer-sdk.js`);
  const admission = await api("/api/editor/open");
  const iframe = $("renderer");
  editor = sdk.connectRenderEmbedCustomer({
    iframe,
    viewerOrigin: config.viewerOrigin,
    getGrant: async () => (await api("/api/editor/renew", { editorSession: admission.editorSession })).token,
    onChange: update,
    onError: () => {
      $("error").textContent = "The editor connection failed. Reload the page to reconnect.";
      $("error").hidden = false;
    }
  });
  // Attach before navigation so the ready event cannot race the SDK listener.
  iframe.src = admission.iframeUrl;
  // getState waits for readiness with the SDK's normal command timeout.
  update(await editor.getState());
  if (config.preset) update(await editor.pc.load(config.preset));
  await search("part");
  await refreshCooling();
  await syncLighting();
  $("controls").disabled = false;
  $("tour").disabled = false;
  document.body.dataset.ready = "true";

  $("part-category").addEventListener("change", () => {
    renderInstances();
    void act(() => search("part"));
  });
  $("build").addEventListener("change", () => {
    renderInstances();
    void act(refreshCooling);
  });
  $("fan").addEventListener("change", renderSlots);
  $("descriptor").addEventListener("change", showDescriptor);
  $("brightness").addEventListener("input", () => {
    $("brightness-value").textContent = `${$("brightness").value}%`;
  });
  on("search-parts", () => search("part"));
  on("search-setup", () => search("setup"));
  for (const action of ["add", "replace", "remove"]) on(`${action}-part`, () => changePart(action));
  for (const action of ["place", "move", "flip", "remove"]) on(`${action}-fan`, () => changeFan(action));
  on("apply-rgb", () => {
    const input = { color: $("rgb-color").value, brightness: Number($("brightness").value) };
    return call("rgb.set", input, () => editor.rgb.set(input));
  });
  on("apply-render", () => {
    const input = {
      engine: { modelSettings: { quality: $("quality").value } },
      environment: { showGrid: $("grid").checked, showBackground: $("background").checked }
    };
    return call("setRenderPreferences", input, () => editor.setRenderPreferences(input));
  });
  on("reset-camera", () => call("resetCamera", undefined, () => editor.resetCamera()));
  on("view-build", () => changeView({ mode: sdk.ViewerViewMode.BUILD, buildId: selectedBuild().id }));
  on("view-setup", () => changeView({ mode: sdk.ViewerViewMode.SETUP }));
  on("add-product", () => {
    const input = selectedProduct();
    return call("setup.addProduct", input, () => editor.setup.addProduct(input));
  });
  on("replace-product", () => {
    const input = { ...selectedProduct(), entityId: required("entity") };
    return call("setup.replaceProduct", input, () => editor.setup.replaceProduct(input));
  });
  for (const action of ["copy", "remove"])
    on(`${action}-product`, () => {
      const entityId = required("entity");
      return call(`setup.${action}`, { entityId }, () => editor.setup[action](entityId));
    });
  on("toggle-product", () => {
    const entity = state.setup.entities.find((entry) => entry.entityId === required("entity"));
    const input = { entityId: entity.entityId, enabled: !entity.enabled };
    return call("setup.setVisibility", input, () => editor.setup.setVisibility(input));
  });
  on("position-product", async () => {
    const target = entityTarget();
    const available = await editor.configuration.discover(target);
    const descriptor = available.find(
      (entry) => entry.id === sdk.ViewerConfigurationId.SETUP_TRANSFORM && entry.editable
    );
    if (!descriptor) throw new Error("Select an unattached setup item in Setup view to position it");
    const positionMm = Object.fromEntries(
      ["x", "y", "z"].map((axis) => [axis, Number($("position-" + axis).value) * 1000])
    );
    const input = { target, descriptorId: descriptor.id, value: { ...descriptor.value, positionMm } };
    await call("configuration.edit", input, () => editor.configuration.edit(input));
  });
  on("discover", discover);
  on("apply-configuration", () => {
    const descriptor = descriptors.find((entry) => entry.id === required("descriptor"));
    const input = {
      target: descriptor.target,
      descriptorId: descriptor.id,
      value: JSON.parse($("configuration").value)
    };
    return call("configuration.edit", input, () => editor.configuration.edit(input));
  });
  on("tour", runDemo);
  window.addEventListener("pagehide", () => editor.dispose());
}

void start().catch((error) => {
  $("connection").textContent = "Demo unavailable";
  $("error").textContent =
    `${errorMessage(error)}. Check the server configuration, registered origin and Render API deployment, then reload.`;
  $("error").hidden = false;
});
