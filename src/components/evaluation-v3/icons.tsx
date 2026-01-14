import React, { memo } from 'react';

// ============================================
// Stroke-based Icons (outline style)
// ============================================

interface StrokeIconProps {
  strokeWidth?: number;
  className?: string;
}

const createStrokeIcon = (paths: React.ReactNode, viewBox = '0 0 24 24') => {
  const Icon: React.FC<StrokeIconProps> = memo(({ strokeWidth = 2, className }) => (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      className={className}
    >
      {paths}
    </svg>
  ));
  return Icon;
};

// Skill level icons
export const StarIcon = createStrokeIcon(
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
);

export const GraduationIcon = createStrokeIcon(
  <>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </>,
  '1 2 22 20'
);

export const DocumentIcon = createStrokeIcon(
  <>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </>
);

export const CircleXIcon = createStrokeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </>
);

export const CircleCheckIcon = createStrokeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="8 12 11 15 16 9" />
  </>
);

export const HourglassIcon = createStrokeIcon(
  <>
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22" />
    <path d="M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2" />
  </>
);

export const CheckIcon = createStrokeIcon(
  <polyline points="20 6 9 17 4 12" />
);

export const WarningIcon = createStrokeIcon(
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
);

export const FlagIcon = createStrokeIcon(
  <>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </>
);

export const CloseIcon = createStrokeIcon(
  <path d="M6 18L18 6M6 6l12 12" />
);

export const ChevronDownIcon = createStrokeIcon(
  <polyline points="6 9 12 15 18 9" />
);

export const InfoCircleIcon = createStrokeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>
);

export const MessageIcon = createStrokeIcon(
  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
);

export const BriefcaseIcon = createStrokeIcon(
  <>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </>
);

export const QuoteIcon = createStrokeIcon(
  <>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" />
  </>
);

// Search, Sort, and Navigation icons
export const SearchIcon = createStrokeIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>
);

export const SortIcon = createStrokeIcon(
  <>
    <line x1="4" y1="6" x2="13" y2="6" />
    <line x1="4" y1="12" x2="10" y2="12" />
    <line x1="4" y1="18" x2="7" y2="18" />
    <polyline points="15 9 18 6 21 9" />
    <line x1="18" y1="6" x2="18" y2="18" />
  </>
);

export const ChevronLeftIcon = createStrokeIcon(
  <polyline points="15 18 9 12 15 6" />
);

export const ChevronRightIcon = createStrokeIcon(
  <polyline points="9 18 15 12 9 6" />
);

export const RefreshIcon = createStrokeIcon(
  <>
    <path d="M21 12a9 9 0 11-2.636-6.364" />
    <path d="M21 3v6h-6" />
  </>
);

// ============================================
// Filled Icons (solid style with path d)
// ============================================

interface FilledIconProps {
  className?: string;
}

const createFilledIcon = (d: string, viewBox = '0 0 20 20') => {
  const Icon: React.FC<FilledIconProps> = memo(({ className }) => (
    <svg viewBox={viewBox} fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d={d} />
    </svg>
  ));
  return Icon;
};

// Contact & Social icons (viewBox 0 0 20 20)
export const EmailFilledIcon = createFilledIcon(
  "M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3zM19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"
);

export const PhoneFilledIcon = createFilledIcon(
  "M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5A15.5 15.5 0 011 3.5z"
);

export const LocationFilledIcon = createFilledIcon(
  "M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
);

export const ChartFilledIcon = createFilledIcon(
  "M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z"
);

export const ShieldFilledIcon = createFilledIcon(
  "M9.661 2.237a.75.75 0 01.678 0 12.02 12.02 0 007.411 2.36.75.75 0 01.748.748 18.015 18.015 0 01-4.226 11.665 6.95 6.95 0 01-3.922 2.225.75.75 0 01-.35 0 6.95 6.95 0 01-3.922-2.225A18.015 18.015 0 011.502 5.345a.75.75 0 01.748-.748 12.02 12.02 0 007.411-2.36z"
);

export const FlagFilledIcon = createFilledIcon(
  "M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392l1.657-.348a6.449 6.449 0 014.271.572 7.948 7.948 0 005.965.524l2.078-.64A.75.75 0 0018 12.25v-8.5a.75.75 0 00-.904-.734l-2.38.501a7.25 7.25 0 01-4.186-.363l-.502-.2a8.75 8.75 0 00-5.053-.439l-1.475.31V2.75z"
);

export const GlobeFilledIcon = createFilledIcon(
  "M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
);

export const DocumentFilledIcon = createFilledIcon(
  "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
);

// Insights icons
export const CheckCircleFilledIcon = createFilledIcon(
  "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
);

export const AlertTriangleFilledIcon = createFilledIcon(
  "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
);

// ============================================
// Brand Icons (special viewBox)
// ============================================

export const LinkedInIcon: React.FC<FilledIconProps> = memo(({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
  </svg>
));

export const GitHubIcon: React.FC<FilledIconProps> = memo(({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
));

// ============================================
// Pre-built icon elements for StatusPill
// ============================================

export const PillIcons = {
  experienced: <StarIcon strokeWidth={2} />,
  someExperience: <StarIcon strokeWidth={2} />,
  studied: <GraduationIcon strokeWidth={2} />,
  selfReported: <DocumentIcon strokeWidth={2} />,
  missing: <CircleXIcon strokeWidth={2} />,
  check: <CheckIcon strokeWidth={2} />,
  warning: <WarningIcon strokeWidth={2} />,
  flag: <FlagIcon strokeWidth={2} />,
};

export const PillIconsBold = {
  experienced: <StarIcon strokeWidth={2.5} />,
  someExperience: <StarIcon strokeWidth={2.5} />,
  studied: <GraduationIcon strokeWidth={2.5} />,
  selfReported: <DocumentIcon strokeWidth={2.5} />,
  missing: <CircleXIcon strokeWidth={2.5} />,
  warning: <WarningIcon strokeWidth={2.5} />,
  flag: <FlagIcon strokeWidth={2.5} />,
};
