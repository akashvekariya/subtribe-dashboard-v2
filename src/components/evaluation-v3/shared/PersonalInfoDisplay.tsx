import React, { memo } from 'react';
import {
  EmailFilledIcon,
  PhoneFilledIcon,
  LocationFilledIcon,
  LinkedInIcon,
  GitHubIcon,
  GlobeFilledIcon,
  DocumentFilledIcon,
} from '../icons';
import type { PersonalInfo } from '../types';

/**
 * PersonalInfoDisplay - Shared component for displaying contact info and social links
 * Used by ScoreSummaryPanel and ResumeView
 */
export interface PersonalInfoDisplayProps {
  info: PersonalInfo;
  /** Display variant - 'panel' for ScoreSummaryPanel, 'card' for standalone card */
  variant?: 'panel' | 'card';
  /** Show the full name as heading */
  showName?: boolean;
  className?: string;
}

export const PersonalInfoDisplay = memo<PersonalInfoDisplayProps>(({
  info,
  variant = 'panel',
  showName = true,
  className = '',
}) => {
  const { email, phone, location, linkedin_url, github_url, portfolio_url, resume_url } = info;
  const hasLinks = linkedin_url || github_url || portfolio_url || resume_url;

  const baseClass = variant === 'card' ? 'eval-personal-card' : 'eval-personal';
  const itemClass = variant === 'card' ? 'eval-personal-card-item' : 'eval-personal-item';
  const linkClass = variant === 'card' ? 'eval-personal-card-link' : 'eval-personal-link';

  return (
    <div className={`${baseClass} ${className}`}>
      {showName && (
        <h2 className="eval-personal-name">{info.full_name}</h2>
      )}

      <div className="eval-personal-contact">
        {email && (
          <a href={`mailto:${email}`} className={`${itemClass} ${linkClass}`}>
            <EmailFilledIcon className="w-4 h-4" />
            <span>{email}</span>
          </a>
        )}
        {phone && (
          <a href={`tel:${phone.replace(/\s/g, '')}`} className={`${itemClass} ${linkClass}`}>
            <PhoneFilledIcon className="w-4 h-4" />
            <span>{phone}</span>
          </a>
        )}
        {location && (
          <div className={itemClass}>
            <LocationFilledIcon className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}
      </div>

      {hasLinks && (
        <div className="eval-personal-links">
          {resume_url && (
            <a href={resume_url} target="_blank" rel="noopener noreferrer" className="eval-personal-link-btn" title="Resume">
              <DocumentFilledIcon className="w-4 h-4" />
            </a>
          )}
          {linkedin_url && (
            <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="eval-personal-link-btn" title="LinkedIn">
              <LinkedInIcon className="w-4 h-4" />
            </a>
          )}
          {github_url && (
            <a href={github_url} target="_blank" rel="noopener noreferrer" className="eval-personal-link-btn" title="GitHub">
              <GitHubIcon className="w-4 h-4" />
            </a>
          )}
          {portfolio_url && (
            <a href={portfolio_url} target="_blank" rel="noopener noreferrer" className="eval-personal-link-btn" title="Portfolio">
              <GlobeFilledIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
});

export default PersonalInfoDisplay;
