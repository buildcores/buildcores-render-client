import React from "react";

interface LoadingErrorOverlayProps {
  isVisible: boolean;
  renderError?: string;
  size: number;
}

export const LoadingErrorOverlay: React.FC<LoadingErrorOverlayProps> = ({
  isVisible,
  renderError,
  size,
}) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        zIndex: 10,
      }}
    >
      {renderError ? (
        <>
          <div
            style={{ marginBottom: "20px", fontSize: "18px", color: "white" }}
          >
            Render Failed
          </div>
          <div
            style={{
              fontSize: "14px",
              textAlign: "center",
              maxWidth: size * 0.8,
              color: "white",
            }}
          >
            {renderError}
          </div>
        </>
      ) : (
        <>
          <div
            style={{ marginBottom: "20px", fontSize: "18px", color: "white" }}
          >
            {"Loading Build..."}
          </div>
        </>
      )}
    </div>
  );
};
