import React, {
  memo,
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  EmailFilledIcon,
  PhoneFilledIcon,
  DocumentFilledIcon,
  SortIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  SearchIcon,
} from "./Icons";
import type {
  Tier,
  PersonalInfo,
  ApplicationStatus,
  CandidateSortOption,
} from "./types";
import { tierStyles, statusStyles, sortOptions } from "./config";
import { getInitials, formatRelativeDate } from "./utils";
import { useCandidateListContext } from "./context/CandidateListContext";
import "./styles.css";

// Candidate item type for the list
export interface CandidateListItem {
  id: string;
  personalInfo: PersonalInfo;
  tier: Tier;
  score: number; // Score out of 100
  appliedDate?: string;
  applicationStatus: ApplicationStatus;
}

export interface CandidateListProps {
  // Selection (parent controls which candidate is selected)
  selectedId: string | null;
  onSelect: (id: string) => void;

  // Action handlers (parent handles these)
  onEmailClick?: (candidate: CandidateListItem) => void;
  onPhoneClick?: (candidate: CandidateListItem) => void;
  onResumeClick?: (candidate: CandidateListItem) => void;

  // UI customization
  title?: string;
  className?: string;
}

// ============================================
// Sub-components
// ============================================

// Filter Dropdown
interface FilterOption<T> {
  value: T;
  label: string;
  color: string;
}

const FilterDropdown = <T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: FilterOption<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (value: T) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const activeCount = selected.length;

  return (
    <div ref={dropdownRef} className="candidate-filter-dropdown">
      <button
        type="button"
        className={`candidate-filter-trigger ${activeCount > 0 ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="candidate-filter-count">{activeCount}</span>
        )}
        <ChevronDownIcon
          className={`candidate-filter-chevron ${isOpen ? "open" : ""}`}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <div className="candidate-filter-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`candidate-filter-option ${selected.includes(option.value) ? "selected" : ""}`}
              onClick={() => handleToggle(option.value)}
            >
              <span
                className="candidate-filter-dot"
                style={{ backgroundColor: option.color }}
              />
              <span className="candidate-filter-label">{option.label}</span>
              {selected.includes(option.value) && (
                <CheckIcon strokeWidth={2.5} />
              )}
            </button>
          ))}
          {activeCount > 0 && (
            <>
              <div className="candidate-filter-divider" />
              <button
                type="button"
                className="candidate-filter-clear"
                onClick={() => onChange([])}
              >
                Clear all
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Sort Dropdown
const SortDropdown = memo<{
  value: CandidateSortOption;
  onChange: (value: CandidateSortOption) => void;
}>(({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="candidate-sort-dropdown">
      <button
        type="button"
        className="candidate-sort-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Sort candidates"
      >
        <SortIcon strokeWidth={2} />
        <ChevronDownIcon
          className={`candidate-sort-chevron ${isOpen ? "open" : ""}`}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <div className="candidate-sort-menu">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`candidate-sort-option ${value === option.value ? "selected" : ""}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {value === option.value && <CheckIcon strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Pagination
const Pagination = memo<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}>(({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="candidate-pagination">
      <span className="candidate-pagination-info">
        {startItem}-{endItem} of {totalItems}
      </span>
      <div className="candidate-pagination-controls">
        <button
          type="button"
          className="candidate-pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon strokeWidth={2} />
        </button>
        <button
          type="button"
          className="candidate-pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon strokeWidth={2} />
        </button>
      </div>
    </div>
  );
});

// Empty State
const EmptyState = memo<{
  hasFilters: boolean;
  onClearFilters?: () => void;
}>(({ hasFilters, onClearFilters }) => (
  <div className="candidate-empty-state">
    <div className="candidate-empty-icon">
      <SearchIcon strokeWidth={1.5} />
    </div>
    <h3 className="candidate-empty-title">
      {hasFilters ? "No candidates found" : "No candidates yet"}
    </h3>
    <p className="candidate-empty-desc">
      {hasFilters
        ? "Try adjusting your search or filters"
        : "Candidates will appear here once they apply"}
    </p>
    {hasFilters && onClearFilters && (
      <button
        type="button"
        className="candidate-empty-btn"
        onClick={onClearFilters}
      >
        Clear filters
      </button>
    )}
  </div>
));

// Status Select - native dropdown for changing candidate status
const StatusSelect = memo<{
  status: ApplicationStatus;
  onChange?: (status: ApplicationStatus) => void;
  isUpdating?: boolean;
}>(({ status, onChange, isUpdating = false }) => {
  const statusOptions: ApplicationStatus[] = [
    "applied",
    "screening",
    "interviewing",
    "offer",
    "hired",
    "rejected",
  ];
  const style = statusStyles[status];
  const selectRef = useRef<HTMLSelectElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Resize select to fit content
  useEffect(() => {
    if (measureRef.current && selectRef.current) {
      const width = measureRef.current.offsetWidth + 26; // padding (8+18) for text + arrow
      selectRef.current.style.width = `${width}px`;
    }
  }, [status]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.stopPropagation();
      onChange?.(e.target.value as ApplicationStatus);
    },
    [onChange]
  );

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="candidate-status-wrapper">
      <span ref={measureRef} className="candidate-status-measure">
        {style.label}
      </span>
      <select
        ref={selectRef}
        className={`candidate-status-select ${style.className} ${isUpdating ? "candidate-status-updating" : ""}`}
        value={status}
        onChange={handleChange}
        onClick={handleClick}
        disabled={!onChange || isUpdating}
      >
        {statusOptions.map((opt) => (
          <option key={opt} value={opt}>
            {statusStyles[opt].label}
          </option>
        ))}
      </select>
    </div>
  );
});

