import React, {
  useState,
  useMemo,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import { Icons } from "../Icons";
import {
  EvaluationFramework,
  WeightedSkill,
  TradeoffPreference,
  HardConstraint,
  DimensionWeight,
} from "../../types/evaluationFramework";

interface EvaluationFrameworkViewProps {
  framework: EvaluationFramework;
  onBack: () => void;
  onDone: () => void;
}

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.context ? ` - ${this.props.context}` : ""}]`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <Icons.AlertTriangle className="w-4 h-4" />
              <span className="font-medium">
                Error rendering {this.props.context || "component"}
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {this.state.error?.message}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// Collapsible Section Component
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}> = ({ title, icon, defaultOpen = true, children, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <span className="font-semibold text-zinc-900">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-full">
              {badge}
            </span>
          )}
        </div>
        <Icons.ChevronDown
          className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-zinc-100">{children}</div>
      )}
    </div>
  );
};

// Weight Bar Component
const WeightBar: React.FC<{ weight: number; maxWeight?: number }> = ({
  weight,
  maxWeight = 5,
}) => {
  const percentage = (weight / maxWeight) * 100;
  const colors = {
    1: "bg-zinc-300",
    2: "bg-zinc-400",
    3: "bg-blue-400",
    4: "bg-blue-500",
    5: "bg-blue-600",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[weight as keyof typeof colors] || "bg-zinc-400"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-zinc-500 w-4">{weight}</span>
    </div>
  );
};

// Skill Card Component
const SkillCard: React.FC<{ skill: WeightedSkill }> = ({ skill }) => {
  const categoryColors: Record<string, string> = {
    Technical: "bg-blue-50 text-blue-700 border-blue-200",
    Soft: "bg-purple-50 text-purple-700 border-purple-200",
    Domain: "bg-amber-50 text-amber-700 border-amber-200",
    Education: "bg-green-50 text-green-700 border-green-200",
    Certification: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Custom: "bg-pink-50 text-pink-700 border-pink-200",
  };

  return (
    <div
      className={`p-3 rounded-lg border ${skill.is_dealbreaker ? "border-red-300 bg-red-50/50" : "border-zinc-200 bg-zinc-50/50"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-zinc-900">
              {skill.name}
            </span>
            {skill.is_dealbreaker && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded uppercase">
                Dealbreaker
              </span>
            )}
            {skill.is_required && !skill.is_dealbreaker && (
              <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-600 text-[10px] font-semibold rounded uppercase">
                Required
              </span>
            )}
          </div>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded border ${categoryColors[skill.category] || "bg-zinc-50 text-zinc-600 border-zinc-200"}`}
          >
            {skill.category}
          </span>
        </div>
        <WeightBar weight={skill.weight} />
      </div>
      <p className="text-xs text-zinc-500">{skill.weight_rationale}</p>
    </div>
  );
};

// Tradeoff Card Component
const TradeoffCard: React.FC<{ tradeoff: TradeoffPreference }> = ({
  tradeoff,
}) => {
  // Debug logging
  if (!tradeoff) {
    console.error("[TradeoffCard] Received null/undefined tradeoff");
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error: No tradeoff data
      </div>
    );
  }

  console.log("[TradeoffCard] Rendering tradeoff:", {
    id: tradeoff.tradeoff_id,
    title: tradeoff.title,
    preferred_direction: tradeoff.preferred_direction,
    strength: tradeoff.strength,
  });

  const directionConfig: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    OptionA: { label: "Prefers A", color: "text-blue-600", bg: "bg-blue-50" },
    OptionB: {
      label: "Prefers B",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    Balanced: { label: "Balanced", color: "text-zinc-600", bg: "bg-zinc-50" },
    // Also handle potential snake_case or lowercase variants
    option_a: { label: "Prefers A", color: "text-blue-600", bg: "bg-blue-50" },
    option_b: {
      label: "Prefers B",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    balanced: { label: "Balanced", color: "text-zinc-600", bg: "bg-zinc-50" },
  };

  const strengthConfig: Record<string, { label: string; color: string }> = {
    Strong: { label: "Strong", color: "text-zinc-900" },
    Slight: { label: "Slight", color: "text-zinc-600" },
    Neutral: { label: "Neutral", color: "text-zinc-400" },
    // Also handle lowercase
    strong: { label: "Strong", color: "text-zinc-900" },
    slight: { label: "Slight", color: "text-zinc-600" },
    neutral: { label: "Neutral", color: "text-zinc-400" },
  };

  // Defensive: handle unknown values
  const config = directionConfig[tradeoff.preferred_direction] || {
    label: String(tradeoff.preferred_direction || "Unknown"),
    color: "text-zinc-600",
    bg: "bg-zinc-50",
  };
  const strength = strengthConfig[tradeoff.strength] || {
    label: String(tradeoff.strength || "Unknown"),
    color: "text-zinc-400",
  };

  return (
    <div className="p-4 rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-zinc-900">{tradeoff.title}</h4>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
          <span className={`text-xs ${strength.color}`}>{strength.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-3 rounded-lg ${tradeoff.preferred_direction === "OptionA" ? "bg-blue-50 border border-blue-200" : "bg-zinc-50"}`}
        >
          <div className="text-xs font-semibold text-zinc-500 uppercase mb-1">
            Option A
          </div>
          <div className="text-sm font-medium text-zinc-900 mb-2">
            {tradeoff.option_a_label}
          </div>
          <div className="space-y-1">
            {tradeoff.option_a_signals?.slice(0, 2).map((signal, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-xs text-zinc-600"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 ${signal.strength === "strong" ? "bg-blue-500" : "bg-zinc-400"}`}
                />
                {signal.signal}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`p-3 rounded-lg ${tradeoff.preferred_direction === "OptionB" ? "bg-purple-50 border border-purple-200" : "bg-zinc-50"}`}
        >
          <div className="text-xs font-semibold text-zinc-500 uppercase mb-1">
            Option B
          </div>
          <div className="text-sm font-medium text-zinc-900 mb-2">
            {tradeoff.option_b_label}
          </div>
          <div className="space-y-1">
            {tradeoff.option_b_signals?.slice(0, 2).map((signal, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-xs text-zinc-600"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 ${signal.strength === "strong" ? "bg-purple-500" : "bg-zinc-400"}`}
                />
                {signal.signal}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Constraint Card Component
const ConstraintCard: React.FC<{ constraint: HardConstraint }> = ({
  constraint,
}) => {
  // Normalize constraint type for lookup
  const normalizedType = String(constraint.constraint_type || "").toLowerCase();

  // Determine config based on normalized type
  const getConfig = () => {
    if (normalizedType.includes("dealbreaker")) {
      return {
        label: "Dealbreaker",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: <Icons.X className="w-4 h-4 text-red-500" />,
      };
    } else if (
      normalizedType.includes("required") ||
      normalizedType.includes("day1")
    ) {
      return {
        label: "Day 1 Essential",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: <Icons.Lock className="w-4 h-4 text-amber-500" />,
      };
    } else if (
      normalizedType.includes("acceptable") ||
      normalizedType.includes("gap")
    ) {
      return {
        label: "Trainable",
        bg: "bg-green-50",
        border: "border-green-200",
        icon: <Icons.GraduationCap className="w-4 h-4 text-green-500" />,
      };
    }
    // Default fallback
    return {
      label: constraint.constraint_type || "Constraint",
      bg: "bg-zinc-50",
      border: "border-zinc-200",
      icon: <Icons.AlertTriangle className="w-4 h-4 text-zinc-500" />,
    };
  };

  const severityColors: Record<string, string> = {
    Critical: "bg-red-100 text-red-700",
    Important: "bg-amber-100 text-amber-700",
    Minor: "bg-zinc-100 text-zinc-600",
    critical: "bg-red-100 text-red-700",
    important: "bg-amber-100 text-amber-700",
    minor: "bg-zinc-100 text-zinc-600",
  };

  const assessmentMethodConfig: Record<
    string,
    { label: string; icon: React.ReactNode }
  > = {
    Resume: { label: "Resume", icon: <Icons.FileCode className="w-3 h-3" /> },
    Interview: {
      label: "Interview",
      icon: <Icons.Users className="w-3 h-3" />,
    },
    Both: { label: "Both", icon: <Icons.CheckCircle2 className="w-3 h-3" /> },
    resume: { label: "Resume", icon: <Icons.FileCode className="w-3 h-3" /> },
    interview: {
      label: "Interview",
      icon: <Icons.Users className="w-3 h-3" />,
    },
    both: { label: "Both", icon: <Icons.CheckCircle2 className="w-3 h-3" /> },
  };

  const config = getConfig();
  const methodConfig = assessmentMethodConfig[constraint.assessment_method] || {
    label: constraint.assessment_method || "Unknown",
    icon: null,
  };

  return (
    <div className={`p-3 rounded-lg border ${config.border} ${config.bg}`}>
      <div className="flex items-start gap-2 mb-2">
        {config.icon}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase text-zinc-500">
              {config.label}
            </span>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${severityColors[constraint.severity] || severityColors[String(constraint.severity).toLowerCase()] || "bg-zinc-100 text-zinc-600"}`}
            >
              {constraint.severity}
            </span>
            {constraint.assessment_method && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-700 flex items-center gap-1">
                {methodConfig.icon}
                {methodConfig.label}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-900 mt-1">{constraint.description}</p>
        </div>
      </div>
      <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-zinc-200/50">
        <Icons.Lightbulb className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-500">{constraint.resume_check}</p>
      </div>
    </div>
  );
};

// Dimension Bar Component
const DimensionBar: React.FC<{ dimension: DimensionWeight }> = ({
  dimension,
}) => {
  const percentage = dimension.weight * 100;

  const dimensionLabels: Record<string, string> = {
    technical_fit: "Technical Fit",
    experience_fit: "Experience Fit",
    trajectory_fit: "Trajectory Fit",
    culture_fit: "Culture Fit",
    problem_solving_fit: "Problem Solving",
  };

  const dimensionColors: Record<string, string> = {
    technical_fit: "bg-blue-500",
    experience_fit: "bg-purple-500",
    trajectory_fit: "bg-green-500",
    culture_fit: "bg-amber-500",
    problem_solving_fit: "bg-cyan-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-900">
          {dimensionLabels[dimension.dimension] || dimension.dimension}
        </span>
        <span className="text-sm font-semibold text-zinc-600">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${dimensionColors[dimension.dimension] || "bg-zinc-400"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500">{dimension.description}</p>
    </div>
  );
};

export default function EvaluationFrameworkView({
  framework,
  onBack,
  onDone,
}: EvaluationFrameworkViewProps) {
  // Debug logging
  console.log("[EvaluationFrameworkView] Framework received:", framework);
  console.log("[EvaluationFrameworkView] Keys:", Object.keys(framework || {}));

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, WeightedSkill[]> = {};
    const skills = framework.skill_criteria?.skills || [];
    skills.forEach((skill) => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    // Sort skills within each category by weight (descending)
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => b.weight - a.weight);
    });
    return grouped;
  }, [framework.skill_criteria?.skills]);

  // Group constraints by type
  const constraintsByType = useMemo(() => {
    const grouped: Record<string, HardConstraint[]> = {
      dealbreaker: [],
      required_day1: [],
      acceptable_gap: [],
    };
    const constraints = framework.hard_constraints || [];

    // Debug: log constraint types
    console.log(
      "[EvaluationFrameworkView] Constraint types:",
      constraints.map((c) => c.constraint_type)
    );

    constraints.forEach((c) => {
      // Normalize the constraint type to handle different cases
      const normalizedType = String(c.constraint_type || "")
        .toLowerCase()
        .replace(/day1/i, "day1");

      if (
        normalizedType.includes("dealbreaker") ||
        normalizedType === "dealbreaker"
      ) {
        grouped.dealbreaker.push(c);
      } else if (
        normalizedType.includes("required") ||
        normalizedType.includes("day1") ||
        normalizedType === "requiredday1" ||
        normalizedType === "required_day1"
      ) {
        grouped.required_day1.push(c);
      } else if (
        normalizedType.includes("acceptable") ||
        normalizedType.includes("gap") ||
        normalizedType === "acceptablegap" ||
        normalizedType === "acceptable_gap"
      ) {
        grouped.acceptable_gap.push(c);
      } else {
        // Fallback: put in dealbreaker
        console.warn(
          "[EvaluationFrameworkView] Unknown constraint type:",
          c.constraint_type,
          "- adding to dealbreaker"
        );
        grouped.dealbreaker.push(c);
      }
    });

    console.log("[EvaluationFrameworkView] Grouped constraints:", {
      dealbreaker: grouped.dealbreaker.length,
      required_day1: grouped.required_day1.length,
      acceptable_gap: grouped.acceptable_gap.length,
    });

    return grouped;
  }, [framework.hard_constraints]);

  return (
    <div className="min-h-full p-8 lg:p-12">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
          >
            <Icons.ArrowLeft className="w-4 h-4" /> Back to Summary
          </button>
          <button
            onClick={onDone}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Icons.Check className="w-4 h-4" /> Done
          </button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Evaluation Framework
          </h1>
          <p className="text-zinc-500">
            AI-generated framework based on your calibration decisions. Use this
            to consistently evaluate candidates.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {/* Reasoning Section */}
          <Section
            title="Framework Reasoning"
            icon={<Icons.Brain className="w-4 h-4 text-zinc-600" />}
          >
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-lg border-l-4 border-zinc-400">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                  Calibration Insights
                </h4>
                <p className="text-sm text-zinc-700">
                  {framework.reasoning?.calibration_insights}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="text-xs font-semibold text-blue-600 uppercase mb-2">
                  Weighting Rationale
                </h4>
                <p className="text-sm text-zinc-700">
                  {framework.reasoning?.weighting_rationale}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <h4 className="text-xs font-semibold text-purple-600 uppercase mb-2">
                  Matching Strategy
                </h4>
                <p className="text-sm text-zinc-700">
                  {framework.reasoning?.matching_strategy}
                </p>
              </div>
            </div>
          </Section>

          {/* Matching Guidance */}
          {framework.matching_guidance && (
            <Section
              title="Matching Guidance"
              icon={<Icons.Compass className="w-4 h-4 text-zinc-600" />}
            >
              <div className="space-y-4">
                {/* Matching Approach */}
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                    Matching Approach
                  </h4>
                  <p className="text-sm text-zinc-700">
                    {framework.matching_guidance.matching_approach}
                  </p>
                </div>

                {/* Top Priorities */}
                {framework.matching_guidance.top_priorities?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                      Top Priorities (in order)
                    </h4>
                    <div className="space-y-1">
                      {framework.matching_guidance.top_priorities.map(
                        (p, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                          >
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                              {i + 1}
                            </div>
                            <span className="text-sm text-zinc-700">{p}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Differentiators */}
                {framework.matching_guidance.differentiator_signals?.length >
                  0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-green-600 uppercase mb-2">
                      Differentiator Signals
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {framework.matching_guidance.differentiator_signals.map(
                        (s, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 bg-green-50 rounded-lg"
                          >
                            <Icons.Star className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-xs text-zinc-700">{s}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Mismatch Signals */}
                {framework.matching_guidance.mismatch_signals?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 uppercase mb-2">
                      Mismatch Signals
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {framework.matching_guidance.mismatch_signals.map(
                        (s, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 bg-red-50 rounded-lg"
                          >
                            <Icons.AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <span className="text-xs text-zinc-700">{s}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Borderline */}
                {framework.matching_guidance.borderline_guidance && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="text-xs font-semibold text-amber-700 uppercase mb-2">
                      Borderline Decision Criteria
                    </h4>
                    <p className="text-sm text-zinc-700">
                      {framework.matching_guidance.borderline_guidance}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Dimension Weights */}
          {framework.dimension_weights &&
            framework.dimension_weights.length > 0 && (
              <Section
                title="Evaluation Dimensions"
                icon={<Icons.BarChart3 className="w-4 h-4 text-zinc-600" />}
                badge={`${framework.dimension_weights.length} dimensions`}
              >
                <div className="grid gap-4">
                  {framework.dimension_weights.map((dim) => (
                    <DimensionBar key={dim.dimension} dimension={dim} />
                  ))}
                </div>
              </Section>
            )}

          {/* Skills Section */}
          {framework.skill_criteria && (
            <Section
              title="Skill Criteria"
              icon={<Icons.Target className="w-4 h-4 text-zinc-600" />}
              badge={`${framework.skill_criteria.skills?.length || 0} skills`}
            >
              {framework.skill_criteria.skill_matching_guidance && (
                <div className="mb-4 p-3 bg-zinc-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Skill Matching Guidance
                  </h4>
                  <p className="text-sm text-zinc-600">
                    {framework.skill_criteria.skill_matching_guidance}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(
                  ([category, skills]: [string, WeightedSkill[]]) => (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                        {category} Skills
                      </h4>
                      <div className="grid gap-2">
                        {skills.map((skill) => (
                          <SkillCard key={skill.skill_id} skill={skill} />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </Section>
          )}

          {/* Tradeoff Preferences */}
          {framework.tradeoff_preferences &&
            framework.tradeoff_preferences.length > 0 && (
              <ErrorBoundary context="Tradeoff Preferences">
                <Section
                  title="Tradeoff Preferences"
                  icon={<Icons.Scale className="w-4 h-4 text-zinc-600" />}
                  badge={`${framework.tradeoff_preferences.length} tradeoffs`}
                >
                  <div className="grid gap-4">
                    {framework.tradeoff_preferences.map((tradeoff, idx) => (
                      <ErrorBoundary
                        key={tradeoff.tradeoff_id || idx}
                        context={`Tradeoff ${tradeoff.title || idx}`}
                      >
                        <TradeoffCard tradeoff={tradeoff} />
                      </ErrorBoundary>
                    ))}
                  </div>
                </Section>
              </ErrorBoundary>
            )}

          {/* Hard Constraints */}
          {framework.hard_constraints &&
            framework.hard_constraints.length > 0 && (
              <Section
                title="Hard Constraints"
                icon={<Icons.Shield className="w-4 h-4 text-zinc-600" />}
                badge={`${framework.hard_constraints.length} constraints`}
              >
                <div className="space-y-4">
                  {constraintsByType.dealbreaker.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-red-600 uppercase mb-2">
                        Dealbreakers
                      </h4>
                      <div className="grid gap-2">
                        {constraintsByType.dealbreaker.map((c, i) => (
                          <ConstraintCard key={i} constraint={c} />
                        ))}
                      </div>
                    </div>
                  )}

                  {constraintsByType.required_day1.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-600 uppercase mb-2">
                        Day 1 Essentials
                      </h4>
                      <div className="grid gap-2">
                        {constraintsByType.required_day1.map((c, i) => (
                          <ConstraintCard key={i} constraint={c} />
                        ))}
                      </div>
                    </div>
                  )}

                  {constraintsByType.acceptable_gap.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-green-600 uppercase mb-2">
                        Trainable Gaps
                      </h4>
                      <div className="grid gap-2">
                        {constraintsByType.acceptable_gap.map((c, i) => (
                          <ConstraintCard key={i} constraint={c} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

          {/* Success Criteria */}
          {framework.success_criteria && (
            <Section
              title="Success Criteria"
              icon={<Icons.CheckCircle2 className="w-4 h-4 text-zinc-600" />}
            >
              <div className="space-y-4">
                {/* Trajectory */}
                {framework.success_criteria.expected_trajectory && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-xs font-semibold text-green-700 uppercase mb-2">
                      Expected Trajectory
                    </h4>
                    <div className="text-sm font-medium text-zinc-900 mb-1">
                      {framework.success_criteria.expected_trajectory.label}
                    </div>
                    <p className="text-xs text-zinc-600 mb-3">
                      {framework.success_criteria.expected_trajectory.hint}
                    </p>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-medium text-green-600 mb-1">
                          Resume Signals
                        </div>
                        <ul className="space-y-1">
                          {framework.success_criteria.expected_trajectory.resume_signals?.map(
                            (s, i) => (
                              <li
                                key={i}
                                className="text-xs text-zinc-600 flex items-start gap-1.5"
                              >
                                <Icons.Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                {s}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-red-600 mb-1">
                          Mismatch Signals
                        </div>
                        <ul className="space-y-1">
                          {framework.success_criteria.expected_trajectory.mismatch_signals?.map(
                            (s, i) => (
                              <li
                                key={i}
                                className="text-xs text-zinc-600 flex items-start gap-1.5"
                              >
                                <Icons.X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                {s}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Day 60 Milestones */}
                {framework.success_criteria.day_60_milestones?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                      Day 60 Milestones
                    </h4>
                    <div className="grid gap-2">
                      {framework.success_criteria.day_60_milestones.map(
                        (m, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg"
                          >
                            <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-600">
                              {i + 1}
                            </div>
                            <span className="text-sm text-zinc-700">{m}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Readiness Indicators */}
                {framework.success_criteria.readiness_signals?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
                      Readiness Indicators
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {framework.success_criteria.readiness_signals.map(
                        (r, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg"
                          >
                            <Icons.Zap className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-xs text-zinc-700">{r}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
