import React from "react";
import clsx from "clsx";

// JS version of StripesBackground to avoid needing TypeScript setup
// Usage:
// <StripesBackground position="right" width="w-full" height="h-full" opacity="opacity-30" />

const StripesBackground = ({
  className = "",
  position = "right",
  width = "w-full",
  height = "h-full",
  opacity = "opacity-30",
}) => {
  const positionStyles = {
    right: "absolute top-0 right-0",
    left: "absolute top-0 left-0",
    top: "absolute top-0 left-0 w-full h-32",
    bottom: "absolute bottom-0 left-0 w-full h-32",
    full: "absolute inset-0",
  };

  return (
    <div
      className={clsx(
        "pointer-events-none z-10",
        // Light mode: semi-transparent black stripes
        "bg-[repeating-linear-gradient(45deg,_#00000066_0px,_#00000066_1px,_transparent_1px,_transparent_6px)]",
        // Dark mode: semi-transparent white stripes
        "dark:bg-[repeating-linear-gradient(45deg,_#ffffff66_0px,_#ffffff66_1px,_transparent_1px,_transparent_6px)]",
        positionStyles[position] || positionStyles.right,
        width,
        height,
        opacity,
        className
      )}
    />
  );
};

export default StripesBackground;
