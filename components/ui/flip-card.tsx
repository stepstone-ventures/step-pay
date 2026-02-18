"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Github, Linkedin, Twitter, Star, Building2 } from "lucide-react"

export interface FlipCardData {
  name: string
  username: string
  image?: string
  bio: string
  stats: {
    following: number
    followers: number
    posts?: number
  }
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
  }
}

interface FlipCardProps {
  data: FlipCardData
  className?: string
}

export function FlipCard({ data, className }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false)

  return (
    <div
      className={cn("relative h-[400px] w-full perspective-1000", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden"
          style={{ transform: "rotateY(0deg)" }}
        >
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg">
                {data.image ? (
                  <img
                    src={data.image}
                    alt={data.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{data.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{data.name}</h3>
            <p className="text-muted-foreground mb-6">@{data.username}</p>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">{data.stats.followers}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.stats.following}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              {data.stats.posts !== undefined && (
                <div>
                  <div className="text-2xl font-bold">{data.stats.posts}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-full flex flex-col p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-3">{data.name}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{data.bio}</p>
            </div>
            {data.socialLinks && (
              <div className="flex gap-4 justify-center">
                {data.socialLinks.github && (
                  <a
                    href={data.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {data.socialLinks.twitter && (
                  <a
                    href={data.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {data.socialLinks.linkedin && (
                  <a
                    href={data.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Testimonial Flip Card Variant
export interface TestimonialFlipCardData {
  company: string
  industry: string
  testimonial: string
  rating: number
  stats?: {
    transactions?: number
    revenue?: string
    years?: number
  }
}

interface TestimonialFlipCardProps {
  data: TestimonialFlipCardData
  className?: string
}

export function TestimonialFlipCard({ data, className }: TestimonialFlipCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false)

  return (
    <div
      className={cn("relative h-[350px] w-full perspective-1000", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side - Testimonial */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden"
          style={{ transform: "rotateY(0deg)" }}
        >
          <div className="h-full flex flex-col p-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(data.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground mb-6 italic leading-relaxed flex-1">
              "{data.testimonial}"
            </p>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{data.company}</p>
                <p className="text-xs text-muted-foreground">{data.industry}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side - Stats */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg mb-4">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">{data.company}</h3>
            <p className="text-sm text-muted-foreground mb-6">{data.industry}</p>
            {data.stats && (
              <div className="space-y-3 w-full">
                {data.stats.transactions && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{data.stats.transactions.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Transactions</div>
                  </div>
                )}
                {data.stats.revenue && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{data.stats.revenue}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                )}
                {data.stats.years && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{data.stats.years}</div>
                    <div className="text-sm text-muted-foreground">Years with StepPay</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}