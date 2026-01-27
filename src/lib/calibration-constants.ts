// Tag type for calibration options
export interface Tag {
  id: string;
  label: string;
  description: string;
}

export const INDUSTRIES = [
  "FinTech",
  "HealthTech",
  "SaaS",
  "E-commerce",
  "Agency",
  "Crypto",
  "EdTech",
  "Logistics",
  "DeepTech",
  "Consumer",
  "Marketplace",
  "AI/ML",
];
export const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export const ORG_STRUCTURES: Tag[] = [
  {
    id: "matrix",
    label: "The Matrix",
    description: "Multiple bosses, cross-functional reporting.",
  },
  {
    id: "pyramid",
    label: "The Pyramid",
    description: "Clear chain of command, top-down decisions.",
  },
  {
    id: "holacracy",
    label: "The Holacracy",
    description: "Self-managed circles, no distinct managers.",
  },
  {
    id: "hub_spoke",
    label: "Hub & Spoke",
    description: "Central leadership with independent satellite teams.",
  },
  {
    id: "flatland",
    label: "The Flatland",
    description: "Founders directly accessible, minimum middle management.",
  },
];

export const TECH_STACK = [
  // Productivity & Collab
  "Slack",
  "Teams",
  "Google Workspace",
  "Microsoft 365",
  "Notion",
  "Linear",
  "Jira",
  "Asana",
  "Trello",
  "Monday",
  "Zoom",
  "Loom",
  "Figma",
  "Miro",
  "Airtable",
  // HR & Recruiting
  "Greenhouse",
  "Lever",
  "Ashby",
  "Gem",
  "Workday",
  "BambooHR",
  "Rippling",
  "LinkedIn Recruiter",
  "Hired",
  "Otta",
  "Dover",
  // Engineering
  "GitHub",
  "GitLab",
  "Sentry",
  "Datadog",
  "Vercel",
  "AWS",
];

export const BUDGET_OPTIONS = [
  "Learning Stipends",
  "Team Retreats",
  "Top-tier Health Plans",
  "Performance Bonuses",
  "Latest Hardware/MacBooks",
  "Office Catering",
  "Mental Health Days",
  "Equity/Stock Grants",
  "Conference Tickets",
  "Home Office Setup",
  "Childcare Support",
  "Gym Memberships",
];

export const DEADLINE_OPTIONS: Tag[] = [
  {
    id: "crunch",
    label: "The Crunch",
    description: "We work nights/weekends to hit 100% and launch on time.",
  },
  {
    id: "delay",
    label: "The Delay",
    description: "We push the deadline. We never ship imperfect work.",
  },
  {
    id: "iteration",
    label: "The Iteration",
    description: "We ship the 90% now and patch it next week.",
  },
  {
    id: "cut",
    label: "The Scope Cut",
    description: "We remove the 10% unfinished features and ship on time.",
  },
];

export const ANTI_HERO_TRAITS = [
  "Ignoring Chain of Command",
  "Moving Too Slowly",
  "Over-promising",
  "Working in Silos",
  "Challenging Leadership Publicly",
  "Avoiding Documentation",
  "Strict 9-to-5 Mentality",
  "Risk Aversion",
  "Too Much Process",
  "Lack of Autonomy",
  "Poor Written Communication",
  "Micromanagement",
  "Ego-driven",
  "Office Politics",
  "Inconsistency",
  "Hoarding Information",
  "Resistance to Feedback",
  "Blaming Others",
  "Hero Complex",
];

export const TOP_PERFORMER_TRAITS = [
  "Ruthless Executor",
  "Diplomatic Consensus Builder",
  "Deep Focus Specialist",
  "Chaos Manager",
  "Process Architect",
  "Social Glue",
  "Technical Visionary",
  "Customer Obsessed",
  "Speed Demon",
  "Mentor/Teacher",
  "Data-Driven Decision Maker",
  "Radical Candidness",
  "First Principles Thinker",
];

export const MEETING_STYLES: Tag[] = [
  {
    id: "huddle",
    label: "The Huddle",
    description:
      "Short, daily standups (<15 mins). High frequency, low duration.",
  },
  {
    id: "deep_dive",
    label: "The Deep Dive",
    description:
      "Long, structured strategy sessions (1hr+). Low frequency, high depth.",
  },
  {
    id: "async",
    label: "The Async",
    description: "We barely meet. We write memos and comment on docs.",
  },
  {
    id: "hybrid",
    label: "The Hybrid",
    description: "Meetings are only for final decisions, not brainstorming.",
  },
];

export const ONBOARDING_STYLES: Tag[] = [
  {
    id: "sink_swim",
    label: "Sink or Swim",
    description: "They get a laptop and a problem to solve immediately.",
  },
  {
    id: "hand_hold",
    label: "The Hand-Hold",
    description: "Strict shadowing of a mentor for 2 weeks.",
  },
  {
    id: "library",
    label: "The Library",
    description: "They spend 3 days reading wiki documentation/Notion.",
  },
  {
    id: "bootcamp",
    label: "The Bootcamp",
    description: "Formalized training program with a cohort.",
  },
];

