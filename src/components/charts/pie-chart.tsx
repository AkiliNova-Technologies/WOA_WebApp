"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

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

interface PieChartData {
  name: string
  value: number
  fill: string
}

interface PieDonutChartProps {
  data: PieChartData[]
  config: ChartConfig
  title?: string
  description?: string
  footerText?: string
  showTrend?: boolean
  trendValue?: string
  activeIndex?: number
  className?: string
  chartHeight?: string
}

export function PieDonutChartComponent({
  data,
  config,
  title,
  description,
  footerText,
  showTrend = false,
  trendValue = "5.2%",
  activeIndex = 0,
  className = "",
  chartHeight = "200px",
}: PieDonutChartProps) {
  return (
    <Card className={`shadow-none border-none ${className}`}>
      {title && (
        <CardHeader className="p-0 mb-4">
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={`p-0 flex items-center justify-center ${chartHeight !== "auto" ? `h-[${chartHeight}]` : "h-[200px]"}`}>
        <ChartContainer
          config={config}
          className="mx-auto h-full"
          style={{ width: '100%', maxWidth: chartHeight }} // Make it square based on height
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="50%"
              outerRadius="80%"
              strokeWidth={3}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 5} />
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {(showTrend || footerText) && (
        <CardFooter className="p-0 mt-2">
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-1">
              {showTrend && (
                <div className="flex items-center gap-2 leading-only font-medium">
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