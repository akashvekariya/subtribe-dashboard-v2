import React from "react";
import { TradeoffOption } from "../../types";
import { Icons } from "../Icons";

interface SpectrumSelectorProps {
  optionA: TradeoffOption;
  optionB: TradeoffOption;
  value: number | undefined; // 0-4, undefined if not selected
  onChange: (value: number) => void;
}

export default function SpectrumSelector({
  optionA,
  optionB,
  value,
  onChange,
}: SpectrumSelectorProps) {
  const isLeftSelected = value !== undefined && value < 2;
  const isRightSelected = value !== undefined && value > 2;

  return (
    <div className="space-y-3">
      {/* Two-column option cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Option A Card */}
        <button
          onClick={() => onChange(value === 0 ? 1 : 0)}
          className={`
            text-left p-4 rounded-xl border-2 transition-all duration-200
            ${
              isLeftSelected
                ? "bg-blue-50 border-blue-400 shadow-sm"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }
          `}
        >
          <div className="flex items-start gap-2 mb-2">
            <div
              className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${isLeftSelected ? "bg-blue-500 text-white" : "bg-zinc-100 text-zinc-500"}
            `}
            >
              A
            </div>
            <div className="flex-1">
              <div
                className={`font-semibold text-sm ${isLeftSelected ? "text-blue-900" : "text-zinc-900"}`}
              >
                {optionA.label}
              </div>
            </div>
            {value === 0 && <Icons.Check className="w-5 h-5 text-blue-500" />}
          </div>
          <p
            className={`text-xs leading-relaxed ${isLeftSelected ? "text-blue-700" : "text-zinc-500"}`}
          >
            {optionA.description}
          </p>
        </button>

        {/* Option B Card */}
        <button
          onClick={() => onChange(value === 4 ? 3 : 4)}
          className={`
            text-left p-4 rounded-xl border-2 transition-all duration-200
            ${
              isRightSelected
                ? "bg-purple-50 border-purple-400 shadow-sm"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }
          `}
        >
          <div className="flex items-start gap-2 mb-2">
            <div
              className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${isRightSelected ? "bg-purple-500 text-white" : "bg-zinc-100 text-zinc-500"}
            `}
            >
              B
            </div>
            <div className="flex-1">
              <div
                className={`font-semibold text-sm ${isRightSelected ? "text-purple-900" : "text-zinc-900"}`}
              >
                {optionB.label}
              </div>
            </div>
            {value === 4 && <Icons.Check className="w-5 h-5 text-purple-500" />}
          </div>
          <p
            className={`text-xs leading-relaxed ${isRightSelected ? "text-purple-700" : "text-zinc-500"}`}
          >
            {optionB.description}
          </p>
        </button>
      </div>

      {/* Simplified spectrum - more visual, less text */}
      <div className="relative">
        {/* Selection points container - this defines the layout */}
        <div className="relative flex justify-between items-center py-2 px-4">
          {/* Gradient background bar - spans between button centers */}
          <div
            className="absolute h-2 rounded-full bg-gradient-to-r from-blue-200 via-zinc-200 to-purple-200"
            style={{
              left: "32px",
              right: "32px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          {[0, 1, 2, 3, 4].map((point) => {
            const isSelected = value === point;
            const isOnLeftSide = point < 2;

            return (
              <button
                key={point}
                onClick={() => onChange(point)}
                className={`
                  relative z-10 w-8 h-8 rounded-full border-2 transition-all duration-200
                  flex items-center justify-center text-xs font-bold
                  ${
                    isSelected
                      ? point === 2
                        ? "bg-zinc-700 border-zinc-700 text-white scale-110 shadow-lg"
                        : isOnLeftSide
                          ? "bg-blue-500 border-blue-500 text-white scale-110 shadow-lg"
                          : "bg-purple-500 border-purple-500 text-white scale-110 shadow-lg"
                      : "bg-white border-zinc-300 text-zinc-400 hover:border-zinc-400 hover:scale-105"
                  }
                `}
              >
                {point + 1}
              </button>
            );
          })}
        </div>

        {/* Minimal labels */}
        <div className="flex justify-between text-[10px] text-zinc-400 font-medium px-4">
          <span>Strong A</span>
          <span>Flexible</span>
          <span>Strong B</span>
        </div>
      </div>
    </div>
  );
}
