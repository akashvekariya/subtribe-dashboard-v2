"use client";

import { useState, useCallback } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DimensionDeepDivePopover } from "./DimensionDeepDivePopover";
import type {
  RadarChartData,
  DimensionAssessment,
  DimensionScores,
} from "../types";

interface DimensionRadarChartProps {
  data: RadarChartData[];
  dimensionAssessments: DimensionAssessment[];
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(217, 91%, 60%)",
  },
} as const;

/**
 * Custom tick component for clickable axis labels
 */
interface CustomTickProps {
  x: number;
  y: number;
  payload: {
    value: string;
    coordinate: number;
  };
  onClick: (dimension: string) => void;
  activeDimension: string | null;
}

function CustomTick({
  x,
  y,
  payload,
  onClick,
  activeDimension,
}: CustomTickProps) {
  const isActive = activeDimension === payload.value;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="middle"
        fill={isActive ? "#2563eb" : "#6b7280"}
        fontSize={11}
        fontWeight={isActive ? 600 : 400}
        className="cursor-pointer hover:fill-blue-600 transition-colors"
        onClick={() => onClick(payload.value)}
        style={{ textDecoration: isActive ? "underline" : "none" }}
      >
        {payload.value}
      </text>
    </g>
  );
}

/**
 * DimensionRadarChart - Interactive radar chart with clickable dimensions
 *
 * Features:
 * - Recharts RadarChart with custom styling
 * - Click on axis labels to open dimension popover
 * - Click on data points for same effect
 * - Hover tooltip for quick score view
 */
export function DimensionRadarChart({
  data,
  dimensionAssessments,
}: DimensionRadarChartProps) {
  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Create lookup for assessments by dimension name
  const assessmentLookup = dimensionAssessments.reduce(
    (acc, assessment) => {
      // Map dimension key to display name for lookup
      const dimensionKey = assessment.dimension;
      acc[dimensionKey] = assessment;
      return acc;
    },
    {} as Record<string, DimensionAssessment>
  );

  // Find the active data point
  const activeData = data.find((d) => d.focus === activeDimension);
  const activeAssessment = activeData
    ? assessmentLookup[activeData.dimension]
    : undefined;

  const handleDimensionClick = useCallback((dimensionLabel: string) => {
    setActiveDimension(dimensionLabel);
    setPopoverOpen(true);
  }, []);

  const handleChartClick = useCallback(
    (e: { activeLabel?: string }) => {
      if (e?.activeLabel) {
        handleDimensionClick(e.activeLabel);
      }
    },
    [handleDimensionClick]
  );

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="w-full cursor-pointer">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={data}
                margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                onClick={handleChartClick}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value) => [`${value}/10`, "Score"]}
                    />
                  }
                />
                <PolarGrid
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="focus"
                  tick={(props) => (
                    <CustomTick
                      {...props}
                      onClick={handleDimensionClick}
                      activeDimension={activeDimension}
                    />
                  )}
                  tickLine={false}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  fill="hsl(217, 91%, 85%)"
                  fillOpacity={0.4}
                  dot={{
                    r: 5,
                    fillOpacity: 1,
                    fill: "hsl(217, 91%, 60%)",
                    stroke: "white",
                    strokeWidth: 2,
                    className: "cursor-pointer hover:r-6 transition-all",
                  }}
                  activeDot={{
                    r: 7,
                    fill: "hsl(217, 91%, 50%)",
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Click hint */}
          <p className="text-center text-xs text-gray-400 mt-2">
            Click on a dimension for detailed analysis
          </p>
        </div>
      </PopoverTrigger>

      <PopoverContent className="p-4 w-auto" side="right" align="center">
        {activeData && (
          <DimensionDeepDivePopover
            dimension={activeData.dimension}
            score={activeData.score}
            assessment={activeAssessment}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
