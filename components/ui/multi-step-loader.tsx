'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type MultiStepLoaderProps = {
  open: boolean
  title?: string
  description?: string
  steps: string[]
  currentStep: number
}

export function MultiStepLoader({
  open,
  title = 'Processing',
  description = 'Please wait while we complete this request.',
  steps,
  currentStep,
}: MultiStepLoaderProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/85 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[92%] max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>

            <div className="mt-5 space-y-2.5">
              {steps.map((step, index) => {
                const completed = index < currentStep
                const active = index === currentStep

                return (
                  <div
                    key={step}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
                      completed && 'border-emerald-500/35 bg-emerald-500/5',
                      active && 'border-primary/45 bg-primary/5',
                      !completed && !active && 'border-border bg-background/40',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
                        completed && 'border-emerald-500/50 text-emerald-600',
                        active && 'border-primary/50 text-primary',
                        !completed && !active && 'border-muted-foreground/40 text-muted-foreground',
                      )}
                    >
                      {completed ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : active ? (
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </span>
                    <span className={cn('text-sm', active ? 'font-medium text-foreground' : 'text-muted-foreground')}>{step}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
