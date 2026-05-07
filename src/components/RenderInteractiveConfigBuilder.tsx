import React, { useMemo, useState } from "react";
import { ChevronDown, Cpu, Fan, HelpCircle, RotateCw, Ruler, X } from "lucide-react";
import { useInteractiveConfigOptions } from "../hooks/useInteractiveConfigOptions";
import {
  ApiConfig,
  PartCategory,
  RenderBuildRequest,
  RenderInteractiveConfig,
  RenderInteractiveFanPlacement,
  RenderInteractiveConfigTheme,
  RenderInteractivePartSummary,
  RenderInteractiveSlotOption,
} from "../types";
import {
  getInteractiveConfigThemeVariables,
  useResolvedInteractiveConfigTheme,
} from "./interactiveConfigTheme";
import {
  getFanPlacementTargets,
  getFanSupportLabel,
  getPartName,
  getPlacementsForSlot,
  getRadiatorPlacementTargets,
  getRadiatorSupportLabel,
  getRemainingCoolerOptions,
  getRemainingFanOptions,
  getSlotName,
  getSlotSizeLabel,
  InventoryPlacementTarget,
  isRadiatorPlacedInSlot,
  PlacementKind,
  removePlacementAtIndex,
  summarizePartsByCategory,
  updatePlacementAtIndex,
} from "./interactiveConfigModel";

