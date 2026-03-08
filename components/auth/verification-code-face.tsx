"use client"

import {
  motion,
  useMotionTemplate,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"

type PathParams = {
  height: number
  width: number
}

type VerificationCodeFaceExpression = "Happy" | "Sad" | "Normal"
export type VerificationCodeFaceStatus = "inProgress" | "correct" | "wrong"

const FACE_COLOR = "#fa591e"
const FEATURE_COLOR = "#ffffff"
const PUPIL_COLOR = "#000000"
const MOUTH_HEIGHT = 20
const MOUTH_WIDTH = 25
const EYEBROW_HEIGHT = 8
const EYEBROW_WIDTH = 15
const OUTER_ROTATE_X = -Math.PI / 8
const PROGRESS_RANGE = [0, 1]
const GAP_RANGE = [7, 3]
const ROTATE_Y_RANGE = [-Math.PI / 8, Math.PI / 8]
const TRANSLATE_X_RANGE = [-10, 10]
const PUPIL_SCALE_RANGE = [0.4, 0.8]
const PUPIL_TRANSLATE_X_RANGE = [-4, 4]
const PUPIL_TRANSLATE_Y_RANGE = [3, 3]
const PATH_TRANSITION = { duration: 0.35, ease: [0.32, 0.72, 0, 1] } as const
const SPRING = { stiffness: 260, damping: 28, mass: 0.55 } as const

const createPath = (
  type: VerificationCodeFaceExpression,
  { height, width }: PathParams
) => {
  switch (type) {
    case "Happy":
      return `M0 ${height / 2} Q${width / 2} ${height} ${width} ${height / 2}`
    case "Sad":
      return `M0 ${height / 2} Q${width / 2} 0 ${width} ${height / 2}`
    case "Normal":
      return `M0 ${height / 2} Q${width / 2} ${height / 2} ${width} ${height / 2}`
  }
}

export const DefaultMouthPaths = {
  Happy: createPath("Happy", { height: MOUTH_HEIGHT, width: MOUTH_WIDTH }),
  Sad: createPath("Sad", { height: MOUTH_HEIGHT, width: MOUTH_WIDTH }),
  Normal: createPath("Normal", { height: MOUTH_HEIGHT, width: MOUTH_WIDTH }),
}

export const DefaultEyebrowPaths = {
  Happy: createPath("Sad", { height: EYEBROW_HEIGHT, width: EYEBROW_WIDTH }),
  Sad: createPath("Happy", { height: EYEBROW_HEIGHT, width: EYEBROW_WIDTH }),
  Normal: createPath("Normal", { height: EYEBROW_HEIGHT, width: EYEBROW_WIDTH }),
}

type EyeProps = {
  progress: MotionValue<number>
}

function Eye({ progress }: EyeProps) {
  const pupilScale = useTransform(progress, PROGRESS_RANGE, PUPIL_SCALE_RANGE)
  const size = useTransform(pupilScale, (value: number) => value * 10)
  const radius = useTransform(size, (value: number) => value / 2)
  const translateX = useTransform(progress, PROGRESS_RANGE, PUPIL_TRANSLATE_X_RANGE)
  const translateY = useTransform(progress, PROGRESS_RANGE, PUPIL_TRANSLATE_Y_RANGE)

  return (
    <div
      className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-[10px]"
      style={{ backgroundColor: FEATURE_COLOR }}
    >
      <motion.div
        style={{
          backgroundColor: PUPIL_COLOR,
          borderRadius: radius,
          height: size,
          width: size,
          x: translateX,
          y: translateY,
        }}
      />
    </div>
  )
}

type VerificationCodeFaceProps = {
  className?: string
  currentCodeLength: number
  maxCodeLength: number
  status?: VerificationCodeFaceStatus
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function VerificationCodeFace({
  className,
  currentCodeLength,
  maxCodeLength,
  status = "inProgress",
}: VerificationCodeFaceProps) {
  const targetProgress = useMemo(() => {
    if (maxCodeLength <= 0) return 0
    return clamp(currentCodeLength / maxCodeLength, 0, 1)
  }, [currentCodeLength, maxCodeLength])

  const progress = useSpring(targetProgress, SPRING)
  useEffect(() => {
    progress.set(targetProgress)
  }, [progress, targetProgress])

  const expression: VerificationCodeFaceExpression = useMemo(() => {
    if (status === "correct") return "Happy"
    if (status === "wrong") return "Sad"
    return "Normal"
  }, [status])

  const rotateY = useTransform(progress, PROGRESS_RANGE, ROTATE_Y_RANGE)
  const translateX = useTransform(progress, PROGRESS_RANGE, TRANSLATE_X_RANGE)
  const gap = useTransform(progress, PROGRESS_RANGE, GAP_RANGE)

  const outerTransform = useMotionTemplate`perspective(300px) rotateY(${rotateY}rad) rotateX(${OUTER_ROTATE_X}rad)`
  const innerTransform = useMotionTemplate`perspective(200px) translateY(10px) translateX(${translateX}px)`

  return (
    <motion.div
      aria-hidden="true"
      className={cn("flex h-24 w-24 items-center justify-center rounded-[24px]", className)}
      style={{
        backgroundColor: FACE_COLOR,
        transform: outerTransform,
      }}
    >
      <motion.div
        className="flex flex-col items-center justify-center"
        style={{
          gap,
          transform: innerTransform,
        }}
      >
        <motion.div className="flex" style={{ gap, marginBottom: gap }}>
          <svg height="8" viewBox="0 0 15 8" width="15">
            <motion.path
              animate={{ d: DefaultEyebrowPaths[expression] }}
              d={DefaultEyebrowPaths.Normal}
              fill="none"
              initial={false}
              stroke={FEATURE_COLOR}
              strokeLinecap="round"
              strokeWidth={1.2}
              transition={PATH_TRANSITION}
            />
          </svg>
          <svg height="8" viewBox="0 0 15 8" width="15">
            <motion.path
              animate={{ d: DefaultEyebrowPaths[expression] }}
              d={DefaultEyebrowPaths.Normal}
              fill="none"
              initial={false}
              stroke={FEATURE_COLOR}
              strokeLinecap="round"
              strokeWidth={1.2}
              transition={PATH_TRANSITION}
            />
          </svg>
        </motion.div>

        <motion.div className="flex" style={{ gap }}>
          <Eye progress={progress} />
          <Eye progress={progress} />
        </motion.div>

        <svg height="20" viewBox="0 0 25 20" width="25">
          <motion.path
            animate={{ d: DefaultMouthPaths[expression] }}
            d={DefaultMouthPaths.Normal}
            fill="none"
            initial={false}
            stroke={FEATURE_COLOR}
            strokeLinecap="round"
            strokeWidth={2}
            transition={PATH_TRANSITION}
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}
