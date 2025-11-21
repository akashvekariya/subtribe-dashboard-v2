/**
 * Resume Analysis Stub Data Service
 *
 * This service provides mock data for development and testing.
 * Replace with real API calls when backend is ready.
 *
 * Architecture Pattern:
 * - Service layer handles data fetching
 * - Components consume data without knowing the source
 * - Easy to swap stub with real API implementation
 */

import type {
  ResumeAnalysis,
  AnalysisApiResponse,
  AnalysisFeatureFlags,
} from "@/types/analysis";

/**
 * Simulates API delay for realistic testing
 */
const simulateDelay = (ms: number = 1500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generates stub analysis data for a given application
 *
 * @param applicationId - The ID of the application to analyze
 * @param hasPremiumAccess - Whether user has premium access
 * @returns Promise with analysis data
 */
export async function getResumeAnalysis(
  applicationId: string,
  hasPremiumAccess: boolean = false
): Promise<AnalysisApiResponse> {
  // Simulate API call delay
  await simulateDelay(1200);

  // Generate stub data based on application ID
  const analysis: ResumeAnalysis = {
    application_id: applicationId,
    job_id: "job-123",
    analyzed_at: new Date().toISOString(),
    analysis_version: "1.0.0",

    overall_score: 78,

    job_fit: {
      overall_fit_score: 78,
      skills_match_percentage: 75,
      experience_match_percentage: 82,
      education_match_percentage: 70,
      culture_fit_indicators: [
        "Strong communication skills demonstrated",
        "Proven track record in similar roles",
        "Experience in agile environments",
      ],
      red_flags: [
        "Salary expectation slightly above budget",
        "Short tenure at previous company (8 months)",
      ],
      green_flags: [
        "Relevant industry experience",
        "Strong technical background",
        "Leadership potential demonstrated",
        "Continuous learning mindset",
      ],
    },

    skills_analysis: {
      matched_skills: [
        {
          skill: "React",
          match_level: "exact",
          years_of_experience: 4,
          is_required: true,
          confidence_score: 95,
        },
        {
          skill: "TypeScript",
          match_level: "exact",
          years_of_experience: 3,
          is_required: true,
          confidence_score: 90,
        },
        {
          skill: "Node.js",
          match_level: "close",
          years_of_experience: 3,
          is_required: true,
          confidence_score: 85,
        },
        {
          skill: "GraphQL",
          match_level: "partial",
          years_of_experience: 1,
          is_required: false,
          confidence_score: 70,
        },
      ],
      missing_required_skills: ["AWS Lambda", "DynamoDB"],
      additional_skills: [
        "Python",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "Terraform",
      ],
      skills_summary:
        "Strong technical foundation with 75% match on required skills. Missing some cloud-specific technologies but has transferable DevOps experience.",
    },

    experience_summary: {
      total_years: 5,
      relevant_years: 4,
      experiences: [
        {
          company_name: "Tech Startup Inc",
          role: "Senior Frontend Developer",
          duration_months: 18,
          relevance: "highly_relevant",
          key_achievements: [
            "Led migration from Vue to React, improving performance by 40%",
            "Mentored 3 junior developers",
            "Reduced bundle size by 60% through code splitting",
          ],
          skills_demonstrated: [
            "React",
            "TypeScript",
            "Performance Optimization",
            "Team Leadership",
          ],
        },
        {
          company_name: "Digital Agency Co",
          role: "Frontend Developer",
          duration_months: 24,
          relevance: "relevant",
          key_achievements: [
            "Delivered 12+ client projects on time and budget",
            "Implemented design system used across 5 products",
            "Improved test coverage from 20% to 80%",
          ],
          skills_demonstrated: [
            "React",
            "JavaScript",
            "Jest",
            "Storybook",
            "CSS/Sass",
          ],
        },
        {
          company_name: "E-commerce Platform",
          role: "Junior Developer",
          duration_months: 12,
          relevance: "somewhat_relevant",
          key_achievements: [
            "Built responsive product pages",
            "Fixed 50+ bugs in legacy codebase",
            "Participated in code reviews",
          ],
          skills_demonstrated: ["HTML/CSS", "jQuery", "PHP", "MySQL"],
        },
      ],
    },

    education: {
      highest_degree: "Bachelor of Science",
      education_items: [
        {
          degree: "B.S. Computer Science",
          institution: "State University",
          field_of_study: "Computer Science",
          relevance_score: 90,
          is_relevant: true,
        },
      ],
    },

    resume_quality: {
      overall_score: 82,
      formatting_score: 85,
      clarity_score: 80,
      completeness_score: 78,
      grammar_score: 88,
      length_appropriateness: "good",
      has_contact_info: true,
      has_summary: true,
      has_quantified_achievements: true,
    },

    executive_summary:
      "Strong candidate with 5 years of experience and solid technical skills. Demonstrates clear career progression and relevant experience in modern JavaScript frameworks. Shows potential for growth into senior/lead roles. Main concerns are salary expectations and recent short tenure, which should be discussed in interview.",

    top_strengths: [
      "Strong React and TypeScript expertise (4+ years)",
      "Demonstrated leadership and mentoring abilities",
      "Proven track record of performance optimization",
      "Excellent resume quality with quantified achievements",
      "Continuous learning and technology adoption",
    ],

    areas_of_concern: [
      "Missing required cloud skills (AWS Lambda, DynamoDB)",
      "Salary expectation 15% above budget midpoint",
      "Short 8-month tenure at current company needs clarification",
      "Limited experience with GraphQL",
    ],

    interview_recommendations: [
      "Discuss reasons for short tenure at current company",
      "Assess willingness to learn AWS services",
      "Probe depth of leadership experience",
      "Discuss salary expectations and flexibility",
      "Explore problem-solving approach with technical scenarios",
    ],

    // Premium features (only if user has access)
    salary_insights: hasPremiumAccess
      ? {
          market_salary_min: 90000,
          market_salary_max: 130000,
          candidate_expectation: 115000,
          candidate_current: 95000,
          alignment_score: 85,
          is_within_budget: true,
          market_data_source: "Industry Benchmarks 2024",
          currency: "USD",
        }
      : null,

    career_trajectory: hasPremiumAccess
      ? {
          career_progression_score: 82,
          years_of_experience: 5,
          average_tenure_months: 18,
          job_hopping_risk: "medium",
          growth_trajectory: "upward",
          leadership_potential: 75,
          specialist_vs_generalist: "specialist",
        }
      : null,

    interview_readiness: hasPremiumAccess
      ? {
          overall_readiness_score: 78,
          communication_indicators: 80,
          technical_depth_score: 82,
          problem_solving_indicators: 75,
          suggested_interview_focus_areas: [
            "System Design",
            "React Performance Optimization",
            "Team Collaboration",
            "Conflict Resolution",
          ],
          potential_interview_questions: [
            "Describe your approach to optimizing a slow React application",
            "How do you handle disagreements in code reviews?",
            "Walk us through a complex feature you designed end-to-end",
            "What's your experience with AWS services?",
          ],
        }
      : null,

    diversity_insights: hasPremiumAccess
      ? {
          university_diversity_score: 65,
          industry_diversity_score: 70,
          geographic_diversity: true,
          career_path_uniqueness: 60,
        }
      : null,

    retention_risk: hasPremiumAccess
      ? {
          retention_risk_score: 68,
          flight_risk_level: "medium",
          tenure_stability_score: 65,
          factors_increasing_risk: [
            "Recent short tenure indicates potential restlessness",
            "Salary expectations near top of range",
            "Fast-growing career may seek bigger opportunities",
          ],
          factors_decreasing_risk: [
            "Looking for technical leadership opportunities",
            "Interest in company's technology stack",
            "Values work-life balance and remote work",
          ],
          recommended_retention_strategies: [
            "Offer clear career progression path",
            "Provide mentorship opportunities",
            "Ensure competitive compensation package",
            "Highlight interesting technical challenges",
          ],
        }
      : null,

    is_premium_analysis: hasPremiumAccess,
    premium_features_available: [
      "salary_insights",
      "career_trajectory",
      "interview_readiness",
      "diversity_insights",
      "retention_risk",
    ],
  };

  return {
    success: true,
    data: analysis,
  };
}

/**
 * Gets feature flags for the current user
 *
 * @param userId - The ID of the current user
 * @returns Feature flags indicating access level
 */
export async function getAnalysisFeatureFlags(
  userId: string
): Promise<AnalysisFeatureFlags> {
  await simulateDelay(300);

  // Stub: Return based on user ID (in real impl, check subscription)
  const isPremium = userId.includes("premium");

  return {
    has_premium_access: isPremium,
    available_premium_features: isPremium
      ? [
          "salary_insights",
          "career_trajectory",
          "interview_readiness",
          "diversity_insights",
          "retention_risk",
        ]
      : [],
    subscription_tier: isPremium ? "pro" : "free",
  };
}

/**
 * Placeholder for future batch analysis
 */
export async function getBatchAnalysis(
  applicationIds: string[],
  hasPremiumAccess: boolean = false
): Promise<Record<string, ResumeAnalysis>> {
  const analyses: Record<string, ResumeAnalysis> = {};

  for (const id of applicationIds) {
    const response = await getResumeAnalysis(id, hasPremiumAccess);
    analyses[id] = response.data;
  }

  return analyses;
}
