"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

interface PieDonutChartProps {
  data: PieChartData[];
  config: ChartConfig;
  title?: string;
  description?: string;
  footerText?: string;
  showTrend?: boolean;
  trendValue?: string;
  activeIndex?: number;
  className?: string;
  chartHeight?: string;
  chartWidth?: string;
  showKey?: boolean;
  keyPosition?: "right" | "bottom";
  keyOrientation?: "vertical" | "horizontal";
  keyAlignment?: "start" | "center" | "end";
  innerRadius?: number | string;
  outerRadius?: number | string;
  chartPadding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  labelGap?: number;
  keyItemGap?: number;
  renderKeyItem?: (
    item: PieChartData,
    index: number,
    config: ChartConfig
  ) => React.ReactNode;
  showTotal?: boolean;
  totalLabel?: string;
  showPercentage?: boolean;
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
  chartHeight = "350px",
  chartWidth = "100%",
  showKey = true,
  keyPosition = "right",
  keyOrientation = "vertical",
  keyAlignment = "center",
  innerRadius = "50%",
  outerRadius = "80%",
  chartPadding = { top: 0, right: 0, bottom: 0, left: 0 },
  showPercentage = false,
  labelGap = 16,
  keyItemGap = 4,
  renderKeyItem,
  showTotal = false,
  totalLabel = "Total",
}: PieDonutChartProps) {
  // Calculate total for percentage display
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Determine layout based on key position and orientation
  const isKeyHorizontal = keyOrientation === "horizontal";

  // For horizontal orientation, force keyPosition to bottom
  const effectiveKeyPosition = isKeyHorizontal ? "bottom" : keyPosition;

  // Calculate chart container dimensions based on key position
  const getChartContainerClass = () => {
    if (!showKey) return "w-full h-full";

    if (effectiveKeyPosition === "right") {
      return isKeyHorizontal ? "w-full h-3/4" : "w-3/4 h-full align-center";
    } else {
      return "w-full h-3/4";
    }
  };

  const getKeyContainerClass = () => {
    const alignmentClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    };

    if (effectiveKeyPosition === "right") {
      return `w-1/4 pl-${labelGap / 4} flex flex-col items-center justify-center ${
        alignmentClasses[keyAlignment]
      }`;
    } else {
      return `h-1/4 pt-${labelGap / 4} flex ${
        isKeyHorizontal ? "flex-row justify-center" : "flex-col"
      } ${alignmentClasses[keyAlignment]}`;
    }
  };

  const getKeyItemsContainerClass = () => {
    if (isKeyHorizontal) {
      return `flex ${
        keyAlignment === "center"
          ? "justify-center items-center"
          : keyAlignment === "end"
          ? "justify-end"
          : "justify-start"
      } flex-wrap gap-${keyItemGap / 4}`;
    }
    return "space-y-4";
  };

  // Default key item renderer
  const defaultRenderKeyItem = (item: PieChartData, index: number) => {
    const percentage =
      totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : "0.0";
    const color =
      config[item.name.toLowerCase().replace(/\s+/g, "-")]?.color || item.fill;

    return (
      <div
        key={index}
        className={`flex items-center align-center gap-[${keyItemGap}] ${
          isKeyHorizontal
            ? `gap-[${keyItemGap}]`
            : `justify-between gap-[${keyItemGap}]`
        } text-sm`}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-sm flex-shrink-0"
            style={{
              backgroundColor: color.includes("var(")
                ? `var(${color.match(/var\((.*)\)/)?.[1] || color})`
                : color,
            }}
          />
          <span className="truncate">{item.name}</span>
        </div>
        <div
          className={`flex items-center gap-2 ${isKeyHorizontal ? "ml-1" : "ml-16"}`}
        >
          <span className="font-medium">{item.value}</span>
          {showPercentage && (
            <span className="text-muted-foreground text-xs">
              ({percentage}%)
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`shadow-none border-none ${className}`}
      style={{ width: chartWidth }}
    >
      {title && (
        <CardHeader className="p-0 mb-4">
          {title && (
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent
        className={`p-0 ${
          chartHeight !== "auto" ? `h-[${chartHeight}]` : "h-[200px]"
        }`}
      >
        <div
          className={`flex ${
            effectiveKeyPosition === "right" ? "flex-row" : "flex-col"
          } h-full`}
        >
          {/* Chart Area */}
          <div className={getChartContainerClass()}>
            <ChartContainer
              config={config}
              className="h-full w-full"
              style={{
                padding: `${chartPadding.top}px ${chartPadding.right}px ${chartPadding.bottom}px ${chartPadding.left}px`,
              }}
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
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  strokeWidth={3}
                  activeIndex={activeIndex}
                  activeShape={({
                    outerRadius: radius = 0,
                    ...props
                  }: PieSectorDataItem) => (
                    <Sector
                      {...props}
                      outerRadius={
                        typeof radius === "number" ? radius + 5 : radius
                      }
                    />
                  )}
                />
              </PieChart>
            </ChartContainer>
          </div>

          {showKey && (
            <div className={getKeyContainerClass()}>
              <div className={getKeyItemsContainerClass()}>
                {data.map((item, index) =>
                  renderKeyItem
                    ? renderKeyItem(item, index, config)
                    : defaultRenderKeyItem(item, index)
                )}

                {/* Total */}
                {showTotal && data.length > 0 && (
                  <div
                    className={`${
                      isKeyHorizontal ? "ml-4" : "pt-2 mt-2 border-t"
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        isKeyHorizontal ? "gap-2" : "justify-between"
                      } text-sm font-medium`}
                    >
                      <span>{totalLabel}</span>
                      <span>{totalValue}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {(showTrend || footerText) && (
        <CardFooter className="p-0 mt-2">
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-1">
              {showTrend && (
                <div className="flex items-center gap-2 leading-none font-medium">
                  Trending up by {trendValue} this month{" "}
                  <TrendingUp className="h-4 w-4" />
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
  );
}
