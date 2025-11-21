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

// Fake data for demo
const skillsData = [
  { skill: "React", required: 90, candidate: 85 },
  { skill: "TypeScript", required: 80, candidate: 75 },
  { skill: "Node.js", required: 70, candidate: 80 },
  { skill: "SQL", required: 75, candidate: 60 },
  { skill: "AWS", required: 65, candidate: 50 },
  { skill: "Python", required: 60, candidate: 70 },
];

const techStack = [
  { name: "React", icon: "devicon-react-original", status: "present" },
  { name: "TypeScript", icon: "devicon-typescript-plain", status: "present" },
  { name: "Node.js", icon: "devicon-nodejs-plain", status: "present" },
  { name: "PostgreSQL", icon: "devicon-postgresql-plain", status: "present" },
  {
    name: "AWS",
    icon: "devicon-amazonwebservices-plain-wordmark",
    status: "uncertain",
  },
  { name: "Docker", icon: "devicon-docker-plain", status: "missing" },
  { name: "GraphQL", icon: "devicon-graphql-plain", status: "missing" },
  { name: "Redis", icon: "devicon-redis-plain", status: "uncertain" },
];

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

export function SkillsAnalysis() {
  // Experience data: candidate has 5.5 years, required is 3-5 years
  const candidateExperience = 5.5;
  const requiredMinExperience = 3;
  const requiredMaxExperience = 5;
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
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}
                    >
                      <i
                        className={`${tech.icon} text-lg ${
                          tech.status === "present"
                            ? "text-green-700"
                            : tech.status === "missing"
                              ? "text-red-700"
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
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}
                    >
                      <i
                        className={`${tech.icon} text-lg ${
                          tech.status === "present"
                            ? "text-green-700"
                            : tech.status === "missing"
                              ? "text-red-700"
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
    </div>
  );
}