export interface RenderInteractiveConfigBuilderProps {
  parts: RenderBuildRequest["parts"];
  apiConfig: ApiConfig;
  value?: RenderInteractiveConfig;
  onChange: (config: RenderInteractiveConfig) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  theme?: RenderInteractiveConfigTheme;
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    border: "1px solid var(--bcrc-border)",
    borderRadius: 8,
    padding: 14,
    background: "var(--bcrc-surface)",
    color: "var(--bcrc-text)",
    display: "grid",
    gap: 18,
    fontSize: 14,
  },
  section: {
    display: "grid",
    gap: 8,
  },
  sectionTitle: {
    color: "var(--bcrc-section-title)",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0,
    margin: 0,
  },
  inventoryGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 8,
  },
  inventoryItem: {
    minWidth: 0,
    border: "1px solid var(--bcrc-border-soft)",
    borderRadius: 6,
    background: "var(--bcrc-surface-muted)",
    padding: 8,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 8,
    alignItems: "center",
    minHeight: 56,
  },
  inventoryButton: {
    gridColumn: "1 / -1",
    width: "100%",
    border: "0",
    background: "transparent",
    color: "inherit",
    padding: 0,
    display: "grid",
    gridTemplateColumns: "38px minmax(0, 1fr) auto",
    gap: 8,
    alignItems: "center",
    textAlign: "left",
    cursor: "pointer",
  },
  placementMenu: {
    gridColumn: "1 / -1",
    borderTop: "1px solid var(--bcrc-border-soft)",
    paddingTop: 8,
    marginTop: 2,
    display: "grid",
    gap: 6,
  },
  placementMenuTitle: {
    color: "var(--bcrc-text-muted)",
    fontSize: 12,
  },
  placementGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  placementButton: {
    border: "1px solid var(--bcrc-accent-border)",
    borderRadius: 4,
    background: "var(--bcrc-accent-bg)",
    color: "var(--bcrc-accent-text)",
    cursor: "pointer",
    fontSize: 12,
    lineHeight: "18px",
    padding: "3px 8px",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 6,
    background: "var(--bcrc-icon-bg)",
    border: "1px solid var(--bcrc-border-soft)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    color: "var(--bcrc-icon-text)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  itemText: {
    minWidth: 0,
    display: "grid",
    gap: 2,
  },
  itemName: {
    overflow: "hidden",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    lineHeight: "17px",
    overflowWrap: "anywhere",
    whiteSpace: "normal",
    fontSize: 13,
    fontWeight: 650,
  },
  muted: {
    color: "var(--bcrc-text-muted)",
    fontSize: 12,
  },
  warning: {
    color: "var(--bcrc-warning-text)",
    background: "var(--bcrc-warning-bg)",
    border: "1px solid var(--bcrc-warning-border)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12,
  },
  empty: {
    border: "1px solid var(--bcrc-border-soft)",
    borderRadius: 6,
    color: "var(--bcrc-text-muted)",
    background: "var(--bcrc-surface-muted)",
    padding: "18px 12px",
    fontSize: 13,
    textAlign: "center",
  },
  loadingState: {
    border: "1px solid var(--bcrc-border-soft)",
    borderRadius: 6,
    background: "var(--bcrc-surface-muted)",
    padding: "18px 12px",
    display: "grid",
    gap: 6,
    justifyItems: "center",
    textAlign: "center",
  },
  loadingTitle: {
    color: "var(--bcrc-text)",
    fontSize: 14,
    fontWeight: 650,
  },
  slotList: {
    display: "grid",
    gap: 8,
  },
  slotCard: {
    border: "1px solid var(--bcrc-border-soft)",
    borderRadius: 7,
    background: "var(--bcrc-surface-raised)",
    padding: 10,
    display: "grid",
    gap: 8,
  },
  slotHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  slotTitleGroup: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: "1 1 180px",
  },
  slotIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    background: "transparent",
    border: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--bcrc-icon-text)",
    flexShrink: 0,
  },
  slotTitleText: {
    minWidth: 0,
    display: "grid",
    gap: 2,
  },
  slotTitle: {
    overflow: "hidden",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
    fontSize: 15,
    fontWeight: 700,
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
    justifyContent: "flex-end",
    alignItems: "center",
    flex: "0 1 auto",
  },
  chip: {
    border: "1px solid var(--bcrc-border-soft)",
    borderRadius: 4,
    background: "var(--bcrc-chip-bg)",
    color: "var(--bcrc-icon-text)",
    padding: "2px 7px",
    fontSize: 12,
    lineHeight: "16px",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  },
  chipAccent: {
    borderColor: "var(--bcrc-accent-border)",
    background: "var(--bcrc-accent-bg)",
    color: "var(--bcrc-accent-text)",
  },
  chipGreen: {
    borderColor: "var(--bcrc-success-border)",
    background: "var(--bcrc-success-bg)",
    color: "var(--bcrc-success-text)",
  },
  partList: {
    display: "grid",
    gap: 6,
  },
  partRow: {
    border: "1px solid var(--bcrc-border-soft)",
    borderRadius: 6,
    background: "var(--bcrc-surface)",
    padding: "6px 8px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 8,
    alignItems: "center",
    minHeight: 48,
  },
  partMain: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  partDetails: {
    minWidth: 0,
    display: "grid",
    gap: 2,
  },
  partActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-end",
  },
  select: {
    width: "100%",
    minWidth: 0,
    padding: "8px 10px",
    border: "1px solid var(--bcrc-border-strong)",
    borderRadius: 6,
    background: "var(--bcrc-input)",
    color: "var(--bcrc-text)",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.52,
    cursor: "not-allowed",
  },
  toggleRow: {
    border: "0",
    borderRadius: 6,
    background: "var(--bcrc-surface-muted)",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    minHeight: 52,
    fontSize: 15,
  },
  switchLabel: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 24,
    flexShrink: 0,
  },
  switchInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    cursor: "pointer",
    margin: 0,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 999,
    border: "1px solid var(--bcrc-border-strong)",
    background: "var(--bcrc-switch-off)",
    display: "block",
    transition: "background 140ms ease, border-color 140ms ease",
  },
  switchKnob: {
    position: "absolute",
    left: 3,
    top: 3,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.24)",
    transition: "transform 140ms ease",
    pointerEvents: "none",
  },
  airflowPill: {
    border: "0",
    borderRadius: 4,
    background: "var(--bcrc-airflow-intake-bg)",
    color: "var(--bcrc-airflow-intake-text)",
    cursor: "pointer",
    fontSize: 12,
    lineHeight: "18px",
    padding: "2px 7px",
    whiteSpace: "nowrap",
  },
  airflowPillExhaust: {
    background: "var(--bcrc-airflow-exhaust-bg)",
    color: "var(--bcrc-airflow-exhaust-text)",
  },
  iconOnlyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    padding: 0,
    border: "1px solid var(--bcrc-border-soft)",
    background: "var(--bcrc-surface-muted)",
    color: "var(--bcrc-text-muted)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  detailsButton: {
    width: 20,
    height: 20,
    border: "1px solid var(--bcrc-border-soft)",
    borderRadius: "50%",
    background: "var(--bcrc-chip-bg)",
    color: "var(--bcrc-text-muted)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  detailsPopover: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    zIndex: 3,
    width: 220,
    border: "1px solid var(--bcrc-border-soft)",
    borderRadius: 6,
    background: "var(--bcrc-surface)",
    color: "var(--bcrc-text)",
    boxShadow: "var(--bcrc-popover-shadow)",
    padding: 10,
    display: "grid",
    gap: 6,
    fontSize: 12,
    lineHeight: "16px",
    textAlign: "left",
  },
  detailsLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
  },
  lightingRow: {
    display: "grid",
    gridTemplateColumns: "44px minmax(0, 1fr)",
    gap: 8,
    alignItems: "center",
  },
  range: {
    width: "100%",
    minWidth: 0,
  },
};

