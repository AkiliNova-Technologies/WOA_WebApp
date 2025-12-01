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
  showKey?: boolean; // New prop to show/hide key
  keyPosition?: "right" | "bottom"; // Position of the key
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
  showKey = true, // Default to showing key
  keyPosition = "right", // Default to right side
}: PieDonutChartProps) {
  // Calculate total for percentage display
  // const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={`shadow-none border-none ${className}`}>
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
            keyPosition === "right" ? "flex-row" : "flex-col"
          } h-full`}
        >
          {/* Chart Area */}
          <div
            className={`flex items-center justify-center ${
              showKey
                ? keyPosition === "right"
                  ? "sm:w-1/2 md:w-3/4 w-full h-full"
                  : "h-1/2"
                : "w-full h-full"
            }`}
          >
            <ChartContainer
              config={config}
              className="h-full"
              style={{ width: "100%" }}
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
          </div>

          {showKey && (
            <div
              className={`${
                keyPosition === "right" ? "w-1/4 pl-4" : "h-1/4 pt-4"
              } flex flex-col justify-center`}
            >
              <div className="space-y-4">
                {data.map((item, index) => {
                  // const percentage =
                  //   totalValue > 0
                  //     ? ((item.value / totalValue) * 100).toFixed(1)
                  //     : "0.0";
                  const color =
                    config[item.name.toLowerCase().replace(/\s+/g, "-")]
                      ?.color || item.fill;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: color.includes("var(")
                              ? `var(${
                                  color.match(/var\((.*)\)/)?.[1] || color
                                })`
                              : color,
                          }}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {/* <div className="flex items-center gap-2 ml-2">
                        <span className="font-medium">{item.value}</span>
                        <span className="text-muted-foreground text-xs">
                          ({percentage}%)
                        </span>
                      </div> */}
                    </div>
                  );
                })}

                {/* Total */}
                {/* {data.length > 0 && (
                  <div className="pt-2 mt-2 border-t">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Total</span>
                      <span>{totalValue}</span>
                    </div>
                  </div>
                )} */}
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
