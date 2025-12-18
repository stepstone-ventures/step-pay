import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  change?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, value, icon: Icon, change, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className="text-sm mt-1 text-muted-foreground">
                {change}
              </p>
            )}
            {trend && (
              <p className={`text-sm mt-1 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
