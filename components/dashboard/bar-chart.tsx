import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BarChartProps {
  data: Array<{ period: string; amount: number } | { date: string; amount: number }>
  title: string
}

export function BarChart({ data, title }: BarChartProps) {
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

  // Get the maximum amount for scaling
  const maxAmount = Math.max(...data.map((d) => d.amount), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
            const period = "period" in item ? item.period : "date" in item ? item.date : ""
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                  style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
                  title={`${period}: ${item.amount.toLocaleString()}`}
                />
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
