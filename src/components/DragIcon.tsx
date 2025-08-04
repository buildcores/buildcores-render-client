import React from "react";

interface DragIconProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DragIcon: React.FC<DragIconProps> = ({
  width = 24,
  height = 24,
  className,
  style,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="Layer_1"
      width={width}
      height={height}
      data-name="Layer 1"
      viewBox="0 0 24 24"
      className={className}
      style={style}
      {...props}
    >
      <defs>
        <style>
          {
            ".cls-1{fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:1.91px}"
          }
        </style>
      </defs>
      <path
        d="m11.05 22.5-5.14-5.14a2 2 0 0 1-.59-1.43 2 2 0 0 1 2-2 2 2 0 0 1 1.43.59l1.32 1.32V6.38a2 2 0 0 1 1.74-2 1.89 1.89 0 0 1 1.52.56 1.87 1.87 0 0 1 .56 1.34V12l5 .72a1.91 1.91 0 0 1 1.64 1.89 17.18 17.18 0 0 1-1.82 7.71l-.09.18M19.64 7.23l2.86-2.87-2.86-2.86M15.82 4.36h6.68M4.36 7.23 1.5 4.36 4.36 1.5M8.18 4.36H1.5"
        className="cls-1"
      />
    </svg>
  );
};
