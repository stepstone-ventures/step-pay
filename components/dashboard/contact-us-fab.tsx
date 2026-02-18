"use client"

import { MessageSquareMoreIcon } from "@/components/ui/message-square-more-icon"

export function ContactUsFab() {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 md:bottom-6 md:right-6">
      <a
        href="mailto:support@steppay.com?subject=StepPay%20Support%20Request"
        aria-label="Contact StepPay support"
        className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-foreground px-2.5 text-sm font-medium text-background shadow-lg transition-opacity hover:opacity-90 sm:px-3"
      >
        <MessageSquareMoreIcon size={18} />
        Contact Us
      </a>
    </div>
  )
}
