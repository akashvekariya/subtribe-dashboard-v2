"use client";

import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
// Using custom card layout instead of shadcn card to maintain design consistency
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import mockData from "@/data/mockCandidateAnalysis.json";

const chartConfig = {
  required: {
    label: "Required",
    color: "hsl(var(--chart-1))",
  },
  candidate: {
    label: "Candidate",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface SkillsAnalysisProps {
  applicationId: string;
}

export function SkillsAnalysis({ applicationId }: SkillsAnalysisProps) {
  // Find candidate data from mock JSON
  // In production, this would come from API based on applicationId
  const candidateIndex = parseInt(applicationId) % mockData.candidates.length;
  const candidateData = mockData.candidates[candidateIndex];

  const { skillsData, techStack, experience, strengths, weaknesses, rank } =
    candidateData;
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
    <div className="space-y-6">
      {/* Top Row: Skills Chart and Tech Stack - Side by side on wider screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Skills Radar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Skills Comparison
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Comparing candidate skills against job requirements
            </p>
          </div>
          <div className="p-6">
            <ChartContainer
              config={chartConfig}
              className="mx-auto max-h-[400px]"
            >
              <RadarChart data={skillsData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <PolarAngleAxis dataKey="skill" />
                <PolarGrid />
                <Radar
                  dataKey="required"
                  fill="var(--color-required)"
                  fillOpacity={0.2}
                  stroke="var(--color-required)"
                  strokeWidth={2}
                />
                <Radar
                  dataKey="candidate"
                  fill="var(--color-candidate)"
                  fillOpacity={0.4}
                  stroke="var(--color-candidate)"
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>

            {/* Skill Match Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <strong className="text-gray-900">Skill Match:</strong> The
                candidate demonstrates strong proficiency in most required
                skills, with particular strength in Node.js and Python. Some
                areas like AWS and SQL could benefit from additional
                development.
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Technology Stack
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Required technologies and candidate proficiency
            </p>
          </div>
          <div className="p-6">
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
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        tech.status === "present"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : tech.status === "missing"
                            ? "bg-orange-100 text-orange-800 border border-orange-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}
                    >
                      <i
                        className={`${tech.icon} text-lg ${
                          tech.status === "present"
                            ? "text-green-700"
                            : tech.status === "missing"
                              ? "text-orange-700"
                              : "text-gray-600"
                        }`}
                      />
                      <span>{tech.name}</span>
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
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        tech.status === "present"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : tech.status === "missing"
                            ? "bg-orange-100 text-orange-800 border border-orange-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}
                    >
                      <i
                        className={`${tech.icon} text-lg ${
                          tech.status === "present"
                            ? "text-green-700"
                            : tech.status === "missing"
                              ? "text-orange-700"
                              : "text-gray-600"
                        }`}
                      />
                      <span>{tech.name}</span>
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
            ? "border-2 border-green-500"
            : "border border-gray-200"
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Experience Timeline
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Years of relevant experience comparison
              </p>
            </div>
            {meetsRequirement && (
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                {/* Required range */}
                <div
                  className="absolute h-full bg-orange-200 opacity-60"
                  style={{
                    left: `${(requiredMinExperience / maxYears) * 100}%`,
                    width: `${((requiredMaxExperience - requiredMinExperience) / maxYears) * 100}%`,
                  }}
                />
                {/* Candidate experience */}
                <div
                  className="absolute h-full bg-blue-500 rounded-r-lg transition-all"
                  style={{
                    width: `${Math.min((candidateExperience / maxYears) * 100, 100)}%`,
                  }}
                >
                  {/* Match indicator where they overlap */}
                  {candidateExperience >= requiredMinExperience && (
                    <div
                      className="absolute h-full bg-green-600 right-0"
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
                <div className="w-6 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">
                  Candidate:{" "}
                  <strong className="text-gray-900">
                    {candidateExperience}y
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-orange-200 rounded"></div>
                <span className="text-gray-600">
                  Required:{" "}
                  <strong className="text-gray-900">
                    {requiredMinExperience}-{requiredMaxExperience}y
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-green-600 rounded"></div>
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Candidate Assessment
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered evaluation and insights
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[var(--color-primary)]">
                #{rank}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Job-level ranking
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Disclaimer */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Note:</span> This ranking changes
              constantly as new candidates enter the system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Areas for Development
              </h4>
              <ul className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-600 mt-0.5">•</span>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
