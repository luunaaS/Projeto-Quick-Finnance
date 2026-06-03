import * as React from "react";
import { cn } from "./utils";

// Simple chart context without external dependencies
const ChartContext = React.createContext<{
  config: ChartConfig;
}>({
  config: {},
});

// Chart configuration interface
interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    theme?: {
      light?: string;
      dark?: string;
    };
  };
}

// Simple chart container component
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  const chartId = React.useId();

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
}

// Simple tooltip component (placeholder)
function ChartTooltip({ children }: { children?: React.ReactNode }) {
  return <div className="hidden">{children}</div>;
}

// Simple tooltip content component (placeholder)
function ChartTooltipContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-md",
        className,
      )}
      {...props}
    />
  );
}

// Simple legend component (placeholder)
function ChartLegend({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 pt-4">{children}</div>;
}

// Simple legend content component (placeholder)
function ChartLegendContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};