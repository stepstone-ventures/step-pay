"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PresenceUser = {
  id: number | string;
  name: string;
  src: string;
  active?: boolean;
};

type UserPresenceAvatarProps = React.ComponentProps<"div"> & {
  users?: PresenceUser[];
  maxVisible?: number;
};

const DEFAULT_USERS: PresenceUser[] = [
  {
    id: 1,
    name: "Merchant 1",
    src: "https://pbs.twimg.com/profile_images/1602734731728142336/9Bppcs67_400x400.jpg",
    active: true,
  },
  {
    id: 2,
    name: "Merchant 2",
    src: "https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg",
    active: true,
  },
  {
    id: 3,
    name: "Merchant 3",
    src: "https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg",
    active: true,
  },
  {
    id: 4,
    name: "Merchant 4",
    src: "https://pbs.twimg.com/profile_images/1690345911149375488/wfD0Ai9j_400x400.jpg",
    active: false,
  },
  {
    id: 5,
    name: "Merchant 5",
    src: "https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg",
    active: true,
  },
];

export function UserPresenceAvatar({
  users = DEFAULT_USERS,
  maxVisible = 5,
  className,
  ...props
}: UserPresenceAvatarProps) {
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
        <span className="font-semibold text-foreground">Go Global</span>
      </p>
    </div>
  );
}
