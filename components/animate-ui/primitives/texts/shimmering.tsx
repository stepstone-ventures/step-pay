"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"

type ShimmeringTextProps = Omit<HTMLMotionProps<"span">, "children"> & {
  text: string
  duration?: number
  wave?: boolean
  color?: string
  shimmeringColor?: string
}

export function ShimmeringText({
  text,
  duration = 1,
  transition,
  wave = false,
  color = "hsl(var(--muted-foreground))",
  shimmeringColor = "hsl(var(--foreground))",
  ...props
}: ShimmeringTextProps) {
  const segments = React.useMemo(() => {
    const parts = text.split(/(\s+)/).filter((part) => part.length > 0)
    const results: Array<{ type: "space" | "word"; value: string; start: number }> = []
    let cursor = 0

    for (const part of parts) {
      const isSpace = /^\s+$/.test(part)
      results.push({
        type: isSpace ? "space" : "word",
        value: part,
        start: cursor,
      })
      cursor += part.length
    }

    return results
  }, [text])

  const textLength = Math.max(text.length, 1)
  const waveStagger = 0.035
  const waveDuration = 1.05
  const userTransition = (transition ?? {}) as Record<string, any>

  return (
    <motion.span
      style={
        {
          "--shimmering-color": shimmeringColor,
          "--color": color,
          color: "var(--color)",
          position: "relative",
          display: "inline-block",
          perspective: "500px",
          whiteSpace: "normal",
          wordBreak: "normal",
          overflowWrap: "normal",
        } as React.CSSProperties
      }
      {...props}
    >
      {segments.map((segment, segmentIndex) => {
        if (segment.type === "space") {
          return (
            <span key={`space-${segmentIndex}`} style={{ whiteSpace: "pre" }}>
              {segment.value}
            </span>
          )
        }

        return (
          <span
            key={`word-${segmentIndex}`}
            style={{ display: "inline-block", whiteSpace: "nowrap" }}
          >
            {segment.value.split("").map((char, charIndex) => {
              const charPosition = segment.start + charIndex
              const shimmerDelay = (charPosition * duration) / textLength
              const waveDelay = charPosition * waveStagger

              return (
                <motion.span
                  key={`${char}-${charPosition}`}
                  style={{
                    display: "inline-block",
                    transformStyle: "preserve-3d",
                  }}
                  initial={{
                    ...(wave
                      ? {
                          scale: 1,
                          rotateY: 0,
                        }
                      : {}),
                    color: "var(--color)",
                  }}
                  animate={{
                    ...(wave
                      ? {
                          y: [0, -4, 0],
                          scale: [1, 1.03, 1],
                          rotateY: [0, 8, 0],
                        }
                      : {}),
                    color: ["var(--color)", "var(--shimmering-color)", "var(--color)"],
                  }}
                  transition={{
                    ...userTransition,
                    color: {
                      duration,
                      repeat: Infinity,
                      repeatType: "loop",
                      repeatDelay: text.length * 0.05,
                      delay: shimmerDelay,
                      ease: "easeInOut",
                      ...(userTransition.color ?? {}),
                    },
                    ...(wave
                      ? {
                          y: {
                            duration: waveDuration,
                            repeat: Infinity,
                            repeatType: "loop",
                            repeatDelay: 0.08,
                            delay: waveDelay,
                            ease: [0.22, 1, 0.36, 1],
                            ...(userTransition.y ?? {}),
                          },
                          scale: {
                            duration: waveDuration,
                            repeat: Infinity,
                            repeatType: "loop",
                            repeatDelay: 0.08,
                            delay: waveDelay,
                            ease: [0.22, 1, 0.36, 1],
                            ...(userTransition.scale ?? {}),
                          },
                          rotateY: {
                            duration: waveDuration,
                            repeat: Infinity,
                            repeatType: "loop",
                            repeatDelay: 0.08,
                            delay: waveDelay,
                            ease: [0.22, 1, 0.36, 1],
                            ...(userTransition.rotateY ?? {}),
                          },
                        }
                      : {}),
                  }}
                >
                  {char}
                </motion.span>
              )
            })}
          </span>
        )
      })}
    </motion.span>
  )
}

export type { ShimmeringTextProps }
