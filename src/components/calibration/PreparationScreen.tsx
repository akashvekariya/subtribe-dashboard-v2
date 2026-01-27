import React, { useState, useEffect, useRef } from "react";
import { Icons } from "../Icons";

interface PreparationScreenProps {
  isProcessing: boolean;
  onContinue: () => void;
}

const PROCESSING_STAGES = [
  "Extracting job title and role family",
  "Understanding skills requirements",
  "Analyzing experience expectations",
  "Identifying hiring trade-offs",
  "Detecting role-specific challenges",
  "Generating calibration questions",
  "Preparing your review",
];

const BENEFITS = [
  {
    title: "Expose Hidden Conflicts",
    description:
      "Job descriptions often contain contradictory requirements. We help you identify and resolve them before you start reviewing candidates.",
    icon: "search",
  },
  {
    title: "Consistent Evaluation",
    description:
      "By defining your priorities upfront, every candidate gets evaluated against the same criteria - reducing bias and improving decision quality.",
    icon: "scale",
  },
  {
    title: "Faster Hiring Decisions",
    description:
      "When you know exactly what matters, there's no debate during candidate review. Teams align faster and hire with confidence.",
    icon: "clock",
  },
  {
    title: "Better Candidate Experience",
    description:
      "Clear expectations help candidates self-select. The right people apply, and they know exactly what success looks like.",
    icon: "users",
  },
];

export default function PreparationScreen({
  isProcessing,
  onContinue,
}: PreparationScreenProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get random interval between 3-5 seconds
  const getRandomInterval = () => Math.floor(Math.random() * 2000) + 3000;

  // Typewriter effect
  useEffect(() => {
    if (!isProcessing) {
      setDisplayText("Ready for your review");
      setIsTyping(false);
      return;
    }

    const currentText = PROCESSING_STAGES[currentStageIndex];
    let charIndex = 0;
    setDisplayText("");
    setIsTyping(true);

    // Type out the current stage text
    const typeInterval = setInterval(() => {
      if (charIndex < currentText.length) {
        setDisplayText(currentText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);

        // Wait random time then move to next stage
        timeoutRef.current = setTimeout(() => {
          setCurrentStageIndex((prev) => {
            const next = (prev + 1) % PROCESSING_STAGES.length;
            return next;
          });
        }, getRandomInterval());
      }
    }, 40); // Type speed: 40ms per character

    return () => {
      clearInterval(typeInterval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isProcessing, currentStageIndex]);

  const isReady = !isProcessing;

  const getBenefitIcon = (iconName: string) => {
    const className = "w-5 h-5 text-zinc-600";
    switch (iconName) {
      case "search":
        return <Icons.Search className={className} />;
      case "scale":
        return <Icons.Scale className={className} />;
      case "clock":
        return <Icons.Clock className={className} />;
      case "users":
        return <Icons.Users className={className} />;
      default:
        return <Icons.Info className={className} />;
    }
  };

  return (
    <div className="min-h-full p-8 lg:p-12">
      <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
        {/* Processing Status Card */}
        <div
          className={`
          rounded-2xl border shadow-sm p-6 mb-8 transition-all duration-500
          ${
            isReady
              ? "bg-green-50 border-green-200"
              : "bg-white border-zinc-200"
          }
        `}
        >
          <div className="flex items-center gap-3">
            {isReady ? (
              <>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Icons.CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">
                    Ready for Your Review
                  </h3>
                  <p className="text-sm text-green-700">
                    All calibration questions have been generated
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900">
                      {displayText}
                    </span>
                    {isTyping && (
                      <span className="w-0.5 h-5 bg-zinc-900 animate-pulse" />
                    )}
                    {!isTyping && <span className="text-zinc-400">...</span>}
                  </div>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    This usually takes 15-30 seconds
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Educational Content */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Why Calibration Matters
            </h2>
            <p className="text-zinc-600">
              Before you review any resumes, taking a few minutes to calibrate
              your requirements can dramatically improve your hiring outcomes.{" "}
              {"Here's why:"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                  {getBenefitIcon(benefit.icon)}
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats/Social Proof */}
          <div className="bg-zinc-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-zinc-900">73%</div>
                <div className="text-xs text-zinc-500">
                  {
                    'of hiring managers change their "must-haves" after seeing candidates'
                  }
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-900">2.3x</div>
                <div className="text-xs text-zinc-500">
                  faster hiring decisions with pre-defined criteria
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-900">89%</div>
                <div className="text-xs text-zinc-500">
                  better candidate-job fit with calibrated requirements
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Preview */}
          <div className="border-t border-zinc-100 pt-6">
            <h3 className="font-medium text-zinc-900 mb-3">
              {"What You'll Do Next"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                  1
                </div>
                <span className="text-zinc-600">
                  <strong className="text-zinc-900">Confirm key skills</strong>{" "}
                  - validate which skills truly matter for this role
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                  2
                </div>
                <span className="text-zinc-600">
                  <strong className="text-zinc-900">
                    Make trade-off decisions
                  </strong>{" "}
                  - choose between competing candidate profiles
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                  3
                </div>
                <span className="text-zinc-600">
                  <strong className="text-zinc-900">Set expectations</strong> -
                  define what success looks like in the first 60 days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Button */}
        <div className="mt-8 flex justify-end">
          <div className="relative group">
            <button
              onClick={onContinue}
              disabled={!isReady}
              className={`
                px-8 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${
                  isReady
                    ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                }
              `}
            >
              {isReady ? (
                <>
                  Start Calibration <Icons.ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Processing...{" "}
                  <Icons.Loader2 className="w-4 h-4 animate-spin" />
                </>
              )}
            </button>

            {/* Tooltip for disabled state */}
            {!isReady && (
              <div
                className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2
                bg-zinc-900 text-white text-xs rounded-lg whitespace-nowrap
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                pointer-events-none
              "
              >
                Analyzing your job description...
                <br />
                <span className="text-zinc-400">
                  Will be ready in a few seconds
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-zinc-900" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
