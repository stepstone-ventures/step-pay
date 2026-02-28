"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

type PixelData = {
  x: number
  y: number
  color: string
}

type AnimatedPixel = PixelData & {
  r: number
}

type VanishInputProps = {
  placeholders?: string[]
  onSubmit?: (value: string) => void
  onChange?: (value: string) => void
  className?: string
}

export function VanishInput({
  placeholders = ["Ask StepPay AI anything...", "How do I reduce payment failures?", "Show payout status by date range"],
  onSubmit,
  onChange,
  className,
}: VanishInputProps) {
  const [value, setValue] = useState("")
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [animating, setAnimating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const intervalRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pixelsRef = useRef<AnimatedPixel[]>([])

  const draw = () => {
    if (!inputRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const computed = getComputedStyle(inputRef.current)
    const fontSize = Number.parseFloat(computed.getPropertyValue("font-size"))

    canvas.width = 800
    canvas.height = 800
    ctx.clearRect(0, 0, 800, 800)
    ctx.font = `${fontSize * 2}px ${computed.fontFamily}`
    ctx.fillStyle = "#FFF"
    ctx.fillText(value, 16, 40)

    const imageData = ctx.getImageData(0, 0, 800, 800)
    const raw = imageData.data
    const pixels: PixelData[] = []

    for (let y = 0; y < 800; y += 1) {
      const rowBase = 4 * y * 800
      for (let x = 0; x < 800; x += 1) {
        const i = rowBase + 4 * x
        if (raw[i] !== 0 && raw[i + 1] !== 0 && raw[i + 2] !== 0) {
          pixels.push({
            x,
            y,
            color: `rgba(${raw[i]}, ${raw[i + 1]}, ${raw[i + 2]}, ${raw[i + 3]})`,
          })
        }
      }
    }

    pixelsRef.current = pixels.map((pixel) => ({ ...pixel, r: 1 }))
  }

  const animate = (start = 0) => {
    animationFrameRef.current = window.requestAnimationFrame(() => {
      const next: AnimatedPixel[] = []
      for (const pixel of pixelsRef.current) {
        if (pixel.x < start) {
          next.push(pixel)
          continue
        }
        if (pixel.r <= 0) continue

        pixel.x += Math.random() > 0.5 ? 1 : -1
        pixel.y += Math.random() > 0.5 ? 1 : -1
        pixel.r -= 0.05 * Math.random()
        next.push(pixel)
      }
      pixelsRef.current = next

      const ctx = canvasRef.current?.getContext("2d")
      if (ctx) {
        ctx.clearRect(start, 0, 800, 800)
        for (const pixel of pixelsRef.current) {
          if (pixel.x <= start) continue
          ctx.beginPath()
          ctx.rect(pixel.x, pixel.y, pixel.r, pixel.r)
          ctx.fillStyle = pixel.color
          ctx.strokeStyle = pixel.color
          ctx.stroke()
        }
      }

      if (pixelsRef.current.length > 0) {
        animate(start - 8)
        return
      }

      setValue("")
      setAnimating(false)
      window.setTimeout(() => inputRef.current?.focus(), 100)
    })
  }

  const vanishAndSubmit = () => {
    if (!value || animating) return
    setAnimating(true)
    draw()
    onSubmit?.(value)
    const maxX = Math.max(...pixelsRef.current.map((pixel) => pixel.x))
    animate(Number.isFinite(maxX) ? maxX : 0)
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (animating) return
    onChange?.(value)
  }, [value, animating, onChange])

  useEffect(() => {
    const startCycling = () => {
      if (intervalRef.current !== null) return
      intervalRef.current = window.setInterval(() => {
        setCurrentPlaceholder((previous) => (previous + 1) % placeholders.length)
      }, 3000)
    }

    const stopCycling = () => {
      if (intervalRef.current === null) return
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        stopCycling()
        return
      }
      startCycling()
    }

    startCycling()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      stopCycling()
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [placeholders.length])

  return (
    <form
      className={cn(
        "relative mx-auto h-12 w-full max-w-xl overflow-hidden rounded-full bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200 dark:bg-zinc-800",
        value && "bg-gray-50 dark:bg-zinc-800/90",
        className
      )}
      onSubmit={(event) => {
        event.preventDefault()
        vanishAndSubmit()
      }}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "pointer-events-none absolute top-[20%] left-2 origin-top-left scale-50 pr-20 text-base invert sm:left-8 dark:invert-0",
          animating ? "opacity-100" : "opacity-0"
        )}
      />

      <input
        ref={inputRef}
        value={value}
        disabled={animating}
        type="text"
        className={cn(
          "relative z-50 size-full rounded-full border-none bg-transparent pr-20 pl-4 text-sm text-black focus:ring-0 focus:outline-none sm:pl-10 sm:text-base dark:text-white",
          animating && "text-transparent dark:text-transparent"
        )}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            vanishAndSubmit()
          }
        }}
      />

      <button
        disabled={!value || animating}
        type="submit"
        className="absolute top-1/2 right-2 z-50 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black transition duration-200 disabled:bg-gray-100 dark:bg-zinc-900 dark:disabled:bg-zinc-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 text-gray-300"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M5 12l14 0"
            style={{
              strokeDasharray: "50%",
              strokeDashoffset: value ? "0" : "50%",
              transition: "stroke-dashoffset 0.3s linear",
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </svg>
      </button>

      <div className="pointer-events-none absolute inset-0 flex items-center rounded-full">
        <AnimatePresence mode="wait">
          {!value ? (
            <motion.p
              key={currentPlaceholder}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-[calc(100%-2rem)] truncate pl-4 text-left text-sm font-normal text-neutral-500 sm:pl-10 sm:text-base dark:text-zinc-500"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  )
}
