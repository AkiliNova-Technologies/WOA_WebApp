"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  showYAxis?: boolean // New prop to control Y-axis visibility
  yAxisWidth?: number // Width for Y-axis
  yAxisTickCount?: number // Number of ticks on Y-axis
  yAxisLabel?: string // Label for Y-axis
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
  chartHeight = "300px", // Default chart height
  showYAxis = true, // Default to showing Y-axis
  yAxisWidth = 60, // Default Y-axis width
  yAxisTickCount = 5, // Default number of Y-axis ticks
  yAxisLabel, // Optional Y-axis label
}: AreaChartProps) {
  // Get data keys excluding metadata keys
  const dataKeys = Object.keys(config).filter(key => 
    key !== 'visitors' && key !== 'label' && key !== 'month'
  )

  // Calculate a nicely rounded maximum value for Y-axis
  const calculateNiceMaxValue = () => {
    if (!data || data.length === 0) return 100;
    
    let max = 0;
    data.forEach(item => {
      dataKeys.forEach(key => {
        const value = Number(item[key]);
        if (!isNaN(value) && value > max) {
          max = value;
        }
      });
    });
    
    // If max is 0, return a default value
    if (max === 0) return 100;
    
    // Add 10% padding
    const paddedMax = max * 1.1;
    
    // Calculate a nice rounded number
    const magnitude = Math.pow(10, Math.floor(Math.log10(paddedMax)));
    const normalized = paddedMax / magnitude;
    
    let niceNumber;
    if (normalized <= 1) niceNumber = 1;
    else if (normalized <= 2) niceNumber = 2;
    else if (normalized <= 5) niceNumber = 5;
    else niceNumber = 10;
    
    return niceNumber * magnitude;
  };

  // Calculate evenly spaced tick values from 0 to max
  const calculateTickValues = () => {
    const maxValue = calculateNiceMaxValue();
    const tickCount = yAxisTickCount;
    const tickValues = [];
    
    for (let i = 0; i < tickCount; i++) {
      const value = (maxValue / (tickCount - 1)) * i;
      tickValues.push(value);
    }
    
    return tickValues;
  };

  const maxValue = calculateNiceMaxValue();
  const yAxisDomain = [0, maxValue];
  const tickValues = calculateTickValues();
  
  // Parse the height value for the chart component
  const parsedHeight = chartHeight === "auto" ? 400 : parseInt(chartHeight.replace('px', ''));

  return (
    <Card className={`shadow-none border-none ${className}`}>
      {title && (
        <CardHeader className="p-0 mb-4">
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent 
        className="p-0"
        style={{ height: chartHeight }}
      >
        <ChartContainer config={config} className="w-full h-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 30,
              top: 10,
              bottom: 30,
            }}
            height={parsedHeight}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            
            {showYAxis && (
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={yAxisWidth}
                tickCount={yAxisTickCount}
                domain={yAxisDomain}
                fontSize={12}
                tickFormatter={(value) => {
                  // Format large numbers with K/M suffix
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  }
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}K`;
                  }
                  // Format based on the magnitude of the max value
                  if (maxValue >= 100) {
                    return Math.round(value).toString();
                  } else if (maxValue >= 10) {
                    return value.toFixed(0);
                  } else if (maxValue >= 1) {
                    return value.toFixed(1);
                  } else {
                    return value.toFixed(2);
                  }
                }}
                label={yAxisLabel ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  offset: -10,
                  style: { fontSize: 12, textAnchor: 'middle' }
                } : undefined}
                ticks={tickValues}
              />
            )}
            
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={12}
              interval={0} // Show all labels
              minTickGap={10} // Minimum gap between ticks
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            
            {/* Define gradients for each data series */}
            <defs>
              {dataKeys.map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            
            {/* Render Area for each data series */}
            {dataKeys.map((key) => (
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
            ))}
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