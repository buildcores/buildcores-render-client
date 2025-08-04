import React from "react";
import { DragIcon } from "./DragIcon";

interface InstructionTooltipProps {
  isVisible: boolean;
  progressValue: number;
  instructionIcon?: string;
}

export const InstructionTooltip: React.FC<InstructionTooltipProps> = ({
  isVisible,
  progressValue,
  instructionIcon,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) translateX(${progressValue * 100}px)`,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        pointerEvents: "none",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {instructionIcon ? (
        <img
          src={instructionIcon}
          alt="drag to view 360"
          style={{
            width: "24px",
            height: "24px",
            filter: "invert(1)", // Makes the icon white
          }}
        />
      ) : (
        <DragIcon
          width={24}
          height={24}
          style={{
            color: "white",
          }}
        />
      )}
    </div>
  );
};
