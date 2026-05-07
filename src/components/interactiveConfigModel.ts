import {
  PartCategory,
  RenderBuildRequest,
  RenderInteractiveConfig,
  RenderInteractiveConfigOptions,
  RenderInteractiveFanPlacement,
  RenderInteractivePartSummary,
  RenderInteractiveSlotOption,
} from "../types";

export type PlacementKind = "caseFan" | "radiatorFan";

export type InventoryPlacementTarget = {
  label: string;
  slotId: string;
  kind: PlacementKind | "radiator";
};

export type IndexedFanPlacement = {
  placement: RenderInteractiveFanPlacement;
  placementIndex: number;
};

export function getPartName(
  parts: RenderInteractivePartSummary[],
  partId: string,
  fallback = "Selected part"
): string {
  return parts.find((part) => part.partId === partId)?.name ?? fallback;
}

export function summarizePartsByCategory(
  options: RenderInteractiveConfigOptions | null,
  category: PartCategory
): RenderInteractivePartSummary[] {
  const summaries = new Map<string, RenderInteractivePartSummary>();
  const addPart = (part: RenderInteractivePartSummary) => {
    if (part.category !== category || summaries.has(part.partId)) {
      return;
    }

    summaries.set(part.partId, part);
  };

  for (const part of category === PartCategory.CaseFan ? (options?.availableFans ?? []) : (options?.availableCoolers ?? [])) {
    addPart(part);
  }

  for (const slot of options?.slots ?? []) {
    for (const part of slot.occupiedParts) {
      addPart(part);
    }
  }

  return Array.from(summaries.values());
}

export function getRemainingFanOptions(
  options: RenderInteractiveConfigOptions | null,
  config: RenderInteractiveConfig,
  parts: RenderBuildRequest["parts"]
): RenderInteractivePartSummary[] {
  return (options?.availableFans ?? []).flatMap((fan) => {
    const selectedQuantity = getPartQuantity(parts, PartCategory.CaseFan, fan.partId);
    const placedQuantity = getPlacedFanQuantity(config, fan.partId);
    const totalCapacity = getSlotFanCapacity(options?.slots ?? [], fan.partId);
    const sourceQuantity = selectedQuantity || (fan.count ?? 1);
    const totalPlaceableQuantity = Math.min(sourceQuantity, totalCapacity);
    const remainingQuantity = Math.max(0, totalPlaceableQuantity - placedQuantity);

    return remainingQuantity > 0 ? [{ ...fan, count: remainingQuantity }] : [];
  });
}

export function getRemainingCoolerOptions(
  options: RenderInteractiveConfigOptions | null,
  config: RenderInteractiveConfig
): RenderInteractivePartSummary[] {
  const placedCoolerId = config.radiator?.slotId ? config.radiator.partId : undefined;
  return (options?.availableCoolers ?? []).filter((cooler) => cooler.partId !== placedCoolerId);
}

export function getFanPlacementTargets(
  partId: string,
  caseFanSlots: RenderInteractiveSlotOption[],
  radiatorSlots: RenderInteractiveSlotOption[]
): InventoryPlacementTarget[] {
  return [
    ...caseFanSlots.map((slot) => ({ slot, kind: "caseFan" as const })),
    ...radiatorSlots.map((slot) => ({ slot, kind: "radiatorFan" as const })),
  ]
    .filter(({ slot }) => slot.availablePartIds.includes(partId))
    .map(({ slot, kind }) => ({
      label: kind === "radiatorFan" ? "Radiator" : getSlotName(slot),
      slotId: slot.slotId,
      kind,
    }));
}

export function getRadiatorPlacementTargets(
  slots: RenderInteractiveSlotOption[],
  isRadiatorPlaced: boolean
): InventoryPlacementTarget[] {
  if (isRadiatorPlaced) {
    return [];
  }

  return slots
    .filter((slot) => slot.accepts.includes(PartCategory.CPUCooler))
    .map((slot) => ({
      label: getSlotName(slot),
      slotId: slot.slotId,
      kind: "radiator" as const,
    }));
}

export function getSlotName(slot: RenderInteractiveSlotOption): string {
  return slot.label.replace(/^Case\s+/i, "");
}

export function getSlotSizeLabel(slot: RenderInteractiveSlotOption): string {
  const largestFanSize = slot.supportedFanSizesMm.length ? Math.max(...slot.supportedFanSizesMm) : null;
  return largestFanSize ? `${slot.size}mm x ${largestFanSize}mm` : `${slot.size}mm`;
}

export function getRadiatorSupportLabel(slot: RenderInteractiveSlotOption): string | null {
  if (!slot.radiatorSupportMm.length) {
    return null;
  }

  return `${slot.radiatorSupportMm.join("/")}mm radiator`;
}

export function getFanSupportLabel(slot: RenderInteractiveSlotOption): string {
  return slot.supportedFanSizesMm.length ? `${slot.supportedFanSizesMm.join("/")}mm fans` : "No fan sizes listed";
}

export function isRadiatorPlacedInSlot(config: RenderInteractiveConfig, slotId: string): boolean {
  return config.radiator?.slotId === slotId;
}

export function getPlacementsForSlot(
  config: RenderInteractiveConfig,
  slotId: string,
  kind: PlacementKind
): IndexedFanPlacement[] {
  const placements = kind === "caseFan" ? config.caseFans : config.radiator?.fans;
  return (placements ?? [])
    .map((placement, placementIndex) => ({ placement, placementIndex }))
    .filter(({ placement }) => placement.slotId === slotId);
}

export function updatePlacementAtIndex(
  placements: RenderInteractiveFanPlacement[] | undefined,
  placementIndex: number,
  update: Partial<RenderInteractiveFanPlacement>
): RenderInteractiveFanPlacement[] {
  return (placements ?? []).map((placement, currentIndex) =>
    currentIndex === placementIndex ? { ...placement, ...update } : placement
  );
}

export function removePlacementAtIndex(
  placements: RenderInteractiveFanPlacement[] | undefined,
  placementIndex: number
): RenderInteractiveFanPlacement[] {
  return (placements ?? []).filter((_placement, currentIndex) => currentIndex !== placementIndex);
}

function getPartQuantity(parts: RenderBuildRequest["parts"], category: PartCategory, partId: string): number {
  return (parts[category] ?? []).filter((id) => id === partId).length;
}

function getPlacedFanQuantity(config: RenderInteractiveConfig, partId: string): number {
  return [...(config.caseFans ?? []), ...(config.radiator?.fans ?? [])]
    .filter((placement) => placement.partId === partId)
    .reduce((total, placement) => total + (placement.quantity ?? 1), 0);
}

function getSlotFanCapacity(slots: RenderInteractiveSlotOption[], partId: string): number {
  return slots.reduce((sum, slot) => sum + slot.availablePartIds.filter((id) => id === partId).length, 0);
}
