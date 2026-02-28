"use client"

import * as React from "react"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { useProtectedComponentEnabled } from "@/lib/security/client-component-guard"

type ShaderModule = {
  liquidMetalFragmentShader: unknown
  ShaderMount: new (
    element: HTMLElement,
    fragmentShader: unknown,
    uniforms?: Record<string, number>,
    undefinedValue?: undefined,
    devicePixelRatio?: number
  ) => {
    destroy?: () => void
  }
}

type HaloAssistantButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  className?: string
}

const importFromUrl = (url: string) => {
  return import(/* webpackIgnore: true */ url)
}

const BUTTON_SIZE = 40
const RING_STROKE = 2.4
const OUTER_RADIUS = 12

export function HaloAssistantButton({ className, type = "button", ...props }: HaloAssistantButtonProps) {
  const componentEnabled = useProtectedComponentEnabled()
  if (!componentEnabled) return null

  const shaderRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    let destroyed = false
    let mount: { destroy?: () => void } | null = null

    const setupShader = async () => {
      if (!shaderRef.current) return
      try {
        const module = (await importFromUrl("https://esm.sh/@paper-design/shaders")) as ShaderModule
        if (destroyed || !shaderRef.current) return

        mount = new module.ShaderMount(
          shaderRef.current,
          module.liquidMetalFragmentShader,
          {
            u_repetition: 1.6,
            u_softness: 0.45,
            u_scale: 1.6,
            u_angle: 120,
            u_shiftRed: 0.35,
            u_shiftBlue: 0.35,
            u_distortion: 0,
            u_contour: 0,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          1
        )
      } catch {
        // Keep static structure if shader library fails to load.
      }
    }

    void setupShader()

    return () => {
      destroyed = true
      mount?.destroy?.()
    }
  }, [])

  const inset = Math.ceil(RING_STROKE)
  const innerRadius = Math.max(8, OUTER_RADIUS - inset)

  return (
    <span
      className={cn("relative inline-flex align-middle", className)}
      style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
    >
      <div
        ref={shaderRef}
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: OUTER_RADIUS,
          background: "linear-gradient(135deg, #f4f5fa 0%, #8a8f9a 48%, #eef0f5 100%)",
          filter: "contrast(1.4) brightness(1.2)",
          overflow: "hidden",
        }}
      />

      <button
        type={type}
        className="absolute z-[1] inline-flex items-center justify-center bg-secondary text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          top: inset,
          right: inset,
          bottom: inset,
          left: inset,
          borderRadius: innerRadius,
        }}
        {...props}
      >
        AI
      </button>
    </span>
  )
}
