"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type RotatingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  texts: string[];
  interval?: number;
  inView?: boolean;
};

export function RotatingText({
  texts,
  className,
  interval = 2200,
  inView = true,
  ...props
}: RotatingTextProps) {
  const items = React.useMemo(() => texts.filter(Boolean), [texts]);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!inView || items.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [inView, interval, items.length]);

  if (items.length === 0) {
    return null;
  }

  const longest = items.reduce((max, current) => (current.length > max.length ? current : max), items[0]);

  return (
    <span
      className={cn("relative inline-flex items-center justify-center overflow-hidden", className)}
      style={{ minWidth: `${longest.length + 1}ch` }}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={items[index]}
          className="inline-block whitespace-nowrap"
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          {items[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
