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

type MenuProps = IconProps<keyof typeof animations>

const timeline = {
  initial: { opacity: 1, pathLength: 1 },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
}

const animations = {
  default: {
    path1: {
      ...timeline,
      animate: {
        ...timeline.animate,
        transition: { duration: 0.25, ease: 'easeInOut' },
      },
    },
    path2: {
      ...timeline,
      animate: {
        ...timeline.animate,
        transition: { duration: 0.25, ease: 'easeInOut', delay: 0.08 },
      },
    },
    path3: {
      ...timeline,
      animate: {
        ...timeline.animate,
        transition: { duration: 0.25, ease: 'easeInOut', delay: 0.16 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      ...timeline,
      animate: {
        ...timeline.animate,
        transition: { duration: 0.35, ease: 'easeInOut' },
      },
    },
    path2: {
      ...timeline,
      animate: {
        ...timeline.animate,
        transition: { duration: 0.35, ease: 'easeInOut', delay: 0.08 },
      },
    },
    path3: {
      ...timeline,
      animate: {
        ...timeline.animate,
        transition: { duration: 0.35, ease: 'easeInOut', delay: 0.16 },
      },
    },
  } satisfies Record<string, Variants>,
} as const

function IconComponent({ size, ...props }: MenuProps) {
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
      <motion.path d="M4 6h16" variants={variants.path1} initial="initial" animate={controls} />
      <motion.path d="M4 12h16" variants={variants.path2} initial="initial" animate={controls} />
      <motion.path d="M4 18h16" variants={variants.path3} initial="initial" animate={controls} />
    </motion.svg>
  )
}

function Menu(props: MenuProps) {
  return <IconWrapper icon={IconComponent} {...props} />
}

export {
  animations,
  Menu,
  Menu as MenuIcon,
  type MenuProps,
  type MenuProps as MenuIconProps,
}
