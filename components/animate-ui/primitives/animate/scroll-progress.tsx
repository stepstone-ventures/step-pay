"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type ScrollProgressProps = React.ComponentProps<"div">;

export function ScrollProgress({ className, ...props }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
  });

  return (
    <div
      className={cn("pointer-events-none fixed inset-x-0 top-0 z-[300] h-1 bg-transparent", className)}
      {...props}
    >
      <motion.div
        className="h-full origin-left bg-foreground/80"
        style={{ scaleX }}
      />
    </div>
  );
}
