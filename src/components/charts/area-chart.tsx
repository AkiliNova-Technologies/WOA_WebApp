"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface AreaChartData {
  month: string
  [key: string]: number | string
}

interface AreaChartProps {
  data: AreaChartData[]
  config: ChartConfig
  title?: string
  description?: string
  footerText?: string
  showTrend?: boolean
  trendValue?: string
  className?: string
  chartHeight?: string // Chart area height
}

export function AreaChartComponent({
  data,
  config,
  title,
  description,
  footerText,
  showTrend = false,
  trendValue = "5.2%",
  className = "",
  chartHeight = "250px", // Default chart height
}: AreaChartProps) {
  return (
    <Card className={`shadow-none border-none ${className}`}>
      {title && (
        <CardHeader className="p-0 mb-4">
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={`p-0 ${chartHeight !== "auto" ? `h-[${chartHeight}]` : "h-[250px]"}`}>
        <ChartContainer config={config} className="w-full h-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 0,
              top: 10,
              bottom: 20,
            }}
            height={parseInt(chartHeight)}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={12}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {Object.keys(config).map((key) => {
              if (key !== 'visitors' && key !== 'label' && key !== 'month') {
                return (
                  <Area
                    key={key}
                    dataKey={key}
                    type="natural"
                    fill={`url(#fill-${key})`}
                    fillOpacity={0.4}
                    stroke={`var(--color-${key})`}
                    strokeWidth={2}
                    stackId="a"
                  />
                )
              }
              return null
            })}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {(showTrend || footerText) && (
        <CardFooter className="p-0 mt-2">
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-1">
              {showTrend && (
                <div className="flex items-center gap-2 leading-none font-medium">
                  Trending up by {trendValue} this month <TrendingUp className="h-4 w-4" />
                </div>
              )}
              {footerText && (
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  {footerText}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}