"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CarouselItem = {
  src: string;
  alt: string;
};

type MotionCarouselProps = React.ComponentProps<"div"> & {
  items: CarouselItem[];
  autoPlayInterval?: number;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 72 : -72,
    opacity: 0,
    scale: 0.985,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 72 : -72,
    opacity: 0,
    scale: 0.985,
  }),
};

const toIndex = (value: number, size: number) => ((value % size) + size) % size;

export function MotionCarousel({
  items,
  autoPlayInterval = 4500,
  className,
  ...props
}: MotionCarouselProps) {
  const [[page, direction], setPage] = React.useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = React.useState(false);

  const activeIndex = toIndex(page, Math.max(items.length, 1));

  const paginate = React.useCallback((newDirection: number) => {
    setPage(([prev]) => [prev + newDirection, newDirection]);
  }, []);

  React.useEffect(() => {
    if (items.length < 2 || isPaused) return;
    const timer = window.setInterval(() => paginate(1), autoPlayInterval);
    return () => window.clearInterval(timer);
  }, [autoPlayInterval, isPaused, items.length, paginate]);

  if (items.length === 0) return null;

  const activeItem = items[activeIndex];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/50 bg-background/35 backdrop-blur-sm",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      {...props}
    >
      <div className="relative aspect-[16/10] md:aspect-[21/9]">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={activeItem.src}
              alt={activeItem.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
              priority={activeIndex === 0}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => paginate(-1)}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/40 bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/45"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => paginate(1)}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/40 bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/45"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.src}
              type="button"
              onClick={() => setPage([index, index > activeIndex ? 1 : -1])}
              className={cn(
                "h-2 rounded-full transition-all",
                isActive ? "w-6 bg-white" : "w-2 bg-white/55 hover:bg-white/85"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

