import React from "react";
import { Icons } from "../Icons";
import {
  CalibrationData,
  CalibrationQuestionsPayload,
  TradeoffScenario,
  SectionFeedback,
} from "../../types";
import SpectrumSelector from "./SpectrumSelector";
import FeedbackWidget from "./FeedbackWidget";
import InfoPopup, { SECTION_INFO } from "./InfoPopup";
import CustomInputOption from "./CustomInputOption";

interface CalibrationStep2Props {
  questions: CalibrationQuestionsPayload;
  calibrationData: CalibrationData;
  updateCalibrationData: (updates: Partial<CalibrationData>) => void;
  onFeedback: (feedback: SectionFeedback) => void;
}

// Trade-off Card with Spectrum - simplified without tags
const TradeoffCard = ({
  scenario,
  value,
  onChange,
}: {
  scenario: TradeoffScenario;
  value: number | undefined;
  onChange: (value: number) => void;
}) => {
  if (scenario.options.length < 2) return null;

  return (
    <div
      className={`bg-white rounded-xl border border-zinc-200 p-6 transition-all duration-200 ${value !== undefined ? "shadow-sm" : ""}`}
    >
      <div className="mb-4">
        <h4 className="font-medium text-zinc-900 mb-1">{scenario.title}</h4>
        <p className="text-sm text-zinc-500">{scenario.description}</p>
      </div>
      <SpectrumSelector
        optionA={scenario.options[0]}
        optionB={scenario.options[1]}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default function CalibrationStep2({
  questions,
  calibrationData,
  updateCalibrationData,
  onFeedback,
}: CalibrationStep2Props) {
  const {
    experienceTradeoffs,
    roleSpecificTradeoffs,
    redFlags: redFlagsQuestions,
  } = questions || {};
  const { experienceTradeoffs: tradeoffValues, redFlags: redFlagsData } =
    calibrationData;

  // Filter trade-offs by relevance (only show High and Medium)
  const relevantTradeoffs = (experienceTradeoffs?.scenarios || []).filter(
    (s) => s.relevance === "High" || s.relevance === "Medium"
  );

  // Role-specific trade-offs (already filtered by LLM)
  const roleSpecificScenarios = roleSpecificTradeoffs?.scenarios || [];

  // Trade-off handlers
  const handleTradeoffChange = (scenarioId: string, value: number) => {
    updateCalibrationData({
      experienceTradeoffs: {
        ...tradeoffValues,
        [scenarioId]: value,
      },
    });
  };

  // Red flags handlers
  const handleRejectionBehaviorToggle = (behavior: string) => {
    const current = redFlagsData?.rejectionBehaviors || [];
    const isSelected = current.includes(behavior);
    const maxReached = current.length >= 3 && !isSelected;
    if (maxReached) return;
    updateCalibrationData({
      redFlags: {
        ...redFlagsData,
        rejectionBehaviors: isSelected
          ? current.filter((b) => b !== behavior)
          : [...current, behavior],
      },
    });
  };

  const handleTrainableGapToggle = (gap: string) => {
    const current = redFlagsData?.trainableGaps || [];
    const isSelected = current.includes(gap);
    const maxReached = current.length >= 3 && !isSelected;
    if (maxReached) return;
    updateCalibrationData({
      redFlags: {
        ...redFlagsData,
        trainableGaps: isSelected
          ? current.filter((g) => g !== gap)
          : [...current, gap],
      },
    });
  };

  const handleNonTrainableToggle = (gap: string) => {
    const current = redFlagsData?.nonTrainableGaps || [];
    const isSelected = current.includes(gap);
    const maxReached = current.length >= 2 && !isSelected;
    if (maxReached) return;
    updateCalibrationData({
      redFlags: {
        ...redFlagsData,
        nonTrainableGaps: isSelected
          ? current.filter((g) => g !== gap)
          : [...current, gap],
      },
    });
  };

  // Custom input handlers
  const handleCustomRejectionBehavior = (behavior: string) => {
    const current = redFlagsData?.rejectionBehaviors || [];
    if (current.length >= 3 || current.includes(behavior)) return;
    updateCalibrationData({
      redFlags: { ...redFlagsData, rejectionBehaviors: [...current, behavior] },
    });
  };

  const handleCustomTrainableGap = (gap: string) => {
    const current = redFlagsData?.trainableGaps || [];
    if (current.length >= 3 || current.includes(gap)) return;
    updateCalibrationData({
      redFlags: { ...redFlagsData, trainableGaps: [...current, gap] },
    });
  };

  const handleCustomNonTrainable = (gap: string) => {
    const current = redFlagsData?.nonTrainableGaps || [];
    if (current.length >= 2 || current.includes(gap)) return;
    updateCalibrationData({
      redFlags: { ...redFlagsData, nonTrainableGaps: [...current, gap] },
    });
  };

  // Combine all trade-offs for display
  const allTradeoffs = [...relevantTradeoffs, ...roleSpecificScenarios];
  const answeredTradeoffs = allTradeoffs.filter(
    (s) => tradeoffValues[s.id] !== undefined
  ).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Section 1: Hiring Trade-offs (merged Experience + Role-Specific) */}
      {allTradeoffs.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                <Icons.Scale className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Hiring Trade-offs
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Every hire involves trade-offs. Where do you lean on the
                  spectrum?
                </p>
              </div>
            </div>
            <InfoPopup title="Hiring Trade-offs">
              {SECTION_INFO.hiringTradeoffs}
            </InfoPopup>
          </div>

          <div className="space-y-6">
            {allTradeoffs.map((scenario) => (
              <TradeoffCard
                key={scenario.id}
                scenario={scenario}
                value={tradeoffValues[scenario.id]}
                onChange={(value) => handleTradeoffChange(scenario.id, value)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
            <span
              className={`text-sm ${answeredTradeoffs >= allTradeoffs.length ? "text-green-600" : "text-zinc-400"}`}
            >
              {answeredTradeoffs}/{allTradeoffs.length} answered
              {answeredTradeoffs >= allTradeoffs.length && (
                <Icons.Check className="w-4 h-4 inline ml-1" />
              )}
            </span>
            <FeedbackWidget
              sectionId="hiring_tradeoffs"
              existingFeedback={calibrationData.sectionFeedback?.find(
                (f) => f.sectionId === "hiring_tradeoffs"
              )}
              onFeedback={onFeedback}
            />
          </div>
        </div>
      )}

      {/* Section 2: Candidate Evaluation Criteria */}
      {redFlagsQuestions && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                <Icons.Shield className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Candidate Evaluation Criteria
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Define standards for evaluating candidates, what you can
                  develop, and what must exist from day 1.
                </p>
              </div>
            </div>
            <InfoPopup title="Candidate Evaluation Criteria">
              {SECTION_INFO.evaluationCriteria}
            </InfoPopup>
          </div>

          <div className="space-y-8">
            {/* Rejection Behaviors - Red theme */}
            {redFlagsQuestions.rejectionBehaviors &&
              redFlagsQuestions.rejectionBehaviors.length > 0 && (
                <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Icons.X className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-900">
                        Non-Negotiable Standards
                      </h4>
                      <p className="text-xs text-red-600">
                        Behaviors that indicate a poor fit (select up to 3)
                      </p>
                    </div>
                    <span className="ml-auto text-xs font-medium text-red-500 bg-red-100 px-2 py-1 rounded-full">
                      {(redFlagsData?.rejectionBehaviors || []).length}/3
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {redFlagsQuestions.rejectionBehaviors.map((behavior) => {
                      const selected = (
                        redFlagsData?.rejectionBehaviors || []
                      ).includes(behavior);
                      const maxReached =
                        (redFlagsData?.rejectionBehaviors || []).length >= 3;
                      return (
                        <button
                          key={behavior}
                          onClick={() =>
                            handleRejectionBehaviorToggle(behavior)
                          }
                          disabled={!selected && maxReached}
                          className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left border-2 transition-all duration-200
                          ${
                            selected
                              ? "bg-red-600 border-red-600 text-white shadow-md"
                              : maxReached
                                ? "bg-white/50 border-zinc-200 text-zinc-300 cursor-not-allowed"
                                : "bg-white border-zinc-200 text-zinc-700 hover:border-red-300 hover:shadow-sm"
                          }
                        `}
                        >
                          <span
                            className={`
                          w-6 h-6 rounded-full flex items-center justify-center shrink-0
                          ${selected ? "bg-white/20" : "bg-red-50"}
                        `}
                          >
                            <Icons.X
                              className={`w-3.5 h-3.5 ${selected ? "text-white" : "text-red-400"}`}
                            />
                          </span>
                          <span className="flex-1">{behavior}</span>
                          {selected && (
                            <Icons.Check className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                    {/* Custom rejection behaviors */}
                    {(redFlagsData?.rejectionBehaviors || [])
                      .filter(
                        (b) => !redFlagsQuestions.rejectionBehaviors.includes(b)
                      )
                      .map((custom) => (
                        <button
                          key={custom}
                          onClick={() => handleRejectionBehaviorToggle(custom)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left border-2 bg-red-600 border-red-600 text-white shadow-md transition-all duration-200"
                        >
                          <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/20">
                            <Icons.X className="w-3.5 h-3.5 text-white" />
                          </span>
                          <span className="flex-1">{custom}</span>
                          <Icons.Check className="w-4 h-4 shrink-0" />
                        </button>
                      ))}
                  </div>
                  <div className="mt-3">
                    <CustomInputOption
                      placeholder="e.g., Dismissive of feedback during interviews"
                      onAdd={handleCustomRejectionBehavior}
                      disabled={
                        (redFlagsData?.rejectionBehaviors || []).length >= 3
                      }
                    />
                  </div>
                </div>
              )}

            {/* Trainable Gaps - Green theme */}
            {redFlagsQuestions.trainableGaps &&
              redFlagsQuestions.trainableGaps.length > 0 && (
                <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icons.GraduationCap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-green-900">
                        Growth Opportunities
                      </h4>
                      <p className="text-xs text-green-600">
                        Skills we can develop on the job (select up to 3)
                      </p>
                    </div>
                    <span className="ml-auto text-xs font-medium text-green-500 bg-green-100 px-2 py-1 rounded-full">
                      {(redFlagsData?.trainableGaps || []).length}/3
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {redFlagsQuestions.trainableGaps.map((gap) => {
                      const selected = (
                        redFlagsData?.trainableGaps || []
                      ).includes(gap);
                      const maxReached =
                        (redFlagsData?.trainableGaps || []).length >= 3;
                      return (
                        <button
                          key={gap}
                          onClick={() => handleTrainableGapToggle(gap)}
                          disabled={!selected && maxReached}
                          className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left border-2 transition-all duration-200
                          ${
                            selected
                              ? "bg-green-600 border-green-600 text-white shadow-md"
                              : maxReached
                                ? "bg-white/50 border-zinc-200 text-zinc-300 cursor-not-allowed"
                                : "bg-white border-zinc-200 text-zinc-700 hover:border-green-300 hover:shadow-sm"
                          }
                        `}
                        >
                          <span
                            className={`
                          w-6 h-6 rounded-full flex items-center justify-center shrink-0
                          ${selected ? "bg-white/20" : "bg-green-50"}
                        `}
                          >
                            <Icons.GraduationCap
                              className={`w-3.5 h-3.5 ${selected ? "text-white" : "text-green-400"}`}
                            />
                          </span>
                          <span className="flex-1">{gap}</span>
                          {selected && (
                            <Icons.Check className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                    {/* Custom trainable gaps */}
                    {(redFlagsData?.trainableGaps || [])
                      .filter(
                        (g) => !redFlagsQuestions.trainableGaps.includes(g)
                      )
                      .map((custom) => (
                        <button
                          key={custom}
                          onClick={() => handleTrainableGapToggle(custom)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left border-2 bg-green-600 border-green-600 text-white shadow-md transition-all duration-200"
                        >
                          <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/20">
                            <Icons.GraduationCap className="w-3.5 h-3.5 text-white" />
                          </span>
                          <span className="flex-1">{custom}</span>
                          <Icons.Check className="w-4 h-4 shrink-0" />
                        </button>
                      ))}
                  </div>
                  <div className="mt-3">
                    <CustomInputOption
                      placeholder="e.g., Specific testing frameworks"
                      onAdd={handleCustomTrainableGap}
                      disabled={(redFlagsData?.trainableGaps || []).length >= 3}
                    />
                  </div>
                </div>
              )}

            {/* Non-Trainable Gaps - Amber theme */}
            {redFlagsQuestions.nonTrainableGaps &&
              redFlagsQuestions.nonTrainableGaps.length > 0 && (
                <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Icons.Lock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">
                        Day 1 Essentials
                      </h4>
                      <p className="text-xs text-amber-600">
                        Capabilities needed from the start (select up to 2)
                      </p>
                    </div>
                    <span className="ml-auto text-xs font-medium text-amber-500 bg-amber-100 px-2 py-1 rounded-full">
                      {(redFlagsData?.nonTrainableGaps || []).length}/2
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {redFlagsQuestions.nonTrainableGaps.map((gap) => {
                      const selected = (
                        redFlagsData?.nonTrainableGaps || []
                      ).includes(gap);
                      const maxReached =
                        (redFlagsData?.nonTrainableGaps || []).length >= 2;
                      return (
                        <button
                          key={gap}
                          onClick={() => handleNonTrainableToggle(gap)}
                          disabled={!selected && maxReached}
                          className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left border-2 transition-all duration-200
                          ${
                            selected
                              ? "bg-amber-600 border-amber-600 text-white shadow-md"
                              : maxReached
                                ? "bg-white/50 border-zinc-200 text-zinc-300 cursor-not-allowed"
                                : "bg-white border-zinc-200 text-zinc-700 hover:border-amber-300 hover:shadow-sm"
                          }
                        `}
                        >
                          <span
                            className={`
                          w-6 h-6 rounded-full flex items-center justify-center shrink-0
                          ${selected ? "bg-white/20" : "bg-amber-50"}
                        `}
                          >
                            <Icons.Lock
                              className={`w-3.5 h-3.5 ${selected ? "text-white" : "text-amber-400"}`}
                            />
                          </span>
                          <span className="flex-1">{gap}</span>
                          {selected && (
                            <Icons.Check className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                    {/* Custom non-trainable gaps */}
                    {(redFlagsData?.nonTrainableGaps || [])
                      .filter(
                        (g) => !redFlagsQuestions.nonTrainableGaps.includes(g)
                      )
                      .map((custom) => (
                        <button
                          key={custom}
                          onClick={() => handleNonTrainableToggle(custom)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left border-2 bg-amber-600 border-amber-600 text-white shadow-md transition-all duration-200"
                        >
                          <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-white/20">
                            <Icons.Lock className="w-3.5 h-3.5 text-white" />
                          </span>
                          <span className="flex-1">{custom}</span>
                          <Icons.Check className="w-4 h-4 shrink-0" />
                        </button>
                      ))}
                  </div>
                  <div className="mt-3">
                    <CustomInputOption
                      placeholder="e.g., Strong written communication"
                      onAdd={handleCustomNonTrainable}
                      disabled={
                        (redFlagsData?.nonTrainableGaps || []).length >= 2
                      }
                    />
                  </div>
                </div>
              )}
          </div>

          <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-100">
            <FeedbackWidget
              sectionId="evaluation_criteria"
              existingFeedback={calibrationData.sectionFeedback?.find(
                (f) => f.sectionId === "evaluation_criteria"
              )}
              onFeedback={onFeedback}
            />
          </div>
        </div>
      )}
    </div>
  );
}
