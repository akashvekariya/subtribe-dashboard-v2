"use client";

import { useMemo } from "react";
import type { Application } from "@/types";
import type {
  EvaluationJSON,
  RadarChartData,
  TechStackItem,
  ExperienceTimelineData,
  DimensionScores,
  SkillMatch,
} from "./types";

/**
 * Skill ID to icon mapping for tech stack visualization
 */
const SKILL_ICON_MAP: Record<string, string> = {
  // Languages
  python: "devicon-python-plain",
  javascript: "devicon-javascript-plain",
  typescript: "devicon-typescript-plain",
  java: "devicon-java-plain",
  go: "devicon-go-plain",
  rust: "devicon-rust-plain",
  cpp: "devicon-cplusplus-plain",
  csharp: "devicon-csharp-plain",
  ruby: "devicon-ruby-plain",
  php: "devicon-php-plain",
  swift: "devicon-swift-plain",
  kotlin: "devicon-kotlin-plain",
  scala: "devicon-scala-plain",

  // Frontend
  react: "devicon-react-original",
  vue: "devicon-vuejs-plain",
  angular: "devicon-angularjs-plain",
  svelte: "devicon-svelte-plain",
  nextjs: "devicon-nextjs-original",
  html: "devicon-html5-plain",
  css: "devicon-css3-plain",
  tailwind: "devicon-tailwindcss-plain",
  sass: "devicon-sass-original",

  // Backend
  nodejs: "devicon-nodejs-plain",
  express: "devicon-express-original",
  fastapi: "devicon-fastapi-plain",
  django: "devicon-django-plain",
  flask: "devicon-flask-original",
  spring: "devicon-spring-plain",
  rails: "devicon-rails-plain",

  // Databases
  postgresql: "devicon-postgresql-plain",
  mysql: "devicon-mysql-plain",
  mongodb: "devicon-mongodb-plain",
  redis: "devicon-redis-plain",
  elasticsearch: "devicon-elasticsearch-plain",
  sqlite: "devicon-sqlite-plain",

  // Cloud & DevOps
  aws: "devicon-amazonwebservices-plain-wordmark",
  gcp: "devicon-googlecloud-plain",
  azure: "devicon-azure-plain",
  docker: "devicon-docker-plain",
  kubernetes: "devicon-kubernetes-plain",
  terraform: "devicon-terraform-plain",
  jenkins: "devicon-jenkins-plain",
  github: "devicon-github-original",
  gitlab: "devicon-gitlab-plain",

  // Tools
  git: "devicon-git-plain",
  graphql: "devicon-graphql-plain",
  webpack: "devicon-webpack-plain",
  vscode: "devicon-vscode-plain",
  linux: "devicon-linux-plain",
  nginx: "devicon-nginx-original",

  // Data & ML
  pandas: "devicon-pandas-original",
  numpy: "devicon-numpy-original",
  tensorflow: "devicon-tensorflow-original",
  pytorch: "devicon-pytorch-original",
  jupyter: "devicon-jupyter-plain",
};

/**
 * Get icon class for a skill ID
 */
function getSkillIcon(skillId: string): string {
  const normalizedId = skillId.toLowerCase().replace(/[^a-z0-9]/g, "");
  return SKILL_ICON_MAP[normalizedId] || "devicon-devicon-plain";
}

/**
 * Determine skill status based on evidence quality and depth
 */
function getSkillStatus(
  match: SkillMatch
): "present" | "uncertain" | "missing" {
  if (match.evidence_quality === "strong_evidence") {
    return match.depth === "strong" || match.depth === "moderate"
      ? "present"
      : "uncertain";
  }
  if (match.evidence_quality === "weak_evidence") {
    return "uncertain";
  }
  // keyword_only
  return "uncertain";
}

/**
 * Transform dimension scores to radar chart data
 */
function transformToRadarData(
  dimensionScores: DimensionScores
): RadarChartData[] {
  const dimensionOrder: Array<{ key: keyof DimensionScores; label: string }> = [
    { key: "culture_fit", label: "Culture Fit" },
    { key: "technical_fit", label: "Skills Match" },
    { key: "experience_fit", label: "Experience" },
    { key: "trajectory_fit", label: "Growth Trajectory" },
    { key: "problem_solving_fit", label: "Problem Solving" },
  ];

  return dimensionOrder.map(({ key, label }) => ({
    focus: label,
    score: Math.round(dimensionScores[key] * 10) / 10, // Round to 1 decimal
    dimension: key,
  }));
}

/**
 * Transform skill matches to tech stack items
 */
function transformToTechStack(
  skillMatches: SkillMatch[],
  frameworkSkills?: Array<{
    skill_id: string;
    name: string;
    is_required: boolean;
  }>
): TechStackItem[] {
  // Create lookup for matched skills
  const matchedLookup = new Map<string, SkillMatch>();
  skillMatches.forEach((match) => {
    matchedLookup.set(match.skill_id, match);
  });

  // If we have framework skills, use them as the base
  if (frameworkSkills && frameworkSkills.length > 0) {
    return frameworkSkills.map((skill) => {
      const match = matchedLookup.get(skill.skill_id);
      return {
        id: skill.skill_id,
        name: skill.name,
        icon: getSkillIcon(skill.skill_id),
        status: match ? getSkillStatus(match) : "missing",
        evidence: match,
      };
    });
  }

  // Fallback: just use the matched skills
  return skillMatches.map((match) => ({
    id: match.skill_id,
    name: match.skill_id
      .replace(/^skill_/, "") // Remove "skill_" prefix
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: getSkillIcon(match.skill_id),
    status: getSkillStatus(match),
    evidence: match,
  }));
}

