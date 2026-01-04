import React, { useState, useEffect, useRef } from "react";
import { Icons } from "../Icons";
import {
  BasicJobData,
  CalibrationData,
  CalibrationStep,
  RoleAnalysis,
  CalibrationQuestionsPayload,
  SectionFeedback,
  createInitialCalibrationData,
} from "../../types";
import { aiAPI, jobsAPI } from "../../lib/api-client";
import { EvaluationFramework } from "../../types/evaluationFramework";
import { generateCalibrationSummaryJSON } from "../../lib/calibrationSummary";
import CalibrationStep1 from "./CalibrationStep1";
import CalibrationStep2 from "./CalibrationStep2";
import CalibrationStep3 from "./CalibrationStep3";
import PreparationScreen from "./PreparationScreen";
import CalibrationComplete from "./CalibrationComplete";
import EvaluationFrameworkView from "./EvaluationFrameworkView";

interface JobCalibrationProps {
  jobId: string; // Actual database job ID for saving
  basicJobData: BasicJobData;
  onBack: () => void;
  onComplete: (jobId: string) => void;
}

export default function JobCalibration({
  jobId,
  basicJobData,
  onBack,
  onComplete,
}: JobCalibrationProps) {
  const [currentStep, setCurrentStep] = useState<CalibrationStep>("parsing");
  const [isLoading, setIsLoading] = useState(true);
  // This state ensures user MUST click button to proceed - prevents any auto-transition
  const [userConfirmedStart, setUserConfirmedStart] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [aiJobId, setAiJobId] = useState<string | undefined>(); // AI-generated job ID for tracking
  const [roleAnalysis, setRoleAnalysis] = useState<RoleAnalysis | undefined>();
  const [calibrationQuestions, setCalibrationQuestions] = useState<
    CalibrationQuestionsPayload | undefined
  >();
  const [calibrationData, setCalibrationData] = useState<CalibrationData>(
    createInitialCalibrationData()
  );
  const [evaluationFramework, setEvaluationFramework] = useState<
    EvaluationFramework | undefined
  >();

  // Prevent double-fetch in StrictMode
  const hasFetched = useRef(false);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentStep]);

  // Parse job description on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const parseJob = async () => {
      try {
        setIsLoading(true);
        setError(undefined);
        const response = await aiAPI.parseJob({
          title: basicJobData.title,
          description: basicJobData.description,
          positionType: basicJobData.positionType,
          department: basicJobData.department,
          locationType: basicJobData.locationType,
          experienceMin: basicJobData.experienceRange.min,
          experienceMax: basicJobData.experienceRange.max,
        });
        setAiJobId(response.jobId);
        setRoleAnalysis(response.roleAnalysis);
        setCalibrationQuestions(response.calibrationQuestions);

        // Auto-select all skills (all are explicitly mentioned now)
        const allMustHave =
          response.calibrationQuestions.skillRealityCheck.mustHaveSkills.map(
            (skill) => skill.id
          );

        const allGoodToHave =
          response.calibrationQuestions.skillRealityCheck.goodToHaveSkills.map(
            (skill) => skill.id
          );

        setCalibrationData((prev) => ({
          ...prev,
          mustHaveSkills: allMustHave,
          goodToHaveSkills: allGoodToHave,
        }));

        // Don't auto-transition - user clicks "Start Calibration" button
      } catch (err) {
        setError("Failed to analyze job description. Please try again.");
        console.error("Parse error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    parseJob();
  }, [basicJobData]);

  // Update calibration data
  const updateCalibrationData = (updates: Partial<CalibrationData>) => {
    setCalibrationData((prev) => ({ ...prev, ...updates }));
  };

  // Handle section feedback
  const handleFeedback = (feedback: SectionFeedback) => {
    setCalibrationData((prev) => {
      const existingFeedback = prev.sectionFeedback || [];
      const existingIndex = existingFeedback.findIndex(
        (f) => f.sectionId === feedback.sectionId
      );

      if (existingIndex >= 0) {
        // Update existing feedback
        const updated = [...existingFeedback];
        updated[existingIndex] = feedback;
        return { ...prev, sectionFeedback: updated };
      } else {
        // Add new feedback
        return { ...prev, sectionFeedback: [...existingFeedback, feedback] };
      }
    });
  };

  // Navigation handlers
  const handleStep1Complete = () => {
    setCurrentStep("calibration_2");
  };

  const handleStep2Complete = () => {
    setCurrentStep("calibration_3");
  };

  const handleStep3Complete = () => {
    // Move to summary/complete page to show JSON output
    setCurrentStep("summary");
  };

  const handleSummaryComplete = async () => {
    if (!aiJobId || !roleAnalysis || !calibrationQuestions) return;

    try {
      setCurrentStep("generating_framework");
      setIsLoading(true);
      setError(undefined);

      // Generate the calibration summary JSON (uses AI job ID for internal tracking)
      const summaryJSON = generateCalibrationSummaryJSON(
        aiJobId,
        basicJobData,
        roleAnalysis,
        calibrationQuestions,
        calibrationData
      );

      // Call the framework generation API - now returns { framework, post_processing }
      const response = await aiAPI.createFramework(summaryJSON);
      setEvaluationFramework(response.framework);
      setCurrentStep("framework_view");
    } catch (err) {
      console.error("Framework generation error:", err);
      setError("Failed to generate evaluation framework. Please try again.");
      setCurrentStep("summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrameworkComplete = async () => {
    if (
      !aiJobId ||
      !roleAnalysis ||
      !calibrationQuestions ||
      !evaluationFramework
    )
      return;

    try {
      setCurrentStep("saving");
      setIsLoading(true);

      // Generate calibration summary for persistence (uses AI job ID for internal tracking)
      const calibrationSummary = generateCalibrationSummaryJSON(
        aiJobId,
        basicJobData,
        roleAnalysis,
        calibrationQuestions,
        calibrationData
      );

      // Save calibration results to backend using actual database job ID
      await jobsAPI.saveCalibration(jobId, {
        calibration_summary: calibrationSummary,
        evaluation_framework: evaluationFramework,
      });

      setCurrentStep("complete");
      onComplete(jobId);
    } catch (err) {
      console.error("Failed to save calibration:", err);
      setError("Failed to save calibration. Please try again.");
      setCurrentStep("framework_view");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepBack = (targetStep: CalibrationStep) => {
    setCurrentStep(targetStep);
  };

  // Render preparation screen - stays here until user explicitly clicks "Start Calibration"
  // Two conditions must be met to proceed:
  // 1. isLoading must be false (API call complete)
  // 2. userConfirmedStart must be true (user clicked button)
  if (currentStep === "parsing" && !userConfirmedStart) {
    return (
      <PreparationScreen
        isProcessing={isLoading}
        onContinue={() => {
          console.log("[JobCalibration] User clicked Start Calibration");
          setUserConfirmedStart(true);
          setCurrentStep("calibration_1");
        }}
      />
    );
  }

  // Render summary/complete screen with JSON output
  if (
    (currentStep === "summary" || currentStep === "generating_framework") &&
    aiJobId &&
    roleAnalysis &&
    calibrationQuestions
  ) {
    return (
      <CalibrationComplete
        jobId={aiJobId}
        basicJobData={basicJobData}
        roleAnalysis={roleAnalysis}
        calibrationQuestions={calibrationQuestions}
        calibrationData={calibrationData}
        onBack={() => setCurrentStep("calibration_3")}
        onDone={handleSummaryComplete}
        isGenerating={currentStep === "generating_framework"}
      />
    );
  }

  // Render evaluation framework view
  if (currentStep === "framework_view" && evaluationFramework) {
    return (
      <EvaluationFrameworkView
        framework={evaluationFramework}
        onBack={() => setCurrentStep("summary")}
        onDone={handleFrameworkComplete}
      />
    );
  }

  // Render saving state
  if (currentStep === "saving") {
    return (
      <div className="min-h-full p-8 lg:p-12">
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Icons.Zap className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-2">
              Saving Calibrated Job
            </h3>
            <p className="text-zinc-500 text-sm text-center max-w-md">
              Saving your calibrated job posting...
            </p>
            <div className="mt-8 flex items-center gap-2">
              <div
                className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-full p-8 lg:p-12">
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Icons.X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-zinc-500 text-sm text-center max-w-md mb-6">
              {error}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-6 py-2.5 border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current step number for progress
  const stepNumber =
    currentStep === "calibration_1"
      ? 1
      : currentStep === "calibration_2"
        ? 2
        : 3;
  const totalSteps = 3;

  // Compute validation for each step based on calibrationData
  const computeStep1Valid = () => {
    const skillsValid = calibrationData.mustHaveSkills.length >= 1;
    const assessmentPrioritiesValid =
      (calibrationData.pipelineCalibration?.assessmentPriorities || [])
        .length >= 1;
    const problemTypesValid =
      (calibrationData.pipelineCalibration?.problemTypes || []).length >= 1;
    return {
      canProceed: skillsValid && assessmentPrioritiesValid && problemTypesValid,
      skillsValid,
      assessmentPrioritiesValid,
      problemTypesValid,
    };
  };

  const computeStep2Valid = () => {
    const experienceTradeoffs =
      calibrationQuestions?.experienceTradeoffs?.scenarios?.filter(
        (s) => s.relevance === "High" || s.relevance === "Medium"
      ) || [];
    const roleSpecificScenarios =
      calibrationQuestions?.roleSpecificTradeoffs?.scenarios || [];
    const allTradeoffs = [...experienceTradeoffs, ...roleSpecificScenarios];
    const answeredTradeoffs = allTradeoffs.filter(
      (s) => calibrationData.experienceTradeoffs[s.id] !== undefined
    ).length;
    const tradeoffsValid = answeredTradeoffs === allTradeoffs.length;
    // Candidate Evaluation Criteria validation
    const rejectionValid =
      (calibrationData.redFlags?.rejectionBehaviors || []).length >= 1;
    const trainableValid =
      (calibrationData.redFlags?.trainableGaps || []).length >= 1;
    const nonTrainableValid =
      (calibrationData.redFlags?.nonTrainableGaps || []).length >= 1;
    const evaluationValid =
      rejectionValid && trainableValid && nonTrainableValid;
    return {
      canProceed: tradeoffsValid && evaluationValid,
      tradeoffsValid,
      rejectionValid,
      trainableValid,
      nonTrainableValid,
      allTradeoffsCount: allTradeoffs.length,
    };
  };

  const computeStep3Valid = () => {
    const trajectoryValid = !!calibrationData.pipelineCalibration?.trajectory;
    const challengesValid =
      calibrationData.honestAssessment.challenges.length >= 1;
    const milestonesValid = calibrationData.day60Expectations.length >= 1;
    return {
      canProceed: trajectoryValid && challengesValid && milestonesValid,
      trajectoryValid,
      challengesValid,
      milestonesValid,
    };
  };

  const step1Validation = computeStep1Valid();
  const step2Validation = computeStep2Valid();
  const step3Validation = computeStep3Valid();

  // Get current validation and handlers based on step
  const getFooterProps = () => {
    switch (currentStep) {
      case "calibration_1":
        return {
          canProceed: step1Validation.canProceed,
          onNext: handleStep1Complete,
          onBack: onBack,
          validationMessage: !step1Validation.skillsValid
            ? "Confirm at least 1 must-have skill"
            : !step1Validation.assessmentPrioritiesValid
              ? "Select at least 1 assessment priority"
              : !step1Validation.problemTypesValid
                ? "Select at least 1 problem type"
                : "",
          isLastStep: false,
        };
      case "calibration_2":
        return {
          canProceed: step2Validation.canProceed,
          onNext: handleStep2Complete,
          onBack: () => handleStepBack("calibration_1"),
          validationMessage: !step2Validation.tradeoffsValid
            ? `Answer all ${step2Validation.allTradeoffsCount} trade-offs`
            : !step2Validation.rejectionValid
              ? "Select at least 1 non-negotiable standard"
              : !step2Validation.trainableValid
                ? "Select at least 1 growth opportunity"
                : !step2Validation.nonTrainableValid
                  ? "Select at least 1 day 1 essential"
                  : "",
          isLastStep: false,
        };
      case "calibration_3":
        return {
          canProceed: step3Validation.canProceed,
          onNext: handleStep3Complete,
          onBack: () => handleStepBack("calibration_2"),
          validationMessage: !step3Validation.trajectoryValid
            ? "Select trajectory"
            : !step3Validation.challengesValid
              ? "Select at least 1 challenge"
              : !step3Validation.milestonesValid
                ? "Select at least 1 milestone"
                : "",
          isLastStep: true,
        };
      default:
        return {
          canProceed: false,
          onNext: () => {},
          onBack: () => {},
          validationMessage: "",
          isLastStep: false,
        };
    }
  };

  const footerProps = getFooterProps();

  return (
    <div className="min-h-full flex flex-col">
      {/* Scrollable content area with padding */}
      <div className="flex-1 overflow-auto p-8 lg:p-12 pb-24">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
            >
              <Icons.ArrowLeft className="w-4 h-4" /> Back to Job Details
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400">
                Step {stepNumber} of {totalSteps}
              </span>
              <span className="text-zinc-300">|</span>
              <span className="text-zinc-500 flex items-center gap-1">
                <Icons.Clock className="w-3.5 h-3.5" />~{4 - stepNumber} min
                remaining
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === "calibration_1" && calibrationQuestions && (
            <CalibrationStep1
              questions={calibrationQuestions}
              calibrationData={calibrationData}
              updateCalibrationData={updateCalibrationData}
              onFeedback={handleFeedback}
            />
          )}

          {currentStep === "calibration_2" && calibrationQuestions && (
            <CalibrationStep2
              questions={calibrationQuestions}
              calibrationData={calibrationData}
              updateCalibrationData={updateCalibrationData}
              onFeedback={handleFeedback}
            />
          )}

          {currentStep === "calibration_3" && calibrationQuestions && (
            <CalibrationStep3
              questions={calibrationQuestions}
              calibrationData={calibrationData}
              updateCalibrationData={updateCalibrationData}
              onFeedback={handleFeedback}
            />
          )}
        </div>
      </div>

      {/* Footer - sibling to content, naturally full width */}
      <div className="sticky bottom-0 bg-white border-t border-zinc-200 p-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={footerProps.onBack}
            disabled={isLoading}
            className="text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors px-4 py-2 disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex items-center gap-4">
            {!footerProps.canProceed && footerProps.validationMessage && (
              <span className="text-xs text-zinc-400">
                {footerProps.validationMessage}
              </span>
            )}
            <button
              onClick={footerProps.onNext}
              disabled={!footerProps.canProceed || isLoading}
              className={`
                px-8 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${
                  footerProps.canProceed && !isLoading
                    ? footerProps.isLastStep
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                      : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                }
              `}
            >
              {isLoading ? (
                "Saving..."
              ) : footerProps.isLastStep ? (
                <>
                  Complete Calibration <Icons.Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Step <Icons.ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
