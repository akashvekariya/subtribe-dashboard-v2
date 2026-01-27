import React, { useState, useRef, useEffect } from "react";
import { Icons } from "../Icons";

interface CustomInputOptionProps {
  placeholder: string;
  onAdd: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export default function CustomInputOption({
  placeholder,
  onAdd,
  disabled = false,
  maxLength = 100,
}: CustomInputOptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setValue("");
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setValue("");
    setIsEditing(false);
  };

  const handleContainerClick = () => {
    if (!disabled && !isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`
        w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-colors duration-200
        ${
          disabled
            ? "border-zinc-100 bg-zinc-50 cursor-not-allowed"
            : isEditing
              ? "border-zinc-400 bg-white"
              : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer"
        }
      `}
    >
      {/* Plus icon - always visible */}
      <div
        className={`
        w-5 h-5 rounded-full flex items-center justify-center shrink-0
        ${disabled ? "bg-zinc-100" : "bg-zinc-200"}
      `}
      >
        <Icons.Plus
          className={`w-3 h-3 ${disabled ? "text-zinc-300" : "text-zinc-500"}`}
        />
      </div>

      {/* Input area - seamless transition */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              setTimeout(() => {
                if (!value.trim()) {
                  setIsEditing(false);
                }
              }, 150);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none leading-5"
          />
        ) : (
          <span
            className={`text-sm leading-5 block ${disabled ? "text-zinc-300" : "text-zinc-500"}`}
          >
            Add your own...
          </span>
        )}
      </div>

      {/* Action buttons - always rendered, visibility controlled */}
      <div
        className={`flex items-center gap-1 shrink-0 transition-opacity duration-150 ${isEditing ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit();
          }}
          disabled={!value.trim()}
          tabIndex={isEditing ? 0 : -1}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${
              value.trim()
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }
          `}
        >
          Add
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCancel();
          }}
          tabIndex={isEditing ? 0 : -1}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          <Icons.X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
