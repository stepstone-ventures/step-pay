"use client"

import * as React from "react"

export type UseIsInViewOptions = {
  inView?: boolean
  inViewMargin?: string
  inViewOnce?: boolean
}

export const useIsInView = <T extends HTMLElement>(
  externalRef: React.Ref<T> | undefined,
  { inView = false, inViewMargin = "0px", inViewOnce = true }: UseIsInViewOptions
) => {
  const localRef = React.useRef<T | null>(null)
  const [isInView, setIsInView] = React.useState(inView)

  const mergedRef = React.useCallback(
    (node: T | null) => {
      localRef.current = node

      if (!externalRef) return
      if (typeof externalRef === "function") {
        externalRef(node)
        return
      }

      ;(externalRef as React.MutableRefObject<T | null>).current = node
    },
    [externalRef]
  )

  React.useEffect(() => {
    if (inView) {
      setIsInView(true)
      return
    }

    const node = localRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return

        if (entry.isIntersecting) {
          setIsInView(true)
          if (inViewOnce) observer.disconnect()
        } else if (!inViewOnce) {
          setIsInView(false)
        }
      },
      { rootMargin: inViewMargin, threshold: 0.1 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [inView, inViewMargin, inViewOnce])

  return { ref: mergedRef, isInView }
}
