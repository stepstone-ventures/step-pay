"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Share2 } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { cn } from "@/lib/utils";

type Platform = "instagram" | "x" | "tiktok";

type ShareButtonProps = React.ComponentProps<"div"> & {
  onIconClick?: (platform: Platform) => void;
};

type ShareItem = {
  id: Platform;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function XBrandIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4h4l10 16h-4z" />
      <path d="M19 4h-4L5 20h4z" />
    </svg>
  );
}

function TikTokBrandIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 4v8.2a4.2 4.2 0 1 1-3-4V12" />
      <path d="M14 6c.9 1.4 2.3 2.4 4 2.8" />
    </svg>
  );
}

const SHARE_ITEMS: ShareItem[] = [
  { id: "instagram", href: "https://www.instagram.com", icon: Instagram },
  { id: "x", href: "https://x.com", icon: XBrandIcon },
  { id: "tiktok", href: "https://www.tiktok.com", icon: TikTokBrandIcon },
];

export function ShareButton({ className, onIconClick, ...props }: ShareButtonProps) {
  const [expanded, setExpanded] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        setExpanded(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const handleIconClick = (item: ShareItem, event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    onIconClick?.(item.id);
    window.open(item.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)} {...props}>
      <LiquidButton
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="relative min-w-28 h-10 px-4 py-2 text-sm font-medium border border-border/60"
        aria-pressed={expanded}
        aria-label="Refer StepPay"
      >
        <AnimatePresence initial={false} mode="wait">
          {!expanded ? (
            <motion.span
              key="content"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Refer
            </motion.span>
          ) : (
            <motion.span
              key="icons"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center gap-3"
            >
              {SHARE_ITEMS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.span
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.45, type: "spring", bounce: 0.4 }}
                    whileHover={{ y: -8, transition: { duration: 0.2, ease: "easeOut" } }}
                    className="cursor-pointer rounded-lg p-0.5"
                    onClick={(event) => handleIconClick(item, event)}
                    role="button"
                    aria-label={`Refer via ${item.id}`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.span>
                );
              })}
            </motion.span>
          )}
        </AnimatePresence>
      </LiquidButton>
    </div>
  );
}
