import React, { memo, useState, useCallback, useMemo } from 'react';
import { StatusPill, PillIcons } from './StatusPill';
import { InfoCircleIcon, CloseIcon, BriefcaseIcon, QuoteIcon } from './icons';
import { signalConfig, sourceLabels } from './config';
import type { SignalStrength, SourceType, SkillMatch, MissingSkill } from './types';
import './styles.css';

// Re-export types
export type { SignalStrength, SourceType, SkillMatch, MissingSkill };

// Icon mapping for signal strengths
const signalIcons: Record<SignalStrength, React.ReactNode> = {
  strong: PillIcons.experienced,
  moderate: PillIcons.someExperience,
  academic: PillIcons.studied,
  listed: PillIcons.selfReported,
  missing: PillIcons.missing,
};

// Legend Modal
const LegendModal = memo<{ onClose: () => void }>(({ onClose }) => (
  <div className="eval-skills-modal-overlay" onClick={onClose}>
    <div className="eval-skills-modal" onClick={e => e.stopPropagation()}>
      <div className="eval-skills-modal-header">
        <h3>Skill Signal Strength</h3>
        <button onClick={onClose} className="eval-skills-modal-close">
          <CloseIcon strokeWidth={2} />
        </button>
      </div>
      <p className="eval-skills-modal-subtitle">
        How we determine the confidence level for each skill based on resume evidence.
      </p>
      <div className="eval-skills-modal-content">
        {(Object.keys(signalConfig) as SignalStrength[]).map((key) => {
          const config = signalConfig[key];
          return (
            <div key={key} className="eval-skills-modal-item">
              <div className="eval-skills-modal-item-header">
                <StatusPill variant={config.variant} icon={signalIcons[key]}>
                  {config.label}
                </StatusPill>
              </div>
              <p className="eval-skills-modal-item-desc">{config.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
));

// Skill Pill
const SkillPill = memo<{
  skill: SkillMatch;
  isSelected: boolean;
  onClick: () => void;
}>(({ skill, isSelected, onClick }) => {
  const config = signalConfig[skill.signal_strength] || signalConfig.listed;
  const icon = signalIcons[skill.signal_strength] || signalIcons.listed;
  return (
    <button onClick={onClick} className={`eval-skill-pill-wrapper ${isSelected ? 'selected' : ''}`}>
      <StatusPill variant={config.variant} icon={icon}>
        {skill.skill_name}
      </StatusPill>
    </button>
  );
});

// Skill Detail Card
const SkillDetail = memo<{
  skill: SkillMatch;
  onClose: () => void;
}>(({ skill, onClose }) => {
  const config = signalConfig[skill.signal_strength] || signalConfig.listed;
  const sourceLabel = sourceLabels[skill.source_type] || skill.source_type;
  const hideSource = skill.signal_strength === 'listed' || skill.signal_strength === 'missing';

  return (
    <div className="eval-skill-detail">
      <div className="eval-skill-detail-header">
        <div className="eval-skill-detail-title">
          <span className="eval-skill-detail-name">{skill.skill_name}</span>
          <div className="flex items-center gap-2">
            <span className={`eval-skill-detail-label ${config.textColor}`}>
              {config.label}
            </span>
            {skill.is_dealbreaker && (
              <span className="eval-skill-dealbreaker-badge">Dealbreaker</span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="eval-skill-detail-close">
          <CloseIcon strokeWidth={2} />
        </button>
      </div>

      <div className="eval-skill-detail-content">
        {!hideSource && (
          <div className="eval-skill-detail-source">
            <span className="eval-skill-detail-source-label">
              <BriefcaseIcon className="eval-skill-detail-icon" strokeWidth={2} />
              {sourceLabel}
            </span>
            <span className="eval-skill-detail-source-ref">{skill.source_reference}</span>
          </div>
        )}

        <div className="eval-skill-detail-evidence">
          <QuoteIcon className="eval-skill-detail-icon" strokeWidth={2} />
          <p>{skill.evidence}</p>
        </div>
      </div>
    </div>
  );
});

// Main component
export interface SkillsGridProps {
  skills: SkillMatch[];
  matchedCount: number;
  totalSkills: number;
  missingSkills?: MissingSkill[];
  title?: string;
  className?: string;
}

export const SkillsGrid = memo<SkillsGridProps>(({
  skills,
  matchedCount,
  totalSkills,
  missingSkills = [],
  title = 'Skills',
  className = '',
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showLegendModal, setShowLegendModal] = useState(false);

  const handleToggle = useCallback((skillName: string) => {
    setSelectedSkill(prev => prev === skillName ? null : skillName);
  }, []);

  const handleCloseLegend = useCallback(() => setShowLegendModal(false), []);
  const handleOpenLegend = useCallback(() => setShowLegendModal(true), []);
  const handleCloseDetail = useCallback(() => setSelectedSkill(null), []);

  // Convert missing skills to SkillMatch format
  const allSkills = useMemo(() => {
    const missingSkillsAsMatches: SkillMatch[] = missingSkills.map(ms => ({
      skill_name: ms.skill_name,
      signal_strength: 'missing' as SignalStrength,
      source_type: 'keyword_only' as SourceType,
      source_reference: '',
      evidence: `We could not infer this ${ms.category.toLowerCase()} skill from the resume.`,
      is_dealbreaker: ms.is_dealbreaker,
    }));
    return [...skills, ...missingSkillsAsMatches];
  }, [skills, missingSkills]);

  const selected = selectedSkill ? allSkills.find(s => s.skill_name === selectedSkill) : null;

  return (
    <div className={`eval-skills-container ${className}`}>
      <div className="eval-skills-header">
        <div className="eval-skills-title-row">
          <h3 className="eval-accordion-title">{title}</h3>
          <button
            className="eval-skills-info-btn"
            onClick={handleOpenLegend}
            aria-label="What do the colors mean?"
          >
            <InfoCircleIcon className="eval-skills-info-icon" strokeWidth={2} />
          </button>
        </div>
        <span className="eval-skills-summary">
          <span className="eval-skills-summary-count">{matchedCount}/{totalSkills}</span> matched
        </span>
      </div>

      <div className="eval-skills-grid">
        {allSkills.map((skill) => (
          <SkillPill
            key={skill.skill_name}
            skill={skill}
            isSelected={selectedSkill === skill.skill_name}
            onClick={() => handleToggle(skill.skill_name)}
          />
        ))}
      </div>

      {selected && (
        <SkillDetail skill={selected} onClose={handleCloseDetail} />
      )}

      {showLegendModal && (
        <LegendModal onClose={handleCloseLegend} />
      )}
    </div>
  );
});

export default SkillsGrid;
