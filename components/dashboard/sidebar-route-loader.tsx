"use client"

import { PageSkeletonOverlay } from "@/components/ui/page-skeleton-overlay"

export function SidebarRouteLoader({ visible }: { visible: boolean }) {
  return <PageSkeletonOverlay visible={visible} desktopContentOnly variant="dashboard" />
}