export const TRADEOFF_OPTIONS: Tag[] = [
  {
    id: "intensity",
    label: "High Intensity / High Reward",
    description:
      "People stay 18 months, work crazy hours, but leave with a massive title jump.",
  },
  {
    id: "handcuffs",
    label: "The Golden Handcuffs",
    description:
      "People stay 5+ years for the benefits and stability, even if growth is slower.",
  },
  {
    id: "tour",
    label: "The Tour of Duty",
    description:
      "We expect 2-year cycles of high performance, then we help them find their next job.",
  },
  {
    id: "family",
    label: "The Family Business",
    description:
      "People join for life. We rarely fire, but we rarely pivot quickly.",
  },
  {
    id: "grinder",
    label: "The Grinder",
    description:
      "High turnover is expected; we hire fast and filter fast to find diamonds.",
  },
];

// Job Calibration Constants

export const DEFAULT_CHALLENGE_OPTIONS = [
  "Legacy codebase with technical debt",
  "Fast-paced environment with frequent pivots",
  "Ambiguous requirements - must define own scope",
  "Heavy cross-team dependencies",
  "High visibility role with exec attention",
  "Limited resources / small team",
  "Aggressive timelines",
  "Complex stakeholder management",
  "Steep learning curve on domain",
  "First hire for this function",
];

export const DEFAULT_DEPARTURE_REASONS = [
  "Promoted internally",
  "Left for another opportunity",
  "Role was restructured",
  "Performance-related",
  "This is a new position",
  "Team/org change",
  "Relocation",
  "Prefer not to say",
];

// New Calibration Constants

export const QUIT_RISK_OPTIONS = [
  "Lack of career growth opportunities",
  "Unrealistic expectations or workload",
  "Poor work-life balance",
  "Toxic team dynamics or management",
  "Outdated technology stack",
  "Micromanagement or lack of autonomy",
  "Lack of impact or visibility",
  "Compensation below market rate",
];

export const BURNOUT_RISK_OPTIONS: Tag[] = [
  {
    id: "low",
    label: "Low",
    description: "Sustainable pace, good work-life balance",
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Busy periods exist but manageable",
  },
  { id: "high", label: "High", description: "Consistently demanding workload" },
  {
    id: "very_high",
    label: "Very High",
    description: "Known pressure cooker environment",
  },
];

export const PREDECESSOR_OUTCOME_OPTIONS = [
  "Promoted internally",
  "Left for external opportunity",
  "Burned out / left due to stress",
  "Performance managed out",
  "Role is brand new",
  "Reorganization / layoff",
];

export const REJECTION_BEHAVIOR_OPTIONS = [
  "Badmouths previous employers",
  "Cannot clearly explain job changes",
  "Unprepared for the interview",
  "Arrogant or poor listener",
  "Salary expectations significantly misaligned",
  "Ghosted or no-showed previous rounds",
  "Misrepresented experience on resume",
  "Negative attitude about challenges",
];

export const TRAINABLE_GAP_OPTIONS = [
  "Specific programming languages or frameworks",
  "Domain or industry knowledge",
  "Company-specific tools and processes",
  "Leadership and management skills",
  "Presentation and public speaking",
  "Industry certifications",
];

// Deal Breakers - skills/traits that must be present from day 1
export const DEAL_BREAKER_OPTIONS = [
  "Core technical foundation",
  "Problem-solving ability",
  "Communication skills",
  "Cultural fit and values alignment",
  "Work ethic and reliability",
  "Years of relevant experience",
];

// Backwards compatibility alias
export const NON_TRAINABLE_GAP_OPTIONS = DEAL_BREAKER_OPTIONS;

export const ROLE_OPEN_REASONS: Tag[] = [
  {
    id: "growth",
    label: "Team Growth",
    description: "New headcount to support expansion",
  },
  {
    id: "backfill_left",
    label: "Backfill - Left",
    description: "Someone left the role",
  },
  {
    id: "backfill_promoted",
    label: "Backfill - Promoted",
    description: "Someone was promoted from this role",
  },
  {
    id: "new_role",
    label: "New Role",
    description: "This position never existed before",
  },
  {
    id: "restructure",
    label: "Restructuring",
    description: "Org changes created this opening",
  },
];

export const AUTONOMY_LEVEL_OPTIONS: Tag[] = [
  {
    id: "high_guidance",
    label: "High Guidance",
    description: "Lots of support and hand-holding available",
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Some guidance initially, then independence",
  },
  {
    id: "self_directed",
    label: "Self-Directed",
    description: "Figure it out with minimal support",
  },
  {
    id: "sink_swim",
    label: "Sink or Swim",
    description: "Minimal support, high expectations from day 1",
  },
];

export const AMBIGUITY_LEVEL_OPTIONS: Tag[] = [
  {
    id: "clear",
    label: "Clear Roadmap",
    description: "Well-defined responsibilities and goals",
  },
  {
    id: "some",
    label: "Some Ambiguity",
    description: "Direction is set, details TBD",
  },
  {
    id: "high",
    label: "High Ambiguity",
    description: "Defining the role as you go",
  },
  {
    id: "chaos",
    label: "Chaos",
    description: "Expect frequent pivots and changes",
  },
];
