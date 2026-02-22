'use client'

import * as React from 'react'
import {
  motion,
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
  type Variants,
} from '@/components/animate-ui/icons/icon'

type SignalProps = IconProps<keyof typeof animations>

const buildBar = (delay = 0) =>
  ({
    initial: { opacity: 1, pathLength: 1 },
    animate: {
      opacity: [0, 1],
      pathLength: [0, 1],
      transition: { duration: 0.3, ease: 'easeInOut', delay },
    },
  }) satisfies Variants

const animations = {
  default: {
    path1: buildBar(0),
    path2: buildBar(0.06),
    path3: buildBar(0.12),
    path4: buildBar(0.18),
    path5: buildBar(0.24),
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: buildBar(0),
    path2: buildBar(0.06),
    path3: buildBar(0.12),
    path4: buildBar(0.18),
    path5: buildBar(0.24),
  } satisfies Record<string, Variants>,
} as const

function IconComponent({ size, ...props }: SignalProps) {
  const { controls } = useAnimateIconContext()
  const variants = getVariants(animations)

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path d="M2 20h.01" variants={variants.path1} initial="initial" animate={controls} />
      <motion.path d="M7 20v-4" variants={variants.path2} initial="initial" animate={controls} />
      <motion.path d="M12 20v-8" variants={variants.path3} initial="initial" animate={controls} />
      <motion.path d="M17 20V8" variants={variants.path4} initial="initial" animate={controls} />
      <motion.path d="M22 20V4" variants={variants.path5} initial="initial" animate={controls} />
    </motion.svg>
  )
}

function Signal(props: SignalProps) {
  return <IconWrapper icon={IconComponent} {...props} />
}

export {
  animations,
  Signal,
  Signal as SignalIcon,
  type SignalProps,
  type SignalProps as SignalIconProps,
}
