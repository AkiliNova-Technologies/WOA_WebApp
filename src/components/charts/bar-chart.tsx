"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BarChartData {
  [key: string]: number | string;
}

interface BarChartComponentProps {
  // Data & Configuration
  data?: BarChartData[]; // Make data optional

  // Card Content
  title?: string;
  description?: string;
  footerText?: string;

  // Chart Behavior
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  showTrend?: boolean;
  trendValue?: string;
  showTooltip?: boolean;
  showGrid?: boolean;

  // Styling
  className?: string;
  chartHeight?: number;
  barRadius?: number;
  barSize?: number;
  barColor?: string;
  gridStrokeDasharray?: string;

  // Data Mapping
  categoryKey?: string;
  valueKey?: string;

  // Axis Configuration
  yAxisWidth?: number;
  xAxisHeight?: number;
  hideYAxis?: boolean;
  hideXAxis?: boolean;

  // Chart Margins
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export function BarChartComponent({
  // Data & Configuration
  data = [], // Provide default empty array

  // Card Content
  title,
  description,
  footerText,

  // Chart Behavior
  orientation = "vertical",
  showLabels = false,
  showTrend = false,
  trendValue = "5.2%",
  showTooltip = true,
  showGrid = true,

  // Styling
  className = "",
  chartHeight = 350,
  barRadius = 4,
  barSize = 30,
  barColor = "#4CAF50",
  gridStrokeDasharray = "3 3",

  // Data Mapping
  categoryKey = "category",
  valueKey = "value",

  // Axis Configuration
  yAxisWidth = 150,
  xAxisHeight = 40,
  hideYAxis = false,
  hideXAxis = false,

  // Chart Margins
  margin,
}: BarChartComponentProps) {
  // Check for empty data
  const isEmpty = !data || data.length === 0;

  // Default margins based on orientation
  const defaultMargins = {
    top: 20,
    right: 30,
    left: orientation === "vertical" ? 100 : 10,
    bottom: 20,
  };

  const chartMargins = { ...defaultMargins, ...margin };

  const renderVerticalChart = () => (
    <RechartsBarChart data={data} layout="vertical" margin={chartMargins}>
      {showGrid && (
        <CartesianGrid
          strokeDasharray={gridStrokeDasharray}
          horizontal={false}
        />
      )}

      {/* X Axis (Value Axis) */}
      {!hideXAxis && (
        <XAxis type="number" axisLine={false} tickLine={false} fontSize={12} />
      )}

      {/* Y Axis (Category Axis) */}
      {!hideYAxis && (
        <YAxis
          type="category"
          dataKey={categoryKey}
          width={yAxisWidth}
          axisLine={false}
          tickLine={false}
          fontSize={12}
        />
      )}

      {showTooltip && <Tooltip />}

      <Bar
        dataKey={valueKey}
        fill={barColor}
        radius={barRadius}
        barSize={barSize}
      >
        {showLabels && (
          <LabelList
            dataKey={valueKey}
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
          />
        )}
      </Bar>
    </RechartsBarChart>
  );

  const renderHorizontalChart = () => (
    <RechartsBarChart data={data} margin={chartMargins}>
      {showGrid && (
        <CartesianGrid strokeDasharray={gridStrokeDasharray} vertical={false} />
      )}

      {/* X Axis (Category Axis) */}
      {!hideXAxis && (
        <XAxis
          dataKey={categoryKey}
          type="category"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          height={xAxisHeight}
        />
      )}

      {/* Y Axis (Value Axis) */}
      {!hideYAxis && (
        <YAxis type="number" axisLine={false} tickLine={false} fontSize={12} />
      )}

      {showTooltip && <Tooltip />}

      <Bar
        dataKey={valueKey}
        fill={barColor}
        radius={barRadius}
        barSize={barSize}
      >
        {showLabels && (
          <LabelList
            dataKey={valueKey}
            position="top"
            offset={8}
            className="fill-foreground"
            fontSize={12}
          />
        )}
      </Bar>
    </RechartsBarChart>
  );

  // Handle empty data state
  if (isEmpty) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader className="pb-2">
            {title && <CardTitle className="text-lg">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}

        <CardContent className="pt-0">
          <div
            style={{ height: chartHeight, width: "100%" }}
            className="flex items-center justify-center text-muted-foreground"
          >
            No data available
          </div>
        </CardContent>

        {(showTrend || footerText) && (
          <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
            {showTrend && (
              <div className="flex gap-2 leading-none font-medium">
                Trending up by {trendValue} this month{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
            )}
            {footerText && (
              <div className="text-muted-foreground leading-none">
                {footerText}
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="pt-0">
        <div style={{ height: chartHeight, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            {orientation === "vertical"
              ? renderVerticalChart()
              : renderHorizontalChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>

      {(showTrend || footerText) && (
        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          {showTrend && (
            <div className="flex gap-2 leading-none font-medium">
              Trending up by {trendValue} this month{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
          )}
          {footerText && (
            <div className="text-muted-foreground leading-none">
              {footerText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// Interface for SimpleBarChart
interface SimpleBarChartProps {
  data: BarChartData[];
  title?: string;
  description?: string;
  orientation?: "horizontal" | "vertical";
  chartHeight?: number;
  barColor?: string;
  barRadius?: number;
  categoryKey?: string;
  valueKey?: string;
  yAxisWidth?: number;
  showLabels?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  hideXAxis?: boolean;
  showTrend?: boolean;
  trendValue?: string;
  footerText?: string;
}

// Simplified version for your use case
export function SimpleBarChart({
  data,
  title,
  description,
  orientation = "vertical",
  chartHeight = 350,
  barColor = "#4CAF50",
  barRadius = 8,
  categoryKey = "category",
  valueKey = "value",
  yAxisWidth = 150,
  showLabels = false,
  showTooltip = true,
  showGrid = true,
  hideXAxis = true,
  showTrend = false,
  trendValue = "5.2%",
  footerText,
}: SimpleBarChartProps) {
  return (
    <BarChartComponent
      data={data}
      title={title}
      description={description}
      orientation={orientation}
      chartHeight={chartHeight}
      barColor={barColor}
      barRadius={barRadius}
      categoryKey={categoryKey}
      valueKey={valueKey}
      yAxisWidth={yAxisWidth}
      showLabels={showLabels}
      showTooltip={showTooltip}
      showGrid={showGrid}
      hideXAxis={hideXAxis}
      showTrend={showTrend}
      trendValue={trendValue}
      footerText={footerText}
    />
  );
}
