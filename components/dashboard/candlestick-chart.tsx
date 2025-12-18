import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CandlestickChartProps {
  data: Array<{ period: string; amount: number } | { date: string; amount: number }>
  title: string
}

export function CandlestickChart({ data, title }: CandlestickChartProps) {
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
  const range = maxAmount - minAmount || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const open = index > 0 ? data[index - 1].amount : item.amount
            const close = item.amount
            const high = Math.max(open, close) + item.amount * 0.1
            const low = Math.min(open, close) - item.amount * 0.1
            
            const highHeight = ((high - minAmount) / range) * 100
            const lowHeight = ((low - minAmount) / range) * 100
            const openHeight = ((open - minAmount) / range) * 100
            const closeHeight = ((close - minAmount) / range) * 100
            
            const isUp = close >= open
            const period = "period" in item ? item.period : "date" in item ? item.date : ""
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="relative w-full" style={{ height: "100%" }}>
                  {/* High-Low line */}
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 bg-muted-foreground"
                    style={{
                      width: "2px",
                      top: `${100 - highHeight}%`,
                      height: `${highHeight - lowHeight}%`
                    }}
                  />
                  {/* Candle body */}
                  <div
                    className={`absolute left-1/2 transform -translate-x-1/2 w-3/4 ${
                      isUp ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      top: `${100 - Math.max(openHeight, closeHeight)}%`,
                      height: `${Math.abs(closeHeight - openHeight)}%`,
                      minHeight: "2px"
                    }}
                    title={`${period}: O:${open.toFixed(2)} H:${high.toFixed(2)} L:${low.toFixed(2)} C:${close.toFixed(2)}`}
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
