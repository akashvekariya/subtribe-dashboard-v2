import React, { useMemo } from "react";
import { Icons } from "../Icons";

interface RankableItem {
  id: string;
  label: string;
  description?: string;
  hint?: string;
}

interface ClickToRankProps {
  items: RankableItem[];
  rankedIds: string[]; // ordered array of selected ids
  onChange: (rankedIds: string[]) => void;
  maxSelections?: number;
  icon?: React.ReactNode;
  accentColor?: "blue" | "purple" | "amber" | "green" | "red";
}

const colorConfig = {
  blue: {
    selectedBg: "bg-blue-600",
    selectedBorder: "border-blue-600",
    rankBg: "bg-blue-100",
    rankText: "text-blue-700",
    hoverBorder: "hover:border-blue-300",
  },
  purple: {
    selectedBg: "bg-purple-600",
    selectedBorder: "border-purple-600",
    rankBg: "bg-purple-100",
    rankText: "text-purple-700",
    hoverBorder: "hover:border-purple-300",
  },
  amber: {
    selectedBg: "bg-amber-600",
    selectedBorder: "border-amber-600",
    rankBg: "bg-amber-100",
    rankText: "text-amber-700",
    hoverBorder: "hover:border-amber-300",
  },
  green: {
    selectedBg: "bg-green-600",
    selectedBorder: "border-green-600",
    rankBg: "bg-green-100",
    rankText: "text-green-700",
    hoverBorder: "hover:border-green-300",
  },
  red: {
    selectedBg: "bg-red-600",
    selectedBorder: "border-red-600",
    rankBg: "bg-red-100",
    rankText: "text-red-700",
    hoverBorder: "hover:border-red-300",
  },
};

export default function ClickToRank({
  items,
  rankedIds,
  onChange,
  maxSelections,
  icon,
  accentColor = "blue",
}: ClickToRankProps) {
  const colors = colorConfig[accentColor];

  // Sort items: ranked first (by rank order), then unranked
  const sortedItems = useMemo(() => {
    const ranked = rankedIds
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean) as RankableItem[];
    const unranked = items.filter((item) => !rankedIds.includes(item.id));
    return [...ranked, ...unranked];
  }, [items, rankedIds]);

  const handleClick = (itemId: string) => {
    const currentRank = rankedIds.indexOf(itemId);

    if (currentRank !== -1) {
      // Already ranked - remove it
      onChange(rankedIds.filter((id) => id !== itemId));
    } else {
      // Not ranked - add to end if under max
      if (!maxSelections || rankedIds.length < maxSelections) {
        onChange([...rankedIds, itemId]);
      }
    }
  };

  // maxSelections is now optional - if not set, allow ranking all items
  const maxReached = maxSelections ? rankedIds.length >= maxSelections : false;

  return (
    <div className="space-y-2">
      {sortedItems.map((item) => {
        const rank = rankedIds.indexOf(item.id);
        const isRanked = rank !== -1;
        const isDisabled = !isRanked && maxReached;

        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            disabled={isDisabled}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left border-2
              transition-all duration-300 ease-out
              ${
                isRanked
                  ? `${colors.selectedBg} ${colors.selectedBorder} text-white shadow-md`
                  : isDisabled
                    ? "bg-zinc-50 border-zinc-200 text-zinc-300 cursor-not-allowed"
                    : `bg-white border-zinc-200 text-zinc-700 ${colors.hoverBorder} hover:shadow-sm`
              }
            `}
            style={{
              transform: isRanked ? "scale(1.01)" : "scale(1)",
            }}
          >
            {/* Rank badge or icon */}
            <div
              className={`
              w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm
              transition-all duration-300
              ${
                isRanked
                  ? "bg-white/20 text-white"
                  : "bg-zinc-100 text-zinc-400"
              }
            `}
            >
              {isRanked ? (
                <span className="animate-in zoom-in duration-200">
                  {rank + 1}
                </span>
              ) : (
                icon || <span className="w-2 h-2 rounded-full bg-zinc-300" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className={`font-medium text-sm ${isRanked ? "text-white" : isDisabled ? "text-zinc-400" : "text-zinc-900"}`}
              >
                {item.label}
              </div>
              {item.hint && (
                <div
                  className={`text-xs truncate ${isRanked ? "text-white/70" : isDisabled ? "text-zinc-300" : "text-zinc-500"}`}
                >
                  {item.hint}
                </div>
              )}
            </div>

            {/* Selection indicator */}
            {isRanked && (
              <Icons.Check className="w-5 h-5 shrink-0 text-white/80" />
            )}
          </button>
        );
      })}

      {/* Selection hint */}
      <p className="text-xs text-zinc-400 text-center pt-2">
        {rankedIds.length === 0
          ? "Click to rank in order of priority"
          : `${rankedIds.length} ranked${items.length - rankedIds.length > 0 ? ` - ${items.length - rankedIds.length} remaining` : " - done!"}`}
      </p>
    </div>
  );
}
