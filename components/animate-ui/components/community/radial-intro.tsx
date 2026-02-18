"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type OrbitItem = {
  id: number | string;
  name: string;
  src: string;
};

type RadialIntroProps = React.ComponentProps<"div"> & {
  orbitItems?: OrbitItem[];
};

export function RadialIntro({ className, orbitItems = [], ...props }: RadialIntroProps) {
  const items = orbitItems.slice(0, 10);
  const step = items.length > 0 ? 360 / items.length : 360;

  return (
    <div
      className={cn(
        "relative w-full h-36 overflow-hidden rounded-2xl border border-border/50 bg-background/35 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--foreground)/0.12)_0,transparent_65%)]" />

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="absolute left-1/2 top-1/2 h-9 w-9"
            style={{
              transform: `translate(-50%, -50%) rotate(${step * index}deg) translateX(72px)`,
            }}
          >
            <motion.div
              className="h-9 w-9 overflow-hidden rounded-full border border-border/60 bg-card"
              animate={{ rotate: -360 }}
              transition={{ duration: 24, ease: "linear", repeat: Infinity }}
            >
              <img
                src={item.src}
                alt={item.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/25"
          animate={{ scale: [0.95, 1.06, 0.95], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/20"
          animate={{ scale: [0.96, 1.08, 0.96], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 3.8, ease: "easeInOut", repeat: Infinity, delay: 0.2 }}
        />
      </div>
    </div>
  );
}
