"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  MotionGrid,
  MotionGridCells,
  type Frames,
} from "@/components/animate-ui/primitives/animate/motion-grid"

const importingFrames: Frames = [
  [[2, 2]],
  [[1, 2], [2, 1], [2, 3], [3, 2]],
  [[2, 2], [0, 2], [1, 1], [1, 3], [2, 0], [2, 4], [3, 1], [3, 3], [4, 2]],
  [[0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 1], [2, 3], [3, 0], [3, 2], [3, 4], [4, 1], [4, 3]],
  [[0, 0], [0, 2], [0, 4], [1, 1], [1, 3], [2, 0], [2, 2], [2, 4], [3, 1], [3, 3], [4, 0], [4, 2], [4, 4]],
  [[0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 1], [2, 3], [3, 0], [3, 2], [3, 4], [4, 1], [4, 3]],
  [[0, 0], [0, 2], [0, 4], [1, 1], [1, 3], [2, 0], [2, 4], [3, 1], [3, 3], [4, 0], [4, 2], [4, 4]],
  [[0, 1], [1, 0], [3, 0], [4, 1], [0, 3], [1, 4], [3, 4], [4, 3]],
  [[0, 0], [0, 4], [4, 0], [4, 4]],
  [],
]

const syncingFrames: Frames = [
  [[2, 0]],
  [[1, 0], [2, 0], [3, 0], [2, 1]],
  [[2, 0], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[2, 0], [2, 1], [1, 2], [2, 2], [3, 2], [2, 3]],
  [[2, 1], [2, 2], [1, 3], [2, 3], [3, 3], [2, 4]],
  [[2, 2], [2, 3], [1, 4], [2, 4], [3, 4]],
  [[2, 3], [2, 4]],
  [[2, 4]],
  [],
  [[2, 4]],
  [[1, 4], [2, 4], [3, 4], [2, 3]],
  [[2, 4], [1, 3], [2, 3], [3, 3], [2, 2]],
  [[2, 4], [2, 3], [1, 2], [2, 2], [3, 2], [2, 1]],
  [[2, 3], [2, 2], [1, 1], [2, 1], [3, 1], [2, 0]],
  [[2, 2], [2, 1], [1, 0], [2, 0], [3, 0]],
  [[2, 1], [2, 0]],
  [[2, 0]],
  [],
]

const initializingFrames: Frames = [
  [],
  [[1, 0], [3, 0]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3], [2, 4]],
  [[1, 2], [2, 1], [2, 2], [2, 3], [3, 2]],
  [[2, 2]],
  [],
]

const readyFrames: Frames = [
  [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2]],
  [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2], [1, 2], [2, 3], [3, 2]],
  [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2], [1, 2], [2, 3], [3, 2], [2, 2]],
]

const states = [
  { label: "Initializing", frames: initializingFrames },
  { label: "Importing", frames: importingFrames },
  { label: "Syncing", frames: syncingFrames },
  { label: "Ready", frames: readyFrames },
] as const

export function SidebarRouteLoader({ visible }: { visible: boolean }) {
  const [stateIndex, setStateIndex] = React.useState(0)

  React.useEffect(() => {
    if (!visible) return

    setStateIndex(0)
    const interval = setInterval(() => {
      setStateIndex((previous) => (previous + 1) % states.length)
    }, 800)

    return () => clearInterval(interval)
  }, [visible])

  const current = states[stateIndex]

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[140] flex items-center justify-center bg-background/78 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            layout
            className="flex min-w-[250px] items-center gap-3 rounded-2xl border border-border/70 bg-card/95 px-5 py-4 shadow-2xl"
          >
            <MotionGrid
              gridSize={[5, 5]}
              frames={current.frames}
              className="w-fit gap-0.5"
              duration={140}
              animate
            >
              <MotionGridCells className="size-[4px] rounded-full bg-black/20 data-[active=true]:bg-black/70 dark:bg-white/20 dark:data-[active=true]:bg-white/70" />
            </MotionGrid>

            <motion.span
              key={current.label}
              className="text-sm font-semibold text-foreground"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {current.label}
            </motion.span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