function getButtonStyle(style: React.CSSProperties, isDisabled: boolean): React.CSSProperties {
  return isDisabled ? { ...style, ...styles.disabledButton } : style;
}

function PartAvatar({
  part,
  icon,
}: {
  part?: RenderInteractivePartSummary;
  icon: React.ReactNode;
}) {
  return (
    <span style={styles.avatar}>
      {part?.image ? <img src={part.image} alt="" style={styles.image} /> : icon}
    </span>
  );
}

function InventoryItem({
  part,
  icon,
  placements,
  disabled,
  onPlace,
}: {
  part: RenderInteractivePartSummary;
  icon: React.ReactNode;
  placements: InventoryPlacementTarget[];
  disabled: boolean;
  onPlace: (partId: string, target: InventoryPlacementTarget) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const canPlace = !disabled && placements.length > 0;

  return (
    <div style={styles.inventoryItem}>
      <button
        type="button"
        disabled={!canPlace}
        onClick={() => setIsOpen((current) => !current)}
        style={{ ...styles.inventoryButton, opacity: canPlace ? 1 : 0.62, cursor: canPlace ? "pointer" : "not-allowed" }}
        aria-expanded={isOpen}
        aria-label={`Place ${part.name}`}
      >
        <PartAvatar part={part} icon={icon} />
        <div style={styles.itemText}>
          <span style={styles.itemName} title={part.name}>
            {part.name}
          </span>
          <span style={styles.muted}>{part.count && part.count > 1 ? `${part.count} available` : "Available"}</span>
        </div>
        <ChevronDown
          size={15}
          aria-hidden="true"
          style={{
            color: "var(--bcrc-text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 140ms ease",
          }}
        />
      </button>
      {isOpen && canPlace ? (
        <div style={styles.placementMenu}>
          <span style={styles.placementMenuTitle}>Place in</span>
          <div style={styles.placementGrid}>
            {placements.map((target) => (
              <button
                key={`${part.partId}-${target.kind}-${target.slotId}`}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onPlace(part.partId, target);
                  setIsOpen(false);
                }}
                style={getButtonStyle(styles.placementButton, disabled)}
                aria-label={`Place ${part.name} in ${target.label}`}
              >
                {target.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SidePanelSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label style={{ ...styles.switchLabel, opacity: disabled ? 0.62 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label="Show side panel"
        onChange={(event) => onChange(event.target.checked)}
        style={{ ...styles.switchInput, cursor: disabled ? "not-allowed" : "pointer" }}
      />
      <span
        aria-hidden="true"
        style={{
          ...styles.switchTrack,
          background: checked ? "var(--bcrc-primary)" : "var(--bcrc-switch-off)",
          borderColor: checked ? "var(--bcrc-primary-border)" : "var(--bcrc-border-strong)",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          ...styles.switchKnob,
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={styles.section}>
      <h4 style={styles.sectionTitle}>{title}</h4>
      {children}
    </section>
  );
}

function SlotDetailsControl({ slot }: { slot: RenderInteractiveSlotOption }) {
  const [isOpen, setIsOpen] = useState(false);
  const radiatorSupport = getRadiatorSupportLabel(slot);

  return (
    <span
      style={styles.detailsWrap}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        style={styles.detailsButton}
        aria-label={`${slot.label} details`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <HelpCircle size={14} aria-hidden="true" />
      </button>
      {isOpen ? (
        <span role="tooltip" style={styles.detailsPopover}>
          <span style={styles.detailsLine}>
            <span style={styles.muted}>Slot</span>
            <strong>{getSlotSizeLabel(slot)}</strong>
          </span>
          <span style={styles.detailsLine}>
            <span style={styles.muted}>Fans</span>
            <strong>{getFanSupportLabel(slot)}</strong>
          </span>
          <span style={styles.detailsLine}>
            <span style={styles.muted}>Radiator</span>
            <strong>{radiatorSupport ?? "Not supported"}</strong>
          </span>
        </span>
      ) : null}
    </span>
  );
}

function renderSlotChips(slot: RenderInteractiveSlotOption, extraChip?: React.ReactNode): React.ReactNode {
  return (
    <div style={styles.chipRow}>
      <span style={styles.chip}>
        <Ruler size={11} aria-hidden="true" /> {getSlotSizeLabel(slot)}
      </span>
      {extraChip}
      <SlotDetailsControl slot={slot} />
    </div>
  );
}

export const RenderInteractiveConfigBuilder: React.FC<RenderInteractiveConfigBuilderProps> = ({
  parts,
  apiConfig,
  value,
  onChange,
  disabled = false,
  className,
  style,
  theme = "system",
}) => {
  const config = value ?? {};
  const resolvedTheme = useResolvedInteractiveConfigTheme(theme);
  const { options, isLoading, error } = useInteractiveConfigOptions(parts, apiConfig);

  const caseSlots = useMemo(
    () => (options?.slots ?? []).filter((slot) => slot.group === "case"),
    [options]
  );
  const caseFanSlots = useMemo(
    () => caseSlots.filter((slot) => slot.accepts.includes(PartCategory.CaseFan)),
    [caseSlots]
  );
  const radiatorMountSlots = useMemo(
    () => caseSlots.filter((slot) => slot.accepts.includes(PartCategory.CPUCooler)),
    [caseSlots]
  );
  const radiatorSlots = useMemo(
    () => (options?.slots ?? []).filter((slot) => slot.group === "radiator"),
    [options]
  );
  const fanOptions = useMemo(() => getRemainingFanOptions(options, config, parts), [options, config, parts]);
  const coolerOptions = useMemo(() => getRemainingCoolerOptions(options, config), [options, config]);
  const radiatorPlacementTargets = useMemo(
    () => getRadiatorPlacementTargets(radiatorMountSlots, !!config.radiator?.slotId),
    [radiatorMountSlots, config.radiator?.slotId]
  );
  const knownFanOptions = useMemo(() => summarizePartsByCategory(options, PartCategory.CaseFan), [options]);
  const knownCoolerOptions = useMemo(() => summarizePartsByCategory(options, PartCategory.CPUCooler), [options]);
  const rgbConfig = config.rgb ?? options?.defaultConfig.rgb ?? {};
  const showSidePanel = config.showSidePanel ?? true;
  const hasInventory = fanOptions.length > 0 || coolerOptions.length > 0;
  const isInitialLoading = !options && !error;
  const isRefreshing = isLoading && !!options;

  const emit = (nextConfig: RenderInteractiveConfig) => {
    onChange(nextConfig);
  };

  const addFanToSlot = (partId: string, slotId: string, kind: PlacementKind) => {
    if (kind === "caseFan") {
      emit({
        ...config,
        caseFans: [...(config.caseFans ?? []), { slotId, partId, quantity: 1 }],
      });
      return;
    }

    emit({
      ...config,
      radiator: {
        ...(config.radiator ?? {}),
        fans: [...(config.radiator?.fans ?? []), { slotId, partId, quantity: 1 }],
      },
    });
  };

  const placeRadiator = (partId: string, slotId: string) => {
    emit({
      ...config,
      radiator: {
        ...(config.radiator ?? {}),
        slotId,
        partId,
      },
    });
  };

  const placeInventoryPart = (partId: string, target: InventoryPlacementTarget) => {
    if (target.kind === "radiator") {
      placeRadiator(partId, target.slotId);
      return;
    }

    addFanToSlot(partId, target.slotId, target.kind);
  };

  const removeRadiator = () => {
    const { radiator: _radiator, ...configWithoutRadiator } = config;
    emit(configWithoutRadiator);
  };

  const setRgb = (patch: NonNullable<RenderInteractiveConfig["rgb"]>) => {
    emit({
      ...config,
      rgb: {
        ...rgbConfig,
        ...patch,
      },
    });
  };

  const setSidePanel = (showSidePanel: boolean) => {
    emit({ ...config, showSidePanel });
  };

  const updateFanPlacement = (
    placementIndex: number,
    kind: PlacementKind,
    update: Partial<RenderInteractiveFanPlacement>
  ) => {
    if (kind === "caseFan") {
      emit({ ...config, caseFans: updatePlacementAtIndex(config.caseFans, placementIndex, update) });
      return;
    }

    emit({
      ...config,
      radiator: {
        ...(config.radiator ?? {}),
        fans: updatePlacementAtIndex(config.radiator?.fans, placementIndex, update),
      },
    });
  };

  const removeFanPlacement = (placementIndex: number, kind: PlacementKind) => {
    if (kind === "caseFan") {
      emit({ ...config, caseFans: removePlacementAtIndex(config.caseFans, placementIndex) });
      return;
    }

    emit({
      ...config,
      radiator: {
        ...(config.radiator ?? {}),
        fans: removePlacementAtIndex(config.radiator?.fans, placementIndex),
      },
    });
  };

  const renderFanPlacement = (placement: RenderInteractiveFanPlacement, kind: PlacementKind, placementIndex: number) => {
    const part = knownFanOptions.find((fan) => fan.partId === placement.partId);
    const quantity = placement.quantity ?? 1;
    const airflowLabel = placement.flip ? "Exhaust" : "Intake";
    const airflowStyle =
      airflowLabel === "Exhaust" ? { ...styles.airflowPill, ...styles.airflowPillExhaust } : styles.airflowPill;

    return (
      <div key={`${kind}-${placement.slotId}-${placement.partId}-${placementIndex}`} style={styles.partRow}>
        <div style={styles.partMain}>
          <PartAvatar part={part} icon={<Fan size={18} aria-hidden="true" />} />
          <div style={styles.partDetails}>
            <span style={styles.itemName} title={part?.name ?? placement.partId}>
              {part?.name ?? placement.partId}
            </span>
            {quantity > 1 ? <span style={styles.muted}>{quantity} fans</span> : null}
          </div>
        </div>
        <div style={styles.partActions}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateFanPlacement(placementIndex, kind, { flip: !placement.flip })}
            style={getButtonStyle(airflowStyle, disabled)}
            aria-label={`Flip fan airflow from ${airflowLabel}`}
          >
            {airflowLabel}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeFanPlacement(placementIndex, kind)}
            style={getButtonStyle(styles.iconOnlyButton, disabled)}
            aria-label="Remove fan"
          >
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  const renderCaseSlot = (slot: RenderInteractiveSlotOption) => {
    const fanPlacements = getPlacementsForSlot(config, slot.slotId, "caseFan");
    const hasRadiator = isRadiatorPlacedInSlot(config, slot.slotId);
    const radiatorPartId = config.radiator?.partId;
    const fanRowLabel = fanPlacements.length
      ? `${fanPlacements.length} fan${fanPlacements.length === 1 ? "" : "s"}`
      : "No fans";

    return (
      <div key={slot.slotId} style={styles.slotCard}>
        <div style={styles.slotHeader}>
          <div style={styles.slotTitleGroup}>
            <span style={styles.slotIcon}>
              <Fan size={17} aria-hidden="true" />
            </span>
            <div style={styles.slotTitleText}>
              <span style={styles.slotTitle}>{getSlotName(slot)}</span>
              <span style={styles.muted}>{fanRowLabel}</span>
            </div>
          </div>
          {renderSlotChips(slot, hasRadiator ? <span style={{ ...styles.chip, ...styles.chipGreen }}>Placed</span> : null)}
        </div>

        {hasRadiator ? (
          <div style={styles.partRow}>
            <div style={styles.partMain}>
              <PartAvatar
                part={knownCoolerOptions.find((cooler) => cooler.partId === radiatorPartId)}
                icon={<Cpu size={18} aria-hidden="true" />}
              />
              <div style={styles.partDetails}>
                <span style={styles.itemName} title={getPartName(knownCoolerOptions, radiatorPartId ?? "", "Selected radiator")}>
                  {getPartName(knownCoolerOptions, radiatorPartId ?? "", "Selected radiator")}
                </span>
                <span style={styles.muted}>{config.radiator?.flip ? "Reversed radiator" : "Radiator mounted"}</span>
              </div>
            </div>
            <div style={styles.partActions}>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  emit({
                    ...config,
                    radiator: {
                      ...(config.radiator ?? {}),
                      flip: !config.radiator?.flip,
                    },
                  })
                }
                style={getButtonStyle(styles.iconOnlyButton, disabled)}
                aria-label="Reverse radiator"
              >
                <RotateCw size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={removeRadiator}
                style={getButtonStyle(styles.iconOnlyButton, disabled)}
                aria-label="Remove radiator"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}

        {fanPlacements.length ? (
          <div style={styles.partList}>
            {fanPlacements.map(({ placement, placementIndex }) => renderFanPlacement(placement, "caseFan", placementIndex))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderRadiatorFanSlot = (slot: RenderInteractiveSlotOption) => {
    const fanPlacements = getPlacementsForSlot(config, slot.slotId, "radiatorFan");
    const statusChip = config.radiator?.slotId ? (
      <span style={{ ...styles.chip, ...styles.chipGreen }}>Placed</span>
    ) : (
      <span style={{ ...styles.chip, ...styles.chipAccent }}>Radiator fans</span>
    );
    const fanRowLabel = fanPlacements.length
      ? `${fanPlacements.length} fan${fanPlacements.length === 1 ? "" : "s"}`
      : "No radiator fans installed";

    return (
      <div key={slot.slotId} style={styles.slotCard}>
        <div style={styles.slotHeader}>
          <div style={styles.slotTitleGroup}>
            <span style={styles.slotIcon}>
              <Fan size={17} aria-hidden="true" />
            </span>
            <div style={styles.slotTitleText}>
              <span style={styles.slotTitle}>Radiator</span>
              <span style={styles.muted}>{fanRowLabel}</span>
            </div>
          </div>
          {renderSlotChips(slot, statusChip)}
        </div>

        {fanPlacements.length ? (
          <div style={styles.partList}>
            {fanPlacements.map(({ placement, placementIndex }) => renderFanPlacement(placement, "radiatorFan", placementIndex))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div
      className={className}
      style={{ ...getInteractiveConfigThemeVariables(resolvedTheme), ...styles.root, ...style }}
      data-buildcores-config-theme={resolvedTheme}
      data-testid="render-config-builder"
    >
      {isInitialLoading ? (
        <div style={styles.loadingState} role="status" aria-live="polite">
          <span style={styles.loadingTitle}>Loading case slots...</span>
          <span style={styles.muted}>Checking compatible placements for this build.</span>
        </div>
      ) : null}
      {isRefreshing && <span style={styles.muted}>Refreshing case slots...</span>}
      {error && <span style={styles.warning}>{error}</span>}

      {options ? (
        <>
          {!isLoading && !error && options.slots.length === 0 && (
            <span style={styles.empty}>No interactive slots are available for these parts.</span>
          )}

          {options.warnings?.length ? (
            <Section title="Warnings">
              {options.warnings.map((warning) => (
                <div key={warning} style={styles.warning}>
                  {warning}
                </div>
              ))}
            </Section>
          ) : null}

          <div style={styles.toggleRow}>
            <span>Show Side Panel</span>
            <SidePanelSwitch checked={showSidePanel} disabled={disabled} onChange={setSidePanel} />
          </div>

          <Section title="Unplaced items">
            {hasInventory ? (
              <div style={styles.inventoryGrid}>
                {coolerOptions.map((cooler) => (
                  <InventoryItem
                    key={cooler.partId}
                    part={cooler}
                    icon={<Cpu size={18} aria-hidden="true" />}
                    placements={radiatorPlacementTargets}
                    disabled={disabled}
                    onPlace={placeInventoryPart}
                  />
                ))}
                {fanOptions.map((fan) => (
                  <InventoryItem
                    key={fan.partId}
                    part={fan}
                    icon={<Fan size={18} aria-hidden="true" />}
                    placements={getFanPlacementTargets(fan.partId, caseFanSlots, radiatorSlots)}
                    disabled={disabled}
                    onPlace={placeInventoryPart}
                  />
                ))}
              </div>
            ) : (
              <div style={styles.empty}>No unplaced items</div>
            )}
          </Section>

          {radiatorSlots.length || caseFanSlots.length ? (
            <Section title="Case fan and radiator slots">
              <div style={styles.slotList}>
                {radiatorSlots.map(renderRadiatorFanSlot)}
                {caseFanSlots.map(renderCaseSlot)}
                {!radiatorSlots.length && !caseFanSlots.length ? <div style={styles.empty}>No configurable slots.</div> : null}
              </div>
            </Section>
          ) : null}

          {!radiatorMountSlots.length && coolerOptions.length > 0 ? (
            <div style={styles.warning}>This case does not expose a supported radiator slot yet.</div>
          ) : null}

          <Section title="Lighting">
            <div style={styles.lightingRow}>
              <input
                type="color"
                value={rgbConfig.color ?? "#ffffff"}
                disabled={disabled}
                onChange={(event) => setRgb({ color: event.target.value })}
                aria-label="RGB color"
                style={{ width: 44, height: 36 }}
              />
              <select
                value={rgbConfig.rgbPattern ?? "wave"}
                disabled={disabled}
                onChange={(event) => setRgb({ rgbPattern: event.target.value })}
                style={styles.select}
                aria-label="RGB pattern"
              >
                <option value="wave">Wave</option>
                <option value="static">Static</option>
                <option value="breathing">Breathing</option>
              </select>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={rgbConfig.brightness ?? 100}
              disabled={disabled}
              onChange={(event) => setRgb({ brightness: Number(event.target.value) })}
              aria-label="RGB brightness"
              style={styles.range}
            />
          </Section>
        </>
      ) : null}
    </div>
  );
};
