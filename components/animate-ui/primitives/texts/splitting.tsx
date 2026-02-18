"use client";

import * as React from "react";
import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

type SplitType = "chars" | "words";

type SplittingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  text: string;
  type?: SplitType;
  inView?: boolean;
  disableAnimation?: boolean;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  transition?: Transition;
};

const DEFAULT_INITIAL: TargetAndTransition = { opacity: 0, y: 8, filter: "blur(8px)" };
const DEFAULT_ANIMATE: TargetAndTransition = { opacity: 1, y: 0, filter: "blur(0px)" };

function splitText(text: string, type: SplitType) {
  if (type === "words") {
    return text.split(" ").map((word, index, arr) => (index < arr.length - 1 ? `${word} ` : word));
  }
  return Array.from(text);
}

export function SplittingText({
  text,
  className,
  type = "words",
  inView = false,
  disableAnimation = false,
  initial = DEFAULT_INITIAL,
  animate = DEFAULT_ANIMATE,
  transition = { duration: 0.4, ease: "easeOut" },
  ...props
}: SplittingTextProps) {
  if (disableAnimation) {
    return (
      <span className={cn("whitespace-pre-wrap", className)} {...props}>
        {text}
      </span>
    );
  }

  const parts = splitText(text, type);

  return (
    <span className={cn("whitespace-pre-wrap", className)} {...props}>
      {parts.map((part, index) => (
        <motion.span
          key={`${part}-${index}`}
          className="inline-block"
          initial={initial as any}
          animate={(inView ? animate : initial) as any}
          transition={{
            ...(transition as any),
            delay: ((transition?.delay as number | undefined) ?? 0) + index * 0.018,
          } as any}
        >
          {part === " " ? "\u00A0" : part}
        </motion.span>
      ))}
    </span>
  );
}
