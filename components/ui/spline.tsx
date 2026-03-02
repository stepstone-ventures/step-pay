"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SplineEventName =
  | "mouseDown"
  | "mouseUp"
  | "mouseHover"
  | "keyDown"
  | "keyUp"
  | "start"
  | "lookAt"
  | "follow"
  | "scroll"

type SplineApp = {
  load: (scene: string) => Promise<void>
  addEventListener: (name: SplineEventName, handler: (event: unknown) => void) => void
  removeEventListener: (name: SplineEventName, handler: (event: unknown) => void) => void
  requestRender: () => void
  setSize: (width: number, height: number) => void
  dispose: () => void
}

type SplineAppCtor = new (canvas: HTMLCanvasElement, options?: { renderOnDemand?: boolean }) => SplineApp

declare global {
  interface Window {
    Application?: SplineAppCtor
    __splineRuntimePromise?: Promise<SplineAppCtor>
  }
}

type SplineProps = Omit<React.ComponentProps<"div">, "onLoad" | "style"> & {
  scene: string
  onLoad?: (app: SplineApp) => void
  onError?: (error: unknown) => void
  renderOnDemand?: boolean
  style?: React.CSSProperties
  onSplineMouseDown?: (event: unknown) => void
  onSplineMouseUp?: (event: unknown) => void
  onSplineMouseHover?: (event: unknown) => void
  onSplineKeyDown?: (event: unknown) => void
  onSplineKeyUp?: (event: unknown) => void
  onSplineStart?: (event: unknown) => void
  onSplineLookAt?: (event: unknown) => void
  onSplineFollow?: (event: unknown) => void
  onSplineScroll?: (event: unknown) => void
}

const RUNTIME_ESM_URL = "https://esm.sh/@splinetool/runtime@1.10.47?bundle"
const RUNTIME_ESM_FALLBACK_URL = "https://esm.run/@splinetool/runtime@1.10.47"
const RUNTIME_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@splinetool/runtime@1.10.47/build/runtime.js"

function debounceWithMaxWait<T extends (...args: any[]) => void>(fn: T, delay = 50, maxWait = 100) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let maxTimer: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null

  const flush = () => {
    if (!pendingArgs) return
    const args = pendingArgs
    pendingArgs = null
    fn(...args)
  }

  return (...args: Parameters<T>) => {
    pendingArgs = args

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (maxTimer) {
        clearTimeout(maxTimer)
        maxTimer = null
      }
      flush()
    }, delay)

    if (!maxTimer) {
      maxTimer = setTimeout(() => {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }
        maxTimer = null
        flush()
      }, maxWait)
    }
  }
}

async function loadSplineRuntime(): Promise<SplineAppCtor> {
  if (typeof window === "undefined") {
    throw new Error("Spline runtime can only run in browser.")
  }

  if (window.Application) {
    return window.Application
  }

  if (!window.__splineRuntimePromise) {
    window.__splineRuntimePromise = (async () => {
      const runtimeImport = new Function(
        "url",
        "return import(/* webpackIgnore: true */ url)"
      ) as (url: string) => Promise<{
        Application?: SplineAppCtor
        default?: { Application?: SplineAppCtor }
      }>

      const getCtorFromModule = (module: {
        Application?: SplineAppCtor
        default?: { Application?: SplineAppCtor }
      }) => module.Application ?? module.default?.Application

      try {
        const module = await runtimeImport(RUNTIME_ESM_URL)
        const ctor = getCtorFromModule(module)
        if (!ctor) throw new Error("No Application export in Spline ESM module.")
        return ctor
      } catch {
        try {
          const module = await runtimeImport(RUNTIME_ESM_FALLBACK_URL)
          const ctor = getCtorFromModule(module)
          if (!ctor) throw new Error("No Application export in fallback Spline ESM module.")
          return ctor
        } catch {
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector(
              'script[data-spline-runtime="true"]'
            ) as HTMLScriptElement | null

            if (existingScript) {
              if (window.Application) {
                resolve()
                return
              }
              existingScript.addEventListener("load", () => resolve(), { once: true })
              existingScript.addEventListener(
                "error",
                () => reject(new Error("Failed loading Spline runtime script.")),
                { once: true }
              )
              return
            }

            const script = document.createElement("script")
            script.src = RUNTIME_SCRIPT_URL
            script.async = true
            script.dataset.splineRuntime = "true"
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed loading Spline runtime script."))
            document.head.appendChild(script)
          })

          if (!window.Application) {
            throw new Error("Spline runtime script loaded without Application.")
          }

          return window.Application
        }
      }
    })()
  }

  return window.__splineRuntimePromise
}

