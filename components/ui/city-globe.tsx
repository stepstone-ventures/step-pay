"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

type CityMarker = {
  name: string
  location: [number, number]
}

type CobeMarker = {
  location: [number, number]
  size: number
}

type CobeRenderState = {
  phi: number
  theta: number
  width: number
  height: number
}

type CobeOptions = {
  width: number
  height: number
  onRender: (state: CobeRenderState) => void
  devicePixelRatio: number
  phi: number
  theta: number
  dark: number
  diffuse: number
  mapSamples: number
  mapBrightness: number
  baseColor: [number, number, number]
  markerColor: [number, number, number]
  glowColor: [number, number, number]
  markers: CobeMarker[]
}

type CobeInstance = {
  destroy: () => void
}

type CobeFactory = (canvas: HTMLCanvasElement, options: CobeOptions) => CobeInstance

declare global {
  interface Window {
    __cobeFactoryPromise?: Promise<CobeFactory>
  }
}

const COBE_ESM_URL = "https://esm.sh/cobe@0.6.5?bundle"
const COBE_ESM_FALLBACK_URL = "https://esm.run/cobe@0.6.5"
const MARKER_SIZE = 0.032

const CITY_MARKERS: CityMarker[] = [
  { name: "Lagos", location: [6.5244, 3.3792] },
  { name: "Cairo", location: [30.0444, 31.2357] },
  { name: "Johannesburg", location: [-26.2041, 28.0473] },
  { name: "Nairobi", location: [-1.2921, 36.8219] },
  { name: "Cape Town", location: [-33.9249, 18.4241] },
  { name: "Addis Ababa", location: [8.9806, 38.7578] },
  { name: "Accra", location: [5.6037, -0.187] },
  { name: "Casablanca", location: [33.5731, -7.5898] },
  { name: "Abidjan", location: [5.3599, -4.0083] },
  { name: "Dar es Salaam", location: [-6.7924, 39.2083] },
  { name: "Kigali", location: [-1.9441, 30.0619] },
  { name: "Algiers", location: [36.7538, 3.0588] },
  { name: "Tunis", location: [36.8065, 10.1815] },
  { name: "Dakar", location: [14.7167, -17.4677] },
  { name: "Luanda", location: [-8.839, 13.2894] },
  { name: "Kampala", location: [0.3476, 32.5825] },
  { name: "Maputo", location: [-25.9692, 32.5732] },
  { name: "Gaborone", location: [-24.6282, 25.9231] },
  { name: "Windhoek", location: [-22.5609, 17.0658] },
  { name: "Kinshasa", location: [-4.4419, 15.2663] },
  { name: "London", location: [51.5074, -0.1278] },
  { name: "Paris", location: [48.8566, 2.3522] },
  { name: "Berlin", location: [52.52, 13.405] },
  { name: "Madrid", location: [40.4168, -3.7038] },
  { name: "Rome", location: [41.9028, 12.4964] },
  { name: "Amsterdam", location: [52.3676, 4.9041] },
  { name: "Zurich", location: [47.3769, 8.5417] },
  { name: "Stockholm", location: [59.3293, 18.0686] },
  { name: "Vienna", location: [48.2082, 16.3738] },
  { name: "Istanbul", location: [41.0082, 28.9784] },
  { name: "Tokyo", location: [35.6762, 139.6503] },
  { name: "Shanghai", location: [31.2304, 121.4737] },
  { name: "Beijing", location: [39.9042, 116.4074] },
  { name: "Singapore", location: [1.3521, 103.8198] },
  { name: "Seoul", location: [37.5665, 126.978] },
  { name: "Mumbai", location: [19.076, 72.8777] },
  { name: "Delhi", location: [28.6139, 77.209] },
  { name: "Dubai", location: [25.2048, 55.2708] },
  { name: "Hong Kong", location: [22.3193, 114.1694] },
  { name: "Jakarta", location: [-6.2088, 106.8456] },
  { name: "Sao Paulo", location: [-23.5558, -46.6396] },
  { name: "Buenos Aires", location: [-34.6037, -58.3816] },
  { name: "Rio de Janeiro", location: [-22.9068, -43.1729] },
  { name: "Santiago", location: [-33.4489, -70.6693] },
  { name: "Lima", location: [-12.0464, -77.0428] },
  { name: "Bogota", location: [4.711, -74.0721] },
  { name: "Medellin", location: [6.2442, -75.5812] },
  { name: "Quito", location: [-0.1807, -78.4678] },
  { name: "Montevideo", location: [-34.9011, -56.1645] },
  { name: "Caracas", location: [10.4806, -66.9036] },
  { name: "New York City", location: [40.7128, -74.006] },
  { name: "Los Angeles", location: [34.0522, -118.2437] },
  { name: "Chicago", location: [41.8781, -87.6298] },
  { name: "Toronto", location: [43.6532, -79.3832] },
  { name: "Mexico City", location: [19.4326, -99.1332] },
  { name: "San Francisco", location: [37.7749, -122.4194] },
  { name: "Washington, D.C.", location: [38.9072, -77.0369] },
  { name: "Houston", location: [29.7604, -95.3698] },
  { name: "Miami", location: [25.7617, -80.1918] },
  { name: "Vancouver", location: [49.2827, -123.1207] },
]

