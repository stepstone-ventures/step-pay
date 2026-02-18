'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

// Small local helper type: many component libraries export a `WithAsChild` helper
// but this project doesn't have that module at the path used previously. A
// lightweight local version is sufficient for this component.
type WithAsChild<T> = T & { asChild?: boolean; children?: React.ReactNode };

type LiquidButtonProps = WithAsChild<
  HTMLMotionProps<'button'> & {
    delay?: string;
    fillHeight?: string;
    hoverScale?: number;
    tapScale?: number;
  }
>;

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps & { children?: React.ReactNode; className?: string }>(
  (
    {
      children,
      className,
      delay = '0.3s',
      fillHeight = '3px',
      hoverScale = 1.05,
      tapScale = 0.95,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const { style: userStyle, ...restProps } = props as any;
    const Component = asChild ? Slot : motion.button;
    const mergedStyle = {
      ['--liquid-button-fill-width' as any]: '-1%',
      ['--liquid-button-fill-height' as any]: fillHeight,
      ['--liquid-button-delay' as any]: '0s',
      ['--liquid-button-color' as any]: 'var(--liquid-fill)',
      ['--liquid-button-background-color' as any]: 'var(--liquid-bg)',
      background:
        'linear-gradient(var(--liquid-button-color, #000000) 0 0) no-repeat calc(200% - var(--liquid-button-fill-width, -1%)) 100% / 200% var(--liquid-button-fill-height, 0.2em)',
      backgroundColor: 'var(--liquid-button-background-color, #ffffff)',
      transition: `background ${delay} var(--liquid-button-delay, 0s), color ${delay} ${delay}, background-position ${delay} calc(${delay} - var(--liquid-button-delay, 0s))`,
      ...(userStyle || {}),
    } as any;

    return (
      <Component
        ref={ref as any}
        className={cn(
          'liquid-button relative inline-flex items-center justify-center overflow-hidden rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        whileTap={{ scale: tapScale }}
        whileHover={{
          scale: hoverScale,
          // animate CSS variables for the liquid fill
          ['--liquid-button-fill-width' as any]: '100%',
          ['--liquid-button-fill-height' as any]: '100%',
          ['--liquid-button-delay' as any]: delay,
          transition: {
            ['--liquid-button-fill-width' as any]: { duration: 0 },
            ['--liquid-button-fill-height' as any]: { duration: 0 },
            ['--liquid-button-delay' as any]: { duration: 0 },
          },
        }}
        style={mergedStyle}
        {...(restProps as any)}
      >
        {children}
      </Component>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';

export { LiquidButton, type LiquidButtonProps };
