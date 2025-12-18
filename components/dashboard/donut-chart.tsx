import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DonutChartProps {
  data: Array<{ period: string; amount: number } | { date: string; amount: number }>
  title: string
}

export function DonutChart({ data, title }: DonutChartProps) {
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

  const total = data.reduce((sum, item) => sum + item.amount, 0)
  const radius = 80
  const innerRadius = 50
  const centerX = 150
  const centerY = 150
  let currentAngle = -90

  const segments = data.map((item, index) => {
    const percentage = (item.amount / total) * 100
    const angle = (item.amount / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    const x3 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180)
    const y3 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180)
    const x4 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180)
    const y4 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180)
    const largeArc = angle > 180 ? 1 : 0

    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`

    const colors = [
      "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
      "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"
    ]

    return {
      path,
      percentage,
      label: "period" in item ? item.period : "date" in item ? item.date : `Item ${index + 1}`,
      amount: item.amount,
      color: colors[index % colors.length]
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <div className="flex items-center gap-8">
            <svg width="300" height="300" viewBox="0 0 300 300">
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={segment.path}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div className="space-y-2">
              {segments.map((segment, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm">
                    {segment.label}: {segment.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
