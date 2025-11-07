import React, { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";

export interface ScreeningQuestion {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox";
  question: string;
  required: boolean;
  options?: string[];
}

interface ScreeningQuestionsBuilderProps {
  questions: Omit<ScreeningQuestion, "id">[];
  onChange: (questions: Omit<ScreeningQuestion, "id">[]) => void;
  disabled?: boolean;
}

export function ScreeningQuestionsBuilder({
  questions,
  onChange,
  disabled = false,
}: ScreeningQuestionsBuilderProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const addQuestion = () => {
    const newQuestion: Omit<ScreeningQuestion, "id"> = {
      type: "text",
      question: "",
      required: false,
      options: [],
    };
    onChange([...questions, newQuestion]);
    setExpandedQuestion(questions.length);
  };

  const updateQuestion = (
    index: number,
    updates: Partial<Omit<ScreeningQuestion, "id">>
  ) => {
    const updated = questions.map((q, i) =>
      i === index ? { ...q, ...updates } : q
    );
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    }
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    const options = [...(question.options || []), ""];
    updateQuestion(questionIndex, { options });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const question = questions[questionIndex];
    const options = [...(question.options || [])];
    options[optionIndex] = value;
    updateQuestion(questionIndex, { options });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    const options = (question.options || []).filter(
      (_, i) => i !== optionIndex
    );
    updateQuestion(questionIndex, { options });
  };

  const questionTypes = [
    { value: "text", label: "Short Text" },
    { value: "textarea", label: "Long Text" },
    { value: "select", label: "Dropdown" },
    { value: "radio", label: "Multiple Choice" },
    { value: "checkbox", label: "Checkboxes" },
  ];

  const needsOptions = (type: string) =>
    ["select", "radio", "checkbox"].includes(type);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Screening Questions</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuestion}
          disabled={disabled}
          className="inline-flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-500">
            No screening questions added yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Click &ldquo;Add Question&rdquo; to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Question Header */}
              <div
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === index ? null : index)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {question.question || "Untitled Question"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {
                        questionTypes.find((t) => t.value === question.type)
                          ?.label
                      }
                      {question.required && " • Required"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {expandedQuestion === index ? "Collapse" : "Expand"}
                    </span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(index);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Details */}
              {expandedQuestion === index && (
                <div className="p-4 border-t border-gray-200 space-y-4">
                  {/* Question Text */}
                  <div>
                    <Label htmlFor={`question-${index}`}>Question</Label>
                    <Input
                      id={`question-${index}`}
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(index, { question: e.target.value })
                      }
                      placeholder="Enter your question..."
                      disabled={disabled}
                    />
                  </div>

                  {/* Question Type and Required */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`type-${index}`}>Question Type</Label>
                      <select
                        id={`type-${index}`}
                        value={question.type}
                        onChange={(e) =>
                          updateQuestion(index, {
                            type: e.target.value as ScreeningQuestion["type"],
                            options: needsOptions(e.target.value)
                              ? [""]
                              : undefined,
                          })
                        }
                        disabled={disabled}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {questionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) =>
                            updateQuestion(index, {
                              required: e.target.checked,
                            })
                          }
                          disabled={disabled}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                    </div>
                  </div>

                  {/* Options for select/radio/checkbox */}
                  {needsOptions(question.type) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(index)}
                          disabled={disabled}
                        >
                          <PlusIcon className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(question.options || []).map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              value={option}
                              onChange={(e) =>
                                updateOption(index, optionIndex, e.target.value)
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                              disabled={disabled}
                              className="flex-1"
                            />
                            {!disabled && (
                              <button
                                type="button"
                                onClick={() => removeOption(index, optionIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
