import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StackedBarChartProps {
  data: Array<{ period: string; amount: number } | { date: string; amount: number }>
  title: string
}

export function StackedBarChart({ data, title }: StackedBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 0)
  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
            const percentage = (item.amount / total) * 100
            const period = "period" in item ? item.period : "date" in item ? item.date : ""
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="w-full relative" style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}>
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                    style={{ height: `${percentage}%` }}
                    title={`${period}: ${item.amount.toLocaleString()} (${percentage.toFixed(1)}%)`}
                  />
                </div>
                <span className="text-xs text-muted-foreground text-center truncate w-full">
                  {period}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
