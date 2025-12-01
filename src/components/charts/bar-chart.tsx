"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

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

interface BarChartData {
  category: string
  [key: string]: number | string
}

interface BarChartProps {
  data: BarChartData[]
  config: ChartConfig
  title?: string
  description?: string
  footerText?: string
  showTrend?: boolean
  trendValue?: string
  orientation?: "horizontal" | "vertical"
  showLabels?: boolean
  className?: string
  chartHeight?: string
}

export function BarChartComponent({
  data,
  config,
  title,
  description,
  footerText,
  showTrend = false,
  trendValue = "5.2%",
  orientation = "vertical",
  showLabels = true,
  className = "",
  chartHeight = "250px",
}: BarChartProps) {
  const isVertical = orientation === "vertical"

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
          <BarChart
            accessibilityLayer
            data={data}
            layout={orientation}
            margin={{
              left: isVertical ? 60 : 10,
              right: 10,
              top: 10,
              bottom: 20,
            }}
            height={parseInt(chartHeight)}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            {isVertical ? (
              <>
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value}
                  fontSize={12}
                  width={50}
                />
                <XAxis 
                  type="number" 
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                  fontSize={12}
                />
                <YAxis 
                  type="number" 
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
              </>
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {Object.keys(config).map((key) => {
              if (key !== 'label' && key !== 'category') {
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    layout={orientation}
                    fill={`var(--color-${key})`}
                    radius={4}
                  >
                    {isVertical && showLabels && (
                      <LabelList
                        dataKey={key}
                        position="right"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    )}
                  </Bar>
                )
              }
              return null
            })}
          </BarChart>
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