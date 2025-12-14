"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LineChartProps {
  data: { period: string; amount: number; transactions: number }[]
  title: string
}

export function LineChart({ data, title }: LineChartProps) {
  const maxAmount = Math.max(...data.map((d) => d.amount))
  const maxTransactions = Math.max(...data.map((d) => d.transactions))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <div className="relative h-full w-full">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-muted-foreground pr-2">
              <span>{maxAmount.toLocaleString()}</span>
              <span>{(maxAmount / 2).toLocaleString()}</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="ml-12 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="border-t border-border"
                    style={{ height: `${100 / 3}%` }}
                  />
                ))}
              </div>

              {/* Chart line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  points={data
                    .map(
                      (d, i) =>
                        `${(i / (data.length - 1)) * 100},${
                          100 - (d.amount / maxAmount) * 100
                        }`
                    )
                    .join(" ")}
                />
              </svg>

              {/* Data points */}
              <div className="absolute inset-0 flex justify-between items-end">
                {data.map((d, i) => (
                  <div
                    key={i}
                    className="relative flex-1 flex justify-center"
                    style={{
                      height: `${(d.amount / maxAmount) * 100}%`,
                    }}
                  >
                    <div className="absolute -top-2 w-2 h-2 rounded-full bg-primary" />
                  </div>
                ))}
              </div>

              {/* X-axis labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                {data
                  .filter((_, i) => i % 3 === 0 || i === data.length - 1)
                  .map((d, i) => (
                    <span key={i}>{d.period}</span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


