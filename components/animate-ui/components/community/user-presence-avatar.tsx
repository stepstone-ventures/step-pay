"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProtectedComponentEnabled } from "@/lib/security/client-component-guard";

type PresenceUser = {
  id: number | string;
  name: string;
  src: string;
  active?: boolean;
  objectPosition?: string;
};

type UserPresenceAvatarProps = React.ComponentProps<"div"> & {
  users?: PresenceUser[];
  maxVisible?: number;
};

const DEFAULT_USERS: PresenceUser[] = [
  {
    id: 1,
    name: "StepPay",
    src: "/avatars/presence-1.jpg",
    active: true,
    objectPosition: "50% 50%",
  },
  {
    id: 2,
    name: "Merchant 2",
    src: "/avatars/presence-2.jpg",
    active: true,
    objectPosition: "50% 22%",
  },
  {
    id: 3,
    name: "Merchant 3",
    src: "/avatars/presence-3.jpg",
    active: true,
    objectPosition: "50% 30%",
  },
  {
    id: 4,
    name: "Merchant 4",
    src: "/avatars/presence-4.jpg",
    active: false,
    objectPosition: "45% 26%",
  },
  {
    id: 5,
    name: "Merchant 5",
    src: "/avatars/presence-5.jpg",
    active: true,
    objectPosition: "50% 26%",
  },
];

export function UserPresenceAvatar({
  users = DEFAULT_USERS,
  maxVisible = 5,
  className,
  ...props
}: UserPresenceAvatarProps) {
  const componentEnabled = useProtectedComponentEnabled();
  if (!componentEnabled) return null;

  const visibleUsers = users.slice(0, maxVisible);
  const remaining = users.length - visibleUsers.length;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/70 px-3 py-2 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="flex -space-x-3">
        {visibleUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: [0, -2, 0], scale: [1, 1.02, 1] }}
            transition={{
              opacity: { duration: 0.24, delay: index * 0.06, ease: "easeOut" },
              y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.14 },
              scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.14 },
            }}
            className="relative h-8 w-8 rounded-full border-2 border-background bg-muted shadow-sm"
          >
            <img
              src={user.src}
              alt={user.name}
              className="h-full w-full rounded-full object-cover"
              loading="lazy"
              style={{ objectPosition: user.objectPosition ?? "50% 50%" }}
            />
            {user.active ? (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border border-background bg-green-500" />
            ) : null}
          </motion.div>
        ))}
        {remaining > 0 ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground shadow-sm">
            +{remaining}
          </div>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Step Up Your Payments</span>
      </p>
    </div>
  );
}