const BASE_CONFIG: Omit<CobeOptions, "width" | "height" | "onRender" | "dark" | "mapBrightness" | "baseColor" | "markerColor" | "glowColor"> = {
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  diffuse: 0.4,
  mapSamples: 16000,
  markers: CITY_MARKERS.map((marker) => ({ location: marker.location, size: MARKER_SIZE })),
}

async function loadCobeFactory(): Promise<CobeFactory> {
  if (typeof window === "undefined") {
    throw new Error("Cobe can only run in browser.")
  }

  if (!window.__cobeFactoryPromise) {
    window.__cobeFactoryPromise = (async () => {
      const runtimeImport = new Function(
        "url",
        "return import(/* webpackIgnore: true */ url)"
      ) as (url: string) => Promise<{ default?: CobeFactory }>

      try {
        const module = await runtimeImport(COBE_ESM_URL)
        if (!module.default) {
          throw new Error("Missing default export from cobe module.")
        }
        return module.default
      } catch {
        const fallback = await runtimeImport(COBE_ESM_FALLBACK_URL)
        if (!fallback.default) {
          throw new Error("Missing default export from fallback cobe module.")
        }
        return fallback.default
      }
    })()
  }

  return window.__cobeFactoryPromise
}

type CityGlobeProps = {
  className?: string
}

export function CityGlobe({ className }: CityGlobeProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const globeRef = React.useRef<CobeInstance | null>(null)
  const phiRef = React.useRef(0)
  const widthRef = React.useRef(0)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false

    const onResize = () => {
      widthRef.current = canvas.offsetWidth
    }

    const onRender = (state: CobeRenderState) => {
      phiRef.current += 0.005
      state.phi = phiRef.current
      state.theta = 0.3
      state.width = widthRef.current * 2
      state.height = widthRef.current * 2
    }

    window.addEventListener("resize", onResize)
    onResize()

    loadCobeFactory()
      .then((createGlobe) => {
        if (cancelled) return

        globeRef.current = createGlobe(canvas, {
          ...BASE_CONFIG,
          width: widthRef.current * 2,
          height: widthRef.current * 2,
          onRender,
          dark: isDark ? 1 : 0,
          mapBrightness: isDark ? 0.75 : 1.2,
          baseColor: isDark ? [0.16, 0.2, 0.27] : [1, 1, 1],
          markerColor: [251 / 255, 100 / 255, 21 / 255],
          glowColor: isDark ? [0.55, 0.62, 0.75] : [1.2, 1.2, 1.2],
        })

        canvas.style.opacity = "1"
      })
      .catch(() => {
        canvas.style.opacity = "1"
      })

    return () => {
      cancelled = true
      globeRef.current?.destroy()
      globeRef.current = null
      window.removeEventListener("resize", onResize)
    }
  }, [isDark])

  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[760px] pointer-events-none touch-none select-none",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none size-full opacity-0 transition-opacity duration-700 ease-out [contain:layout_paint_size]"
        aria-label="StepPay global coverage globe"
      />
    </div>
  )
}
