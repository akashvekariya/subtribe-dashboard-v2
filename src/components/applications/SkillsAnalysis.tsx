"use client";

import React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import mockData from "@/data/mockCandidateAnalysis.json";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Application } from "@/types";
import { EvaluationContainer } from "./evaluation";

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface SkillsAnalysisProps {
  applicationId: string;
  application?: Application | null;
  jobFramework?: Record<string, unknown> | null;
  onApplicationUpdate?: (application: Application) => void;
}

/**
 * LegacySkillsAnalysis - Original mock-data based component
 * Used as fallback when no real evaluation data is available
 */
function LegacySkillsAnalysis({ applicationId }: { applicationId: string }) {
  // Find candidate data from mock JSON
  const candidateIndex = parseInt(applicationId) % mockData.candidates.length;
  const candidateData = mockData.candidates[candidateIndex];

  const {
    analysisData,
    techStack,
    experience,
    strengths,
    weaknesses,
    rank,
    overallMatch,
  } = candidateData;

  const {
    candidate: candidateExperience,
    requiredMin: requiredMinExperience,
    requiredMax: requiredMaxExperience,
  } = experience;
  const maxYears = 15;

  // Calculate if candidate meets requirement
  const meetsRequirement =
    candidateExperience >= requiredMinExperience &&
    candidateExperience <= requiredMaxExperience + 2; // Allow 2 years grace

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Top Row: Analysis Chart and Tech Stack - Side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Candidate Analysis Chart */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Candidate Analysis
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Comprehensive evaluation across key hiring criteria
                </p>
              </div>
            </div>
            <div className="p-8">
              <ChartContainer
                config={chartConfig}
                className="mx-auto max-h-[400px]"
              >
                <RadarChart data={analysisData}>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <PolarGrid
                    stroke="#d1d5db"
                    strokeWidth={1}
                    gridType="polygon"
                  />
                  <PolarAngleAxis
                    dataKey="focus"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <Radar
                    dataKey="score"
                    fill="hsl(217, 91%, 85%)"
                    fillOpacity={0.4}
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fillOpacity: 1,
                      fill: "hsl(217, 91%, 60%)",
                    }}
                  />
                </RadarChart>
              </ChartContainer>
              {/* Overall Match Description */}
              <div className="px-4 pb-4">
                <p className="text-xs text-center text-gray-600 italic">
                  {overallMatch}
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Technology Stack
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Required technologies and candidate proficiency
                </p>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {/* Must Have Skills */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Must Have Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {techStack.slice(0, 5).map((tech) => (
                      <div
                        key={tech.name}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          tech.status === "present"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : tech.status === "missing"
                              ? "bg-gray-100 text-gray-600 border border-gray-300"
                              : "bg-gray-50 text-gray-500 border border-gray-200 opacity-60"
                        }`}
                      >
                        {tech.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Good to Have Skills */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Good to Have Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {techStack.slice(5).map((tech) => (
                      <div
                        key={tech.name}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          tech.status === "present"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : tech.status === "missing"
                              ? "bg-gray-100 text-gray-600 border border-gray-300"
                              : "bg-gray-50 text-gray-500 border border-gray-200 opacity-60"
                        }`}
                      >
                        {tech.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Timeline - Full width */}
        <div
          className={`bg-white rounded-lg overflow-hidden ${
            meetsRequirement
              ? "border-2 border-blue-300"
              : "border border-gray-200"
          }`}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Experience Timeline
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Years of relevant experience comparison
                </p>
              </div>
              {meetsRequirement && (
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Required range */}
                  <div
                    className="absolute h-full bg-gray-200 opacity-60"
                    style={{
                      left: `${(requiredMinExperience / maxYears) * 100}%`,
                      width: `${((requiredMaxExperience - requiredMinExperience) / maxYears) * 100}%`,
                    }}
                  />
                  {/* Candidate experience */}
                  <div
                    className="absolute h-full bg-blue-400 rounded-r-lg transition-all"
                    style={{
                      width: `${Math.min((candidateExperience / maxYears) * 100, 100)}%`,
                    }}
                  >
                    {/* Match indicator where they overlap */}
                    {candidateExperience >= requiredMinExperience && (
                      <div
                        className="absolute h-full bg-blue-500 right-0"
                        style={{
                          width: `${
                            ((Math.min(
                              candidateExperience,
                              requiredMaxExperience
                            ) -
                              requiredMinExperience) /
                              candidateExperience) *
                            100
                          }%`,
                        }}
                      />
                    )}
                  </div>
                  {/* Year markers */}
                  <div className="absolute inset-0 flex items-center justify-between px-1">
                    {Array.from({ length: maxYears + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-px h-3 bg-gray-300"
                        title={`${i} years`}
                      />
                    ))}
                  </div>
                  {/* 15+ marker */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">
                    15+
                  </div>
                </div>

                {/* Labels */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>0 years</span>
                  <span>{maxYears} years</span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 bg-blue-400 rounded"></div>
                  <span className="text-gray-600">
                    Candidate:{" "}
                    <strong className="text-gray-900">
                      {candidateExperience}y
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 bg-gray-300 rounded"></div>
                  <span className="text-gray-600">
                    Required:{" "}
                    <strong className="text-gray-900">
                      {requiredMinExperience}-{requiredMaxExperience}y
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Match</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking and Insights */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Candidate Assessment
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  AI-powered evaluation and insights
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-right cursor-help">
                    <div className="text-2xl font-bold text-blue-600">
                      #{rank}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Job-level ranking
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    This ranking changes constantly as new candidates enter the
                    system
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-gray-600" />
                  Weaknesses
                </h4>
                <ul className="space-y-2">
                  {weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-600 mt-0.5">•</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * SkillsAnalysis - Main component that decides between real evaluation data and mock data
 *
 * When application has evaluation_json, shows the new interactive EvaluationContainer
 * Otherwise falls back to mock data for backwards compatibility
 */
export function SkillsAnalysis({
  applicationId,
  application,
  jobFramework,
  onApplicationUpdate,
}: SkillsAnalysisProps) {
  // Check if we have real evaluation data
  const hasEvaluationData = application?.evaluation_json != null;

  // Use the new EvaluationContainer when we have real data
  if (hasEvaluationData || application) {
    return (
      <EvaluationContainer
        application={application ?? null}
        jobFramework={jobFramework}
        onApplicationUpdate={onApplicationUpdate}
      />
    );
  }

  // Fallback to legacy mock-based UI
  return <LegacySkillsAnalysis applicationId={applicationId} />;
}
