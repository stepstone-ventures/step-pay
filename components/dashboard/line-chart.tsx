import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LineChartProps {
  data: Array<{ period: string; amount: number } | { date: string; amount: number }>
  title: string
}

export function LineChart({ data, title }: LineChartProps) {
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

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="hsl(var(--primary))"
                className="hover:r-6 transition-all"
              />
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
