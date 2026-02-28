'use client'

import * as React from 'react'
import { motion, useAnimationControls, type AnimationControls, type SVGMotionProps, type Variants } from 'framer-motion'

type AnimationMap = Record<string, Record<string, Variants>>

type IconProps<TAnimation extends string = string> = Omit<SVGMotionProps<SVGSVGElement>, 'animate'> & {
  size?: number
  animate?: TAnimation
  startOnMount?: boolean
  animationTrigger?: number
  loop?: boolean
}

type IconComponent<TAnimation extends string> = (props: IconProps<TAnimation>) => React.ReactNode

type IconWrapperProps<TAnimation extends string> = Omit<IconProps<TAnimation>, 'animate'> & {
  icon: IconComponent<TAnimation>
  animate?: TAnimation
}

type AnimateIconContextValue = {
  controls: AnimationControls
  animationName: string
}

const AnimateIconContext = React.createContext<AnimateIconContextValue | null>(null)

function useAnimateIconContext() {
  const context = React.useContext(AnimateIconContext)
  if (!context) {
    throw new Error('useAnimateIconContext must be used within IconWrapper')
  }
  return context
}

function getVariants<TAnimations extends AnimationMap>(animations: TAnimations) {
  const { animationName } = useAnimateIconContext()
  const defaultKey = 'default' in animations ? 'default' : Object.keys(animations)[0]
  const activeKey = animationName in animations ? animationName : defaultKey

  return animations[activeKey]
}

function IconWrapper<TAnimation extends string>({
  icon: Icon,
  size = 20,
  animate = 'default' as TAnimation,
  startOnMount = true,
  animationTrigger,
  loop,
  ...props
}: IconWrapperProps<TAnimation>) {
  const controls = useAnimationControls()
  const previousTriggerRef = React.useRef(animationTrigger)

  React.useEffect(() => {
    let isMounted = true
    const hasManualTrigger = typeof animationTrigger === 'number'
    const triggerChanged = previousTriggerRef.current !== animationTrigger
    previousTriggerRef.current = animationTrigger

    const shouldRun = startOnMount || (hasManualTrigger && triggerChanged)
    if (!shouldRun) {
      controls.set('initial')
      return () => {
        isMounted = false
        controls.stop()
      }
    }

    const runAnimation = async () => {
      controls.set('initial')

      const shouldLoop = loop ?? (startOnMount && String(animate).includes('loop'))
      if (shouldLoop) {
        while (isMounted) {
          await controls.start('animate')
          if (!isMounted) break
          controls.set('initial')
        }
        return
      }

      await controls.start('animate')
    }

    void runAnimation()

    return () => {
      isMounted = false
      controls.stop()
    }
  }, [animate, animationTrigger, controls, loop, startOnMount])

  return (
    <AnimateIconContext.Provider
      value={{
        controls,
        animationName: String(animate),
      }}
    >
      <Icon size={size} animate={animate} {...props} />
    </AnimateIconContext.Provider>
  )
}

export {
  motion,
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
  type Variants,
}
