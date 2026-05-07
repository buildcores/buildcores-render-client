import React, { useEffect, useMemo, useState } from "react";
import { RotateCcw, Settings, X } from "lucide-react";
import { RenderInteractiveConfigBuilder } from "./RenderInteractiveConfigBuilder";
import { ApiConfig, RenderBuildRequest, RenderInteractiveConfig, RenderInteractiveConfigTheme } from "../types";
import { stableStringify } from "../utils/stableStringify";
import {
  getInteractiveConfigThemeVariables,
  useResolvedInteractiveConfigTheme,
} from "./interactiveConfigTheme";

export interface RenderInteractiveConfigOverlayProps {
  parts: RenderBuildRequest["parts"];
  apiConfig: ApiConfig;
  value?: RenderInteractiveConfig;
  onApply: (config: RenderInteractiveConfig) => void;
  disabled?: boolean;
  title?: string;
  buttonLabel?: string;
  theme?: RenderInteractiveConfigTheme;
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    position: "absolute",
    right: 12,
    bottom: 12,
    zIndex: 20,
    width: 42,
    height: 42,
    border: "1px solid rgba(255, 255, 255, 0.32)",
    borderRadius: "50%",
    background: "rgba(13, 18, 26, 0.82)",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.34)",
    backdropFilter: "blur(10px)",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  panel: {
    position: "fixed",
    left: 12,
    top: 12,
    bottom: 12,
    zIndex: 1000,
    width: "min(440px, calc(100vw - 24px))",
    maxHeight: "calc(100vh - 24px)",
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr) auto",
    overflow: "hidden",
    border: "1px solid var(--bcrc-border)",
    borderRadius: 8,
    background: "var(--bcrc-surface)",
    color: "var(--bcrc-text)",
    boxShadow: "var(--bcrc-panel-shadow)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "16px 16px 14px",
    borderBottom: "1px solid var(--bcrc-border-soft)",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  },
  iconButton: {
    width: 32,
    height: 32,
    border: "0",
    borderRadius: 6,
    background: "transparent",
    color: "var(--bcrc-secondary-text)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    overflowY: "auto",
    padding: "14px 14px 16px",
    overscrollBehavior: "contain",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "12px 16px",
    borderTop: "1px solid var(--bcrc-border-soft)",
    background: "var(--bcrc-surface)",
  },
  footerGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    padding: "8px 10px",
    border: "1px solid var(--bcrc-border-strong)",
    borderRadius: 6,
    background: "var(--bcrc-input)",
    color: "var(--bcrc-secondary-text)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  primaryButton: {
    padding: "8px 14px",
    border: "1px solid var(--bcrc-primary-border)",
    borderRadius: 6,
    background: "var(--bcrc-primary)",
    color: "var(--bcrc-primary-text)",
    cursor: "pointer",
  },
};

function cloneConfig(config: RenderInteractiveConfig | undefined): RenderInteractiveConfig {
  return config ? JSON.parse(JSON.stringify(config)) : {};
}

export const RenderInteractiveConfigOverlay: React.FC<RenderInteractiveConfigOverlayProps> = ({
  parts,
  apiConfig,
  value,
  onApply,
  disabled = false,
  title = "Inventory",
  buttonLabel = "Configure build",
  theme = "system",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState<RenderInteractiveConfig>(() => cloneConfig(value));
  const resolvedTheme = useResolvedInteractiveConfigTheme(theme);
  const partsKey = useMemo(() => stableStringify(parts), [parts]);
  const valueKey = useMemo(() => stableStringify(value ?? {}), [value]);

  useEffect(() => {
    if (isOpen) {
      setDraftConfig(cloneConfig(value));
    }
  }, [isOpen, partsKey, valueKey, value]);

  const openPanel = () => {
    if (disabled) {
      return;
    }

    setDraftConfig(cloneConfig(value));
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const applyConfig = () => {
    onApply(draftConfig);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label={buttonLabel}
        title={buttonLabel}
        onClick={openPanel}
        disabled={disabled}
        style={disabled ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        data-testid="render-config-gear"
      >
        <Settings size={20} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          style={{ ...getInteractiveConfigThemeVariables(resolvedTheme), ...styles.panel }}
          role="dialog"
          aria-modal="false"
          aria-label={title}
          data-buildcores-config-panel="true"
          data-buildcores-config-theme={resolvedTheme}
          data-testid="render-config-panel"
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          <div style={styles.header}>
            <h3 style={styles.title}>{title}</h3>
            <button type="button" aria-label="Close configuration" onClick={closePanel} style={styles.iconButton}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div style={styles.body}>
            <RenderInteractiveConfigBuilder
              parts={parts}
              apiConfig={apiConfig}
              value={draftConfig}
              onChange={setDraftConfig}
              disabled={disabled}
              theme={resolvedTheme}
              style={{
                border: "0",
                padding: 0,
              }}
            />
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              onClick={() => setDraftConfig({})}
              disabled={disabled}
              style={styles.secondaryButton}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Reset
            </button>
            <div style={styles.footerGroup}>
              <button type="button" onClick={closePanel} style={styles.secondaryButton}>
                Cancel
              </button>
              <button type="button" onClick={applyConfig} disabled={disabled} style={styles.primaryButton}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