/**
 * Transform experience data for timeline
 */
function transformToExperienceTimeline(
  evaluation: EvaluationJSON,
  requiredMin?: number,
  requiredMax?: number
): ExperienceTimelineData {
  return {
    totalYears: evaluation.computed_facts?.experience?.total_years || 0,
    requiredMin,
    requiredMax,
    entries: evaluation.evaluation?.experience_entries || [],
    hasCurrentRole:
      evaluation.analysis?.experience_summary?.has_current_role || false,
  };
}

/**
 * Hook return type
 */
export interface UseEvaluationDataResult {
  // Raw data
  evaluationJson: EvaluationJSON | null;
  isEvaluated: boolean;
  isPending: boolean;
  isProcessing: boolean;
  isFailed: boolean;

  // Transformed data for UI
  radarChartData: RadarChartData[];
  techStackItems: TechStackItem[];
  experienceTimeline: ExperienceTimelineData;

  // Direct accessors
  scores: EvaluationJSON["scores"] | null;
  redFlags: EvaluationJSON["red_flags"] | null;
  blockers: EvaluationJSON["blockers"];
  canProceed: boolean;
  analysis: EvaluationJSON["analysis"] | null;
  evaluationDetails: EvaluationJSON["evaluation"] | null;
  dimensionAssessments: EvaluationJSON["evaluation"]["dimension_assessments"];
  summary: EvaluationJSON["evaluation"]["summary"] | null;
  warnings: EvaluationJSON["warnings"];
}

/**
 * Hook to process and transform evaluation data for UI components
 */
export function useEvaluationData(
  application: Application | null,
  jobFramework?: Record<string, unknown> | null
): UseEvaluationDataResult {
  const evaluationJson = application?.evaluation_json ?? null;
  const evalStatus = application?.ai_resume_eval_status;

  // Status checks
  const isEvaluated = evalStatus === "completed" && evaluationJson !== null;
  const isPending =
    !evalStatus || evalStatus === "pending" || evalStatus === "queued";
  const isProcessing = evalStatus === "processing";
  const isFailed = evalStatus === "failed";

  // Extract framework skills if available
  const frameworkSkills = useMemo(() => {
    if (!jobFramework) return undefined;
    const skillCriteria = jobFramework.skill_criteria as
      | {
          skills?: Array<{
            skill_id: string;
            name: string;
            is_required: boolean;
          }>;
        }
      | undefined;
    return skillCriteria?.skills;
  }, [jobFramework]);

  // Extract experience requirements from framework
  const experienceRequirements = useMemo(() => {
    if (!jobFramework) return { min: undefined, max: undefined };
    const roleContext = jobFramework.role_context as
      | { experience_range?: { min?: number; max?: number } }
      | undefined;
    return {
      min: roleContext?.experience_range?.min,
      max: roleContext?.experience_range?.max,
    };
  }, [jobFramework]);

  // Transform radar chart data
  const radarChartData = useMemo<RadarChartData[]>(() => {
    if (!evaluationJson?.scores?.dimension_scores) {
      return [
        { focus: "Culture Fit", score: 0, dimension: "culture_fit" },
        { focus: "Skills Match", score: 0, dimension: "technical_fit" },
        { focus: "Experience", score: 0, dimension: "experience_fit" },
        { focus: "Growth Trajectory", score: 0, dimension: "trajectory_fit" },
        {
          focus: "Problem Solving",
          score: 0,
          dimension: "problem_solving_fit",
        },
      ];
    }
    return transformToRadarData(evaluationJson.scores.dimension_scores);
  }, [evaluationJson?.scores?.dimension_scores]);

  // Transform tech stack data
  const techStackItems = useMemo<TechStackItem[]>(() => {
    if (!evaluationJson?.evaluation?.skill_matches) return [];
    return transformToTechStack(
      evaluationJson.evaluation.skill_matches,
      frameworkSkills
    );
  }, [evaluationJson?.evaluation?.skill_matches, frameworkSkills]);

  // Transform experience timeline data
  const experienceTimeline = useMemo<ExperienceTimelineData>(() => {
    if (!evaluationJson) {
      return {
        totalYears: 0,
        requiredMin: experienceRequirements.min,
        requiredMax: experienceRequirements.max,
        entries: [],
        hasCurrentRole: false,
      };
    }
    return transformToExperienceTimeline(
      evaluationJson,
      experienceRequirements.min,
      experienceRequirements.max
    );
  }, [evaluationJson, experienceRequirements]);

  // Direct accessors with null safety
  const dimensionAssessments = useMemo(() => {
    return evaluationJson?.evaluation?.dimension_assessments || [];
  }, [evaluationJson?.evaluation?.dimension_assessments]);

  return {
    // Raw data
    evaluationJson,
    isEvaluated,
    isPending,
    isProcessing,
    isFailed,

    // Transformed data
    radarChartData,
    techStackItems,
    experienceTimeline,

    // Direct accessors
    scores: evaluationJson?.scores ?? null,
    redFlags: evaluationJson?.red_flags ?? null,
    blockers: evaluationJson?.blockers ?? [],
    canProceed: evaluationJson?.can_proceed ?? true,
    analysis: evaluationJson?.analysis ?? null,
    evaluationDetails: evaluationJson?.evaluation ?? null,
    dimensionAssessments,
    summary: evaluationJson?.evaluation?.summary ?? null,
    warnings: evaluationJson?.warnings ?? [],
  };
}
