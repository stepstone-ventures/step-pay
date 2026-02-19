"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ConfettiPiece = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
  color: string
}

type ConfettiProps = React.ComponentProps<"div"> & {
  active?: boolean
}

const COLORS = ["#ff3b30", "#ff9500", "#ffcc00", "#34c759", "#0a84ff", "#5e5ce6", "#bf5af2"]

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function createPiece(width: number): ConfettiPiece {
  return {
    x: random(width * 0.05, width * 0.95),
    y: random(-50, -10),
    vx: random(-2.8, 2.8),
    vy: random(2.4, 6.8),
    size: random(4, 10),
    rotation: random(0, Math.PI * 2),
    rotationSpeed: random(-0.25, 0.25),
    life: random(120, 220),
    maxLife: random(120, 220),
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#0a84ff",
  }
}

export function Confetti({ className, active = true, ...props }: ConfettiProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pieces: ConfettiPiece[] = []
    let rafId = 0
    let intervalId: number | undefined

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawnBurst = () => {
      const count = 70
      const width = window.innerWidth
      for (let i = 0; i < count; i += 1) {
        pieces.push(createPiece(width))
      }
    }

    const tick = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      ctx.clearRect(0, 0, width, height)

      for (let i = pieces.length - 1; i >= 0; i -= 1) {
        const piece = pieces[i]
        if (!piece) continue

        piece.life -= 1
        piece.vy += 0.09
        piece.vx *= 0.995
        piece.vy *= 0.996
        piece.x += piece.vx
        piece.y += piece.vy
        piece.rotation += piece.rotationSpeed

        const alpha = Math.max(0, piece.life / piece.maxLife)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.rotation)
        ctx.fillStyle = piece.color
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6)
        ctx.restore()

        if (piece.life <= 0 || piece.y > height + 24) {
          pieces.splice(i, 1)
        }
      }

      rafId = window.requestAnimationFrame(tick)
    }

    resize()
    spawnBurst()
    intervalId = window.setInterval(spawnBurst, 700)
    rafId = window.requestAnimationFrame(tick)
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [active])

  if (!active) return null

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none fixed inset-0 z-[120]", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