// Avatar component
const Avatar = memo<{ name?: string; className?: string }>(
  ({ name, className = "" }) => {
    const initials = getInitials(name);
    return (
      <div className={`candidate-avatar ${className}`}>
        <span className="candidate-avatar-initials">{initials}</span>
      </div>
    );
  }
);

// Action button component
const ActionButton = memo<{
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}>(({ icon, label, onClick, disabled }) => (
  <button
    type="button"
    className="candidate-action-btn"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
  >
    {icon}
  </button>
));

// Single candidate card
const CandidateCard = memo<{
  candidate: CandidateListItem;
  isSelected: boolean;
  onSelect: () => void;
  onEmailClick?: () => void;
  onPhoneClick?: () => void;
  onResumeClick?: () => void;
  onStatusChange?: (status: ApplicationStatus) => void;
  isStatusUpdating?: boolean;
}>(
  ({
    candidate,
    isSelected,
    onSelect,
    onEmailClick,
    onPhoneClick,
    onResumeClick,
    onStatusChange,
    isStatusUpdating,
  }) => {
    const scoreDisplay = (candidate.score / 10).toFixed(1);
    const hasEmail = !!candidate.personalInfo.email;
    const hasPhone = !!candidate.personalInfo.phone;

    const handleEmailClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onEmailClick?.();
      },
      [onEmailClick]
    );

    const handlePhoneClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onPhoneClick?.();
      },
      [onPhoneClick]
    );

    const handleResumeClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onResumeClick?.();
      },
      [onResumeClick]
    );

    return (
      <div
        className={`candidate-card ${isSelected ? "candidate-card-selected" : ""}`}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
      >
        <Avatar name={candidate.personalInfo.full_name} />

        <div className="candidate-content">
          <div className="candidate-header">
            <span className="candidate-name">
              {candidate.personalInfo.full_name}
            </span>
            {candidate.appliedDate && (
              <span className="candidate-date">
                {formatRelativeDate(candidate.appliedDate)}
              </span>
            )}
          </div>
          {candidate.personalInfo.email && (
            <span className="candidate-email">
              {candidate.personalInfo.email}
            </span>
          )}
          <div className="candidate-meta">
            <span className="candidate-score">{scoreDisplay}</span>
            <StatusSelect
              status={candidate.applicationStatus}
              onChange={onStatusChange}
              isUpdating={isStatusUpdating}
            />
            <div className="candidate-actions">
              <ActionButton
                icon={<EmailFilledIcon />}
                label="Email"
                onClick={handleEmailClick}
                disabled={!hasEmail}
              />
              <ActionButton
                icon={<PhoneFilledIcon />}
                label="Call"
                onClick={handlePhoneClick}
                disabled={!hasPhone}
              />
              <ActionButton
                icon={<DocumentFilledIcon />}
                label="Resume"
                onClick={handleResumeClick}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Skeleton loading item
const CandidateCardSkeleton = memo(() => (
  <div className="candidate-card candidate-card-skeleton">
    <div className="candidate-avatar skeleton-shimmer" />
    <div className="candidate-content">
      <div className="candidate-header">
        <span
          className="skeleton-shimmer"
          style={{ width: "60%", height: 16 }}
        />
        <span className="skeleton-shimmer" style={{ width: 50, height: 14 }} />
      </div>
      <div className="candidate-meta">
        <span className="skeleton-shimmer" style={{ width: 28, height: 16 }} />
        <span
          className="skeleton-shimmer"
          style={{ width: 70, height: 20, borderRadius: 4 }}
        />
      </div>
    </div>
  </div>
));

// ============================================
// Main Component
// ============================================

export const CandidateList = memo<CandidateListProps>(
  ({
    selectedId,
    onSelect,
    onEmailClick,
    onPhoneClick,
    onResumeClick,
    title = "Candidates",
    className = "",
  }) => {
    // Get everything from context
    const {
      candidates,
      isLoading,
      selectedTiers,
      setSelectedTiers,
      selectedStatuses,
      setSelectedStatuses,
      sortOption,
      setSortOption,
      currentPage,
      setCurrentPage,
      totalItems,
      pageSize,
      updatingStatusId,
      updateStatus,
    } = useCandidateListContext();

    // Filter options
    const tierOptions: FilterOption<Tier>[] = useMemo(
      () => [
        { value: "excellent_match", label: "Excellent", color: "#059669" },
        { value: "good_match", label: "Good", color: "#2563eb" },
        { value: "average_match", label: "Average", color: "#d97706" },
        { value: "poor_match", label: "Poor", color: "#ea580c" },
        { value: "mismatch", label: "Mismatch", color: "#dc2626" },
      ],
      []
    );

    const statusOptions: FilterOption<ApplicationStatus>[] = useMemo(
      () => [
        { value: "applied", label: "Applied", color: "#71717a" },
        { value: "screening", label: "Screening", color: "#7c3aed" },
        { value: "interviewing", label: "Interviewing", color: "#0891b2" },
        { value: "offer", label: "Offer", color: "#059669" },
        { value: "hired", label: "Hired", color: "#16a34a" },
        { value: "rejected", label: "Rejected", color: "#dc2626" },
      ],
      []
    );

    // Data is already filtered, sorted, and paginated by API (via context/hook)
    const totalPages = Math.ceil(totalItems / pageSize);

    // Check if any filters are active
    const hasActiveFilters =
      selectedTiers.length > 0 || selectedStatuses.length > 0;

    // Clear all filters
    const handleClearFilters = useCallback(() => {
      setSelectedTiers([]);
      setSelectedStatuses([]);
      setSortOption("score_desc");
    }, [setSelectedTiers, setSelectedStatuses, setSortOption]);

    return (
      <div className={`candidate-list ${className}`}>
        {/* Header */}
        <div className="candidate-list-header">
          <h2 className="candidate-list-title">
            {title} <span className="candidate-list-count">{totalItems}</span>
          </h2>

          <div className="candidate-list-filters">
            <FilterDropdown
              label="Tier"
              options={tierOptions}
              selected={selectedTiers}
              onChange={setSelectedTiers}
            />
            <FilterDropdown
              label="Status"
              options={statusOptions}
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
            />
            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>
        </div>

        {/* List items */}
        <div className="candidate-list-items">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <CandidateCardSkeleton key={i} />
            ))
          ) : candidates.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          ) : (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedId === candidate.id}
                onSelect={() => onSelect(candidate.id)}
                onEmailClick={
                  onEmailClick ? () => onEmailClick(candidate) : undefined
                }
                onPhoneClick={
                  onPhoneClick ? () => onPhoneClick(candidate) : undefined
                }
                onResumeClick={
                  onResumeClick ? () => onResumeClick(candidate) : undefined
                }
                onStatusChange={(status) => updateStatus(candidate.id, status)}
                isStatusUpdating={updatingStatusId === candidate.id}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    );
  }
);

export default CandidateList;
