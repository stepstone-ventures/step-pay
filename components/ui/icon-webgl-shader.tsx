"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"

type IconWebglShaderProps = {
  size?: number
  strokeWidth?: number
  iconSize?: number
  innerTop?: string
  innerBottom?: string
  innerShadow?: string
  iconColor?: string
  iconSvg?: string
  icon?: React.ReactNode
  className?: string
}

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

const importFromUrl = (url: string) => {
  const importer = new Function("moduleUrl", "return import(moduleUrl)") as (moduleUrl: string) => Promise<unknown>
  return importer(url)
}

function InlineSVG({ src, size, color }: { src?: string; size: number; color: string }) {
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    if (!src) {
      setSvg(null)
      return
    }

    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        const normalized = text
          .replace(/stroke="(?!none).*?"/g, 'stroke="currentColor"')
          .replace(/fill="(?!none).*?"/g, 'fill="currentColor"')
        setSvg(normalized)
      })
      .catch(() => {
        setSvg(null)
      })
  }, [src])

  if (!svg) return null

  return (
    <div
      style={{
        width: size,
        height: size,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default function IconWebglShader({
  size = 220,
  strokeWidth = 3,
  iconSize = 72,
  innerTop = "#1c1c1c",
  innerBottom = "#000000",
  innerShadow = "inset 0 1px 4px rgba(255,255,255,0.1), inset 0 -6px 12px rgba(0,0,0,0.6)",
  iconColor = "#8a8a8a",
  iconSvg,
  icon,
  className,
}: IconWebglShaderProps) {
  const shaderRef = useRef<HTMLDivElement | null>(null)
  const maskId = React.useId()
  const hasCustomIcon = typeof iconSvg === "string" && iconSvg.trim().length > 0

  useEffect(() => {
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

  const radius = size / 2
  const ringRadius = radius - strokeWidth / 2

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-block",
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="black" />
            <circle cx={radius} cy={radius} r={ringRadius} fill="none" stroke="white" strokeWidth={strokeWidth} />
          </mask>
        </defs>
      </svg>

      <div
        ref={shaderRef}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          filter: "contrast(1.4) brightness(1.2)",
          WebkitMask: `url(#${maskId})`,
          mask: `url(#${maskId})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: strokeWidth,
          borderRadius: "50%",
          background: `linear-gradient(180deg, ${innerTop}, ${innerBottom})`,
          boxShadow: innerShadow,
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: iconSize,
          height: iconSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {hasCustomIcon ? (
          <InlineSVG src={iconSvg} size={iconSize} color={iconColor} />
        ) : icon ? (
          icon
        ) : (
          <svg viewBox="0 0 1024 1024" width="100%" height="100%" fill="currentColor" style={{ transform: "rotate(-45deg)" }}>
            <path d="M843.968 896a51.072 51.072 0 0 1-51.968-52.032V232H180.032A51.072 51.072 0 0 1 128 180.032c0-29.44 22.528-52.032 52.032-52.032h663.936c29.44 0 52.032 22.528 52.032 52.032v663.936c0 29.44-22.528 52.032-52.032 52.032z" />
            <path d="M180.032 896a49.92 49.92 0 0 1-36.48-15.616c-20.736-20.8-20.736-53.76 0-72.832L807.616 143.616c20.864-20.8 53.76-20.8 72.832 0 20.8 20.8 20.8 53.76 0 72.768L216.384 880.384a47.232 47.232 0 0 1-36.352 15.616z" />
          </svg>
        )}
      </div>
    </div>
  )
}
