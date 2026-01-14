import React, { memo } from 'react';
import { PersonalInfoDisplay, SectionHeader } from './shared';
import { BriefcaseIcon, GraduationIcon, DocumentIcon, StarIcon } from './icons';
import type {
  PersonalInfo,
  ResumeData,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeSkills,
} from './types';
import { formatDate } from './utils';
import './styles.css';

// Re-export types for convenience
export type {
  PersonalInfo as ResumePersonalInfo,
  ResumeData,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeSkills,
};

export interface ResumeViewProps {
  data: ResumeData;
  personalInfo?: PersonalInfo;
  className?: string;
}

// Experience Section
const ExperienceSection = memo<{ experiences: ResumeExperience[] }>(({ experiences }) => {
  if (!experiences.length) return null;
  return (
    <div className="resume-section">
      <SectionHeader title="Experience" icon={<BriefcaseIcon />} />
      <div className="resume-section-content">
        {experiences.map((exp, idx) => (
          <div key={idx} className="resume-entry">
            <div className="resume-entry-header">
              <div className="resume-entry-title-row">
                <h4 className="resume-entry-title">{exp.title}</h4>
                {exp.category && <span className="resume-entry-badge">{exp.category}</span>}
              </div>
              <span className="resume-entry-date">
                {formatDate(exp.start_date)} - {exp.is_ongoing ? 'Present' : formatDate(exp.end_date)}
              </span>
            </div>
            <p className="resume-entry-subtitle">
              {exp.company}
              {exp.location && <span className="resume-entry-location"> | {exp.location}</span>}
            </p>
            <ul className="resume-entry-list">
              {exp.content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            {exp.skills && exp.skills.length > 0 && (
              <div className="resume-entry-skills">
                {exp.skills.map((skill, i) => (
                  <span key={i} className="resume-skill-tag">{skill}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// Education Section
const EducationSection = memo<{ education: ResumeEducation[] }>(({ education }) => {
  if (!education.length) return null;
  return (
    <div className="resume-section">
      <SectionHeader title="Education" icon={<GraduationIcon />} />
      <div className="resume-section-content">
        {education.map((edu, idx) => (
          <div key={idx} className="resume-entry">
            <div className="resume-entry-header">
              <div className="resume-entry-title-row">
                <h4 className="resume-entry-title">{edu.degree}</h4>
              </div>
              <span className="resume-entry-date">
                {formatDate(edu.start_date)} - {edu.is_current ? 'Present' : formatDate(edu.end_date)}
              </span>
            </div>
            <p className="resume-entry-subtitle">
              {edu.institution}
              {edu.score_value && <span className="resume-entry-score"> | CGPA: {edu.score_value}</span>}
            </p>
            {edu.relevant_coursework && edu.relevant_coursework.length > 0 && (
              <div className="resume-entry-coursework">
                <span className="resume-entry-coursework-label">Relevant Coursework:</span>
                <span className="resume-entry-coursework-list">{edu.relevant_coursework.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// Projects Section
const ProjectsSection = memo<{ projects: ResumeProject[] }>(({ projects }) => {
  if (!projects.length) return null;
  return (
    <div className="resume-section">
      <SectionHeader title="Projects" icon={<DocumentIcon />} />
      <div className="resume-section-content">
        {projects.map((project, idx) => (
          <div key={idx} className="resume-entry">
            <div className="resume-entry-header">
              <h4 className="resume-entry-title">{project.name}</h4>
              {project.category_raw && <span className="resume-entry-badge">{project.category_raw}</span>}
            </div>
            <ul className="resume-entry-list">
              {project.content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            {project.skills && project.skills.length > 0 && (
              <div className="resume-entry-skills">
                {project.skills.map((skill, i) => (
                  <span key={i} className="resume-skill-tag">{skill}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// Skills Section
const SkillsSection = memo<{ skills: ResumeSkills }>(({ skills }) => {
  const hasSkills = (skills.technical?.length || 0) + (skills.soft?.length || 0) + (skills.languages?.length || 0) > 0;
  if (!hasSkills) return null;

  return (
    <div className="resume-section">
      <SectionHeader title="Skills" icon={<StarIcon />} />
      <div className="resume-skills-content">
        {skills.technical && skills.technical.length > 0 && (
          <div className="resume-skills-group">
            <span className="resume-skills-group-label">Technical</span>
            <div className="resume-skills-tags">
              {skills.technical.map((skill, i) => (
                <span key={i} className="resume-skill-tag resume-skill-tag-tech">{skill}</span>
              ))}
            </div>
          </div>
        )}
        {skills.soft && skills.soft.length > 0 && (
          <div className="resume-skills-group">
            <span className="resume-skills-group-label">Soft Skills</span>
            <div className="resume-skills-tags">
              {skills.soft.map((skill, i) => (
                <span key={i} className="resume-skill-tag resume-skill-tag-soft">{skill}</span>
              ))}
            </div>
          </div>
        )}
        {skills.languages && skills.languages.length > 0 && (
          <div className="resume-skills-group">
            <span className="resume-skills-group-label">Languages</span>
            <div className="resume-skills-tags">
              {skills.languages.map((skill, i) => (
                <span key={i} className="resume-skill-tag resume-skill-tag-lang">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Summary Section
const SummarySection = memo<{ summary: string | string[] }>(({ summary }) => {
  const isList = Array.isArray(summary);
  return (
    <div className="resume-section">
      <SectionHeader title="Summary" icon={<DocumentIcon />} />
      <div className="resume-section-content">
        {isList ? (
          <ul className="resume-entry-list">
            {summary.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="resume-summary-text">{summary}</p>
        )}
      </div>
    </div>
  );
});

// Main Component
export const ResumeView = memo<ResumeViewProps>(({ data, personalInfo, className = '' }) => {
  const info = personalInfo || data.personal_info;

  return (
    <div className={`resume-view ${className}`}>
      {/* Personal Info */}
      {info && <PersonalInfoDisplay info={info} variant="card" showName={true} />}

      {/* Professional Summary */}
      {data.professional_summary && (
        <SummarySection summary={data.professional_summary} />
      )}

      {/* Skills */}
      <SkillsSection skills={data.skills} />

      {/* Experience */}
      <ExperienceSection experiences={data.experience} />

      {/* Projects */}
      <ProjectsSection projects={data.projects} />

      {/* Education */}
      <EducationSection education={data.education} />

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="resume-section">
          <SectionHeader title="Certifications" icon={<StarIcon />} />
          <div className="resume-section-content">
            {data.certifications.map((cert, idx) => (
              <div key={idx} className="resume-cert">
                <span className="resume-cert-name">{cert.name}</span>
                {cert.issuer && <span className="resume-cert-issuer">{cert.issuer}</span>}
                {cert.date && <span className="resume-cert-date">{cert.date}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ResumeView;
