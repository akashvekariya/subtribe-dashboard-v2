import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options?: string[];
  placeholder?: string;
  allowCustom?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select or type to add...",
  allowCustom = true,
  disabled = false,
  className = "",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on input and exclude already selected
  const filteredOptions = options.filter(
    (option) =>
      option.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(option)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setInputValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddItem = (item: string) => {
    if (item.trim() && !value.includes(item.trim())) {
      onChange([...value, item.trim()]);
      setInputValue("");
      setIsOpen(false);
    }
  };

  const handleRemoveItem = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddItem(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleRemoveItem(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setInputValue("");
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex flex-wrap gap-1 p-2 border rounded-md bg-white min-h-[42px] cursor-text ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "hover:border-gray-400"
        } ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300"}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        {/* Selected items */}
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
          >
            {item}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(item);
                }}
                className="ml-1 hover:text-blue-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder-gray-400"
        />

        {/* Dropdown arrow */}
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Filtered options */}
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleAddItem(option)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              {option}
            </button>
          ))}

          {/* Add custom option */}
          {allowCustom &&
            inputValue.trim() &&
            !filteredOptions.includes(inputValue.trim()) && (
              <button
                type="button"
                onClick={() => handleAddItem(inputValue)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-t border-gray-200"
              >
                <span className="text-blue-600">
                  Add &ldquo;{inputValue}&rdquo;
                </span>
              </button>
            )}

          {/* No options message */}
          {filteredOptions.length === 0 &&
            (!allowCustom || !inputValue.trim()) && (
              <div className="px-3 py-2 text-sm text-gray-500">
                {inputValue ? "No matching options" : "Type to add items"}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
