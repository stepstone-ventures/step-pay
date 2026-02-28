"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

type PageSkeletonOverlayVariant = "auto" | "dashboard" | "auth" | "generic"

type PageSkeletonOverlayProps = {
  visible: boolean
  desktopContentOnly?: boolean
  className?: string
  variant?: PageSkeletonOverlayVariant
}

const OVERLAY_MAX_DURATION_MS = 2000

export function PageSkeletonOverlay({
  visible,
  desktopContentOnly = false,
  className,
  variant: _variant = "auto",
}: PageSkeletonOverlayProps) {
  const [isShowing, setIsShowing] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!visible) {
      setIsShowing(false)
      return
    }

    setIsShowing(true)
    timeoutRef.current = setTimeout(() => {
      setIsShowing(false)
      timeoutRef.current = null
    }, OVERLAY_MAX_DURATION_MS)
  }, [visible])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {isShowing ? (
          <motion.div
            className={cn(
              "pointer-events-none fixed inset-0 z-[140] flex items-center justify-center bg-white dark:bg-black",
              desktopContentOnly && "md:inset-auto md:left-64 md:right-0 md:top-[82px] md:bottom-0",
              className
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="sp-cube-loader" aria-hidden="true">
              <div className="sp-cube-top" />
              <div className="sp-cube-wrapper">
                <span className="sp-cube-span sp-cube-span-0" />
                <span className="sp-cube-span sp-cube-span-1" />
                <span className="sp-cube-span sp-cube-span-2" />
                <span className="sp-cube-span sp-cube-span-3" />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <style jsx>{`
        .sp-cube-loader {
          position: relative;
          width: 75px;
          height: 75px;
          transform-style: preserve-3d;
          transform: rotateX(-30deg);
          animation: sp-cube-rotate 2s linear infinite;
        }

        @keyframes sp-cube-rotate {
          0% {
            transform: rotateX(-30deg) rotateY(0deg);
          }
          100% {
            transform: rotateX(-30deg) rotateY(360deg);
          }
        }

        .sp-cube-wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .sp-cube-span {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            hsl(0, 0%, 0%) 0%,
            hsl(0, 0%, 0%) 5.5%,
            hsl(0, 0%, 0%) 12.1%,
            hsl(0, 0%, 100%) 100%,
            hsl(0, 0%, 0%) 27.9%,
            hsl(0, 0%, 0%) 36.6%,
            hsl(0, 0%, 0%) 45.6%,
            hsl(0, 0%, 100%) 100%,
            hsl(0, 0%, 0%) 63.4%,
            hsl(0, 0%, 0%) 71.7%,
            hsl(0, 0%, 0%) 79.4%,
            hsl(0, 0%, 100%) 100%,
            hsl(0, 0%, 0%) 100%,
            hsl(0, 0%, 0%) 100%,
            hsl(0, 0%, 0%) 100%,
            hsl(0, 0%, 100%) 100%
          );
        }

        .sp-cube-span-0 {
          transform: rotateY(0deg) translateZ(37.5px);
        }
        .sp-cube-span-1 {
          transform: rotateY(90deg) translateZ(37.5px);
        }
        .sp-cube-span-2 {
          transform: rotateY(180deg) translateZ(37.5px);
        }
        .sp-cube-span-3 {
          transform: rotateY(270deg) translateZ(37.5px);
        }

        .sp-cube-top {
          position: absolute;
          width: 75px;
          height: 75px;
          background: hsl(330, 3.13%, 25.1%) 0%;
          transform: rotateX(90deg) translateZ(37.5px);
          transform-style: preserve-3d;
        }

        .sp-cube-top::before {
          content: "";
          position: absolute;
          width: 75px;
          height: 75px;
          background: hsl(0, 0%, 0%) 19.6%;
          transform: translateZ(-90px);
          filter: blur(10px);
          box-shadow:
            0 0 10px #323232,
            0 0 20px hsl(0, 0%, 100%) 19.6%,
            0 0 30px #323232,
            0 0 40px hsl(0, 0%, 100%) 19.6%;
        }
      `}</style>
    </>
  )
}
