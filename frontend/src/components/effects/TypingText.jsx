"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

export default function TypingText({
  children,
  as: Component = "div",
  className = "",
  delay = 0,
  duration = 2,
  fontSize = "text-4xl",
  fontWeight = "font-bold",
  color = "text-foreground",
  letterSpacing = "tracking-wide",
  align = "left",
  loop = false,
}) {
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    const extractText = (node) => {
      if (typeof node === "string" || typeof node === "number") {
        return node.toString();
      }
      if (Array.isArray(node)) {
        return node.map(extractText).join("");
      }
      if (React.isValidElement(node) && typeof node.props.children !== "undefined") {
        return extractText(node.props.children);
      }
      return "";
    };
    setTextContent(extractText(children));
  }, [children]);

  const characters = textContent.split("").map((char) => (char === " " ? "\u00A0" : char));

  return (
    <Component
      className={cn(
        "inline-flex",
        className,
        fontSize,
        fontWeight,
        color,
        letterSpacing,
        align === "center"
          ? "justify-center text-center"
          : align === "right"
          ? "justify-end text-right"
          : "justify-start text-left"
      )}
    >
      <motion.span className="inline-block" initial="hidden" animate="visible" aria-label={textContent} role="text">
        {characters.map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            className="inline-block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                delay: delay + index * (duration / Math.max(1, characters.length)),
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}
