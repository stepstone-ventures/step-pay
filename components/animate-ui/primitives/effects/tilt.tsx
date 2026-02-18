"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, type HTMLMotionProps, type MotionValue, type SpringOptions } from "framer-motion"

import { getStrictContext } from "@/lib/get-strict-context"

type TiltContextType = {
  sRX: MotionValue<number>
  sRY: MotionValue<number>
  transition: SpringOptions
}

const [TiltProvider, useTilt] = getStrictContext<TiltContextType>("TiltContext")

type TiltProps = HTMLMotionProps<"div"> & {
  maxTilt?: number
  perspective?: number
  transition?: SpringOptions
}

function Tilt({
  maxTilt = 10,
  perspective = 800,
  style,
  transition = {
    stiffness: 300,
    damping: 25,
    mass: 0.5,
  },
  onMouseMove,
  onMouseLeave,
  ...props
}: TiltProps) {
  const rX = useMotionValue(0)
  const rY = useMotionValue(0)

  const sRX = useSpring(rX, transition)
  const sRY = useSpring(rY, transition)

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(event)
      const rect = event.currentTarget.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      const nx = px * 2 - 1
      const ny = py * 2 - 1
      rY.set(nx * maxTilt)
      rX.set(-ny * maxTilt)
    },
    [maxTilt, onMouseMove, rX, rY]
  )

  const handleMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(event)
      rX.set(0)
      rY.set(0)
    },
    [onMouseLeave, rX, rY]
  )

  return (
    <TiltProvider value={{ sRX, sRY, transition }}>
      <motion.div
        style={{
          perspective,
          transformStyle: "preserve-3d",
          willChange: "transform",
          ...style,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    </TiltProvider>
  )
}

type TiltContentProps = HTMLMotionProps<"div">

function TiltContent({
  children,
  style,
  transition,
  ...props
}: TiltContentProps) {
  const { sRX, sRY, transition: tiltTransition } = useTilt()

  return (
    <motion.div
      style={{
        rotateX: sRX,
        rotateY: sRY,
        willChange: "transform",
        ...style,
      }}
      transition={transition ?? tiltTransition}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { Tilt, TiltContent, type TiltProps, type TiltContentProps }
