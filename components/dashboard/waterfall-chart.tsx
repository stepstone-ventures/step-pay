import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WaterfallChartProps {
  data: Array<{ period: string; amount: number } | { date: string; amount: number }>
  title: string
}

export function WaterfallChart({ data, title }: WaterfallChartProps) {
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
  const minAmount = Math.min(...data.map((d) => d.amount), 0)
  const range = Math.max(maxAmount, Math.abs(minAmount)) || 1

  let cumulative = 0
  const bars = data.map((item, index) => {
    const previousCumulative = cumulative
    cumulative += item.amount
    const period = "period" in item ? item.period : "date" in item ? item.date : ""
    
    return {
      period,
      amount: item.amount,
      start: previousCumulative,
      end: cumulative,
      isPositive: item.amount >= 0
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {bars.map((bar, index) => {
            const startHeight = ((bar.start + range) / (range * 2)) * 100
            const endHeight = ((bar.end + range) / (range * 2)) * 100
            const barHeight = Math.abs(endHeight - startHeight)
            const topHeight = Math.min(startHeight, endHeight)
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="relative w-full" style={{ height: "100%" }}>
                  <div
                    className={`absolute left-1/2 transform -translate-x-1/2 w-3/4 rounded-t ${
                      bar.isPositive ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      top: `${100 - topHeight - barHeight}%`,
                      height: `${barHeight}%`,
                      minHeight: "2px"
                    }}
                    title={`${bar.period}: ${bar.amount >= 0 ? '+' : ''}${bar.amount.toLocaleString()}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground text-center truncate w-full">
                  {bar.period}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
