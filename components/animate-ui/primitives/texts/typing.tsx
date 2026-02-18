"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TypingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  text: string;
  inView?: boolean;
  speed?: number;
  startDelay?: number;
  cursor?: boolean;
};

export function TypingText({
  text,
  className,
  inView = false,
  speed = 24,
  startDelay = 0,
  cursor = true,
  ...props
}: TypingTextProps) {
  const [visibleCount, setVisibleCount] = React.useState(inView ? 0 : text.length);

  React.useEffect(() => {
    if (!inView) {
      setVisibleCount(text.length);
      return;
    }

    setVisibleCount(0);
    const delayTimer = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        setVisibleCount((prev) => {
          if (prev >= text.length) {
            window.clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(delayTimer);
    };
  }, [inView, text, speed, startDelay]);

  const visibleText = text.slice(0, visibleCount);

  return (
    <span className={cn("inline-flex items-center justify-center whitespace-pre-wrap", className)} {...props}>
      <span>{visibleText}</span>
      {cursor ? (
        <motion.span
          aria-hidden="true"
          className="ml-1 inline-block h-[1em] w-[2px] bg-current"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </span>
  );
}
