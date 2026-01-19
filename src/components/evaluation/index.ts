/**
 * Evaluation Components
 * Clean exports for all evaluation UI components
 */

// Import styles (CSS custom properties for consistent sizing)
import "./styles.css";

// Types - Centralized type definitions
export type {
  EligibilityStatus,
  FlagSeverity,
  SignalStrength,
  SourceType,
  TabId,
  Tier,
  PillVariant,
  PersonalInfo,
  CategoryScore,
  Constraint,
  RedFlag,
  InterviewQuestion,
  SkillMatch,
  MissingSkill,
  QuickStats,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeSkills,
  ResumeCertification,
  ResumeData,
} from "./types";

// Config - Centralized configuration objects
export {
  pillVariantStyles,
  eligibilityConfig,
  severityConfig,
  signalConfig,
  sourceLabels,
  tierConfig,
  flagTypeLabels,
  getFlagTypeLabel,
} from "./config";

// Colors
export {
  colors,
  getColor,
  getScoreColor,
  type ColorName,
  type ColorSet,
} from "./colors";

// Utilities
export { getInitials, formatRelativeDate, formatDate } from "./utils";

// Icons - Stroke-based
export {
  StarIcon,
  GraduationIcon,
  DocumentIcon,
  CircleXIcon,
  CircleCheckIcon,
  HourglassIcon,
  CheckIcon,
  WarningIcon,
  FlagIcon,
  CloseIcon,
  ChevronDownIcon,
  InfoCircleIcon,
  MessageIcon,
  BriefcaseIcon,
  QuoteIcon,
  PillIcons,
  PillIconsBold,
} from "./icons";

// Icons - Filled
export {
  EmailFilledIcon,
  PhoneFilledIcon,
  LocationFilledIcon,
  ChartFilledIcon,
  ShieldFilledIcon,
  FlagFilledIcon,
  GlobeFilledIcon,
  DocumentFilledIcon,
  CheckCircleFilledIcon,
  AlertTriangleFilledIcon,
  LinkedInIcon,
  GitHubIcon,
} from "./icons";

// Shared Components
export { AnimatedPill, type AnimatedPillProps } from "./shared";
export { PersonalInfoDisplay, type PersonalInfoDisplayProps } from "./shared";
export { SectionHeader, type SectionHeaderProps } from "./shared";

// Status Pills
export { StatusPill, EligibilityPill, EligibilityIcon } from "./StatusPill";

// Score Ring
export { ScoreRing, ScoreRingLegend, ScoreRingWithLegend } from "./ScoreRing";

// Constraint Accordion
export { ConstraintAccordion } from "./ConstraintAccordion";

// Red Flags Accordion
export { RedFlagsAccordion } from "./RedFlagsAccordion";

// Interview Questions Accordion
export { InterviewQuestionsAccordion } from "./InterviewQuestionsAccordion";

// Skills Grid
export { SkillsGrid } from "./SkillsGrid";

// Score Summary Panel
export {
  ScoreSummaryPanel,
  type ScoreSummaryPanelProps,
} from "./ScoreSummaryPanel";

// Insights Card (Strengths & Weaknesses)
export { InsightsCard, type InsightsCardProps } from "./InsightsCard";

// Evaluation Tabs
export {
  EvaluationTabs,
  useEvaluationTabs,
  type EvaluationTabsProps,
} from "./EvaluationTabs";

// Resume View
export { ResumeView, type ResumeViewProps } from "./ResumeView";

// Candidate List
export {
  CandidateList,
  type CandidateListProps,
  type CandidateListItem,
} from "./CandidateList";

// Skeleton Loading States
export {
  ScoreRingSkeleton,
  ScoreSummaryPanelSkeleton,
  InsightsCardSkeleton,
  SkillsGridSkeleton,
  AccordionSkeleton,
  CandidateListSkeleton,
  EvaluationPageSkeleton,
} from "./Skeleton";

// Data Store (Zustand + LRU Cache)
export {
  useCandidateStore,
  useCurrentCandidate,
  useLoadingState,
  useError,
  LRUCache,
  candidateCache,
} from "./store";
export type {
  CandidateData,
  CandidateOverview,
  CandidateEvaluation,
  LoadingState,
} from "./store";
