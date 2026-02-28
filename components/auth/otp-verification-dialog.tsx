"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const OTP_LENGTH = 6

type OtpVerificationDialogProps = {
  email: string
  error?: string | null
  isVerifying?: boolean
  onComplete: (code: string) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  title?: string
}

function emptyDigits() {
  return Array.from({ length: OTP_LENGTH }, () => "")
}

export function OtpVerificationDialog({
  email,
  error,
  isVerifying = false,
  onComplete,
  onOpenChange,
  open,
  title = "Enter Verification Code",
}: OtpVerificationDialogProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [digits, setDigits] = useState<string[]>(emptyDigits)
  const [lastSubmittedCode, setLastSubmittedCode] = useState("")

  const joinedCode = useMemo(() => digits.join(""), [digits])

  const focusInput = (index: number) => {
    if (index < 0 || index >= OTP_LENGTH) return
    const input = inputRefs.current[index]
    if (!input) return
    input.focus()
    input.select()
  }

  useEffect(() => {
    if (!open) return
    setDigits(emptyDigits())
    setLastSubmittedCode("")
    const timeout = window.setTimeout(() => {
      focusInput(0)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [open])

  useEffect(() => {
    if (!open || isVerifying) return
    if (joinedCode.length !== OTP_LENGTH || digits.some((digit) => digit.length !== 1)) return
    if (joinedCode === lastSubmittedCode) return
    setLastSubmittedCode(joinedCode)
    onComplete(joinedCode)
  }, [digits, isVerifying, joinedCode, lastSubmittedCode, onComplete, open])

  useEffect(() => {
    if (!open) return
    if (digits.some((digit) => digit.length !== 1) && lastSubmittedCode) {
      setLastSubmittedCode("")
    }
  }, [digits, lastSubmittedCode, open])

  const updateDigits = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "")
    if (!sanitized) {
      setDigits((prev) => {
        const next = [...prev]
        next[index] = ""
        return next
      })
      return
    }

    setDigits((prev) => {
      const next = [...prev]
      let pointer = index
      for (const char of sanitized) {
        if (pointer >= OTP_LENGTH) break
        next[pointer] = char
        pointer += 1
      }
      return next
    })

    const nextIndex = Math.min(index + sanitized.length, OTP_LENGTH - 1)
    focusInput(nextIndex)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 sm:rounded-2xl" showCloseButton={!isVerifying}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              aria-label={`Verification code digit ${index + 1}`}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              className={cn(
                "h-12 w-11 rounded-xl border bg-background text-center text-lg font-semibold text-foreground outline-none transition-all",
                "focus:border-primary focus:ring-2 focus:ring-primary/25",
                error ? "border-destructive" : "border-border/70"
              )}
              disabled={isVerifying}
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              onChange={(event) => {
                updateDigits(index, event.target.value)
              }}
              onFocus={(event) => event.currentTarget.select()}
              onKeyDown={(event) => {
                if (event.key === "Backspace") {
                  if (digits[index]) {
                    setDigits((prev) => {
                      const next = [...prev]
                      next[index] = ""
                      return next
                    })
                    return
                  }

                  if (index > 0) {
                    setDigits((prev) => {
                      const next = [...prev]
                      next[index - 1] = ""
                      return next
                    })
                    focusInput(index - 1)
                  }
                  return
                }

                if (event.key === "ArrowLeft") {
                  event.preventDefault()
                  focusInput(index - 1)
                  return
                }

                if (event.key === "ArrowRight") {
                  event.preventDefault()
                  focusInput(index + 1)
                  return
                }

                if (!/^\d$/.test(event.key) && event.key.length === 1) {
                  event.preventDefault()
                }
              }}
              onPaste={(event) => {
                event.preventDefault()
                updateDigits(index, event.clipboardData.getData("text"))
              }}
              type="text"
              value={digit}
            />
          ))}
        </div>

        {isVerifying ? (
          <p className="text-center text-sm text-muted-foreground">Verifying code...</p>
        ) : (
          <p className="text-center text-xs text-muted-foreground">Verification starts automatically after all 6 digits.</p>
        )}

        {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      </DialogContent>
    </Dialog>
  )
}
