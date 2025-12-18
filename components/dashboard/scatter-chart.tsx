import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScatterChartProps {
  data: Array<{ period: string; amount: number } | { date: string; amount: number }>
  title: string
}

export function ScatterChart({ data, title }: ScatterChartProps) {
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
  const width = 600
  const height = 250
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth
    const y = padding + chartHeight - (item.amount / maxAmount) * chartHeight
    return { x, y, amount: item.amount, label: "period" in item ? item.period : "date" in item ? item.date : "" }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <svg width={width} height={height} className="overflow-visible">
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="6"
                fill="hsl(var(--primary))"
                className="hover:r-8 transition-all"
                title={`${point.label}: ${point.amount.toLocaleString()}`}
              />
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