export function Spline({
  scene,
  onLoad,
  onError,
  renderOnDemand = true,
  style,
  className,
  onSplineMouseDown,
  onSplineMouseUp,
  onSplineMouseHover,
  onSplineKeyDown,
  onSplineKeyUp,
  onSplineStart,
  onSplineLookAt,
  onSplineFollow,
  onSplineScroll,
  ...props
}: SplineProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const appRef = React.useRef<SplineApp | null>(null)
  const cleanupRef = React.useRef<Array<() => void>>([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let cancelled = false
    let intersectionObserver: IntersectionObserver | null = null
    let resizeObserver: ResizeObserver | null = null

    const cleanupListeners = () => {
      cleanupRef.current.forEach((fn) => fn())
      cleanupRef.current = []
    }

    const bindEvent = (name: SplineEventName, handler?: (event: unknown) => void) => {
      if (!handler || !appRef.current) return
      const debounced = debounceWithMaxWait(handler, 50, 100)
      appRef.current.addEventListener(name, debounced)
      cleanupRef.current.push(() => appRef.current?.removeEventListener(name, debounced))
    }

    const syncSize = () => {
      if (!canvasRef.current || !appRef.current) return
      appRef.current.requestRender()
      appRef.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    }

    const initialize = async () => {
      cleanupListeners()
      appRef.current?.dispose()
      appRef.current = null
      setIsLoading(true)

      try {
        const Application = await loadSplineRuntime()
        if (cancelled) return

        const app = new Application(canvas, { renderOnDemand })
        appRef.current = app
        await app.load(scene)
        if (cancelled) return

        bindEvent("mouseDown", onSplineMouseDown)
        bindEvent("mouseUp", onSplineMouseUp)
        bindEvent("mouseHover", onSplineMouseHover)
        bindEvent("keyDown", onSplineKeyDown)
        bindEvent("keyUp", onSplineKeyUp)
        bindEvent("start", onSplineStart)
        bindEvent("lookAt", onSplineLookAt)
        bindEvent("follow", onSplineFollow)
        bindEvent("scroll", onSplineScroll)

        syncSize()
        onLoad?.(app)
      } catch (error) {
        if (!cancelled) {
          onError?.(error)
          console.error("Spline initialization error:", error)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    initialize()

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (!entry.isIntersecting) return
        syncSize()
      },
      { threshold: 0.1 }
    )
    intersectionObserver.observe(canvas)

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => syncSize())
      resizeObserver.observe(container)
    } else {
      window.addEventListener("resize", syncSize)
    }

    return () => {
      cancelled = true
      intersectionObserver?.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener("resize", syncSize)
      cleanupListeners()
      appRef.current?.dispose()
      appRef.current = null
    }
  }, [
    onError,
    onLoad,
    onSplineFollow,
    onSplineKeyDown,
    onSplineKeyUp,
    onSplineLookAt,
    onSplineMouseDown,
    onSplineMouseHover,
    onSplineMouseUp,
    onSplineScroll,
    onSplineStart,
    renderOnDemand,
    scene,
  ])

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={style}
      {...props}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      {isLoading ? <div className="pointer-events-none absolute inset-0 bg-transparent" /> : null}
    </div>
  )
}
