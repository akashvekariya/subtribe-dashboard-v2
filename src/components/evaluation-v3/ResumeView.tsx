import React, { memo } from "react";
import { PersonalInfoDisplay, SectionHeader } from "./shared";
import {
  BriefcaseIcon,
  GraduationIcon,
  DocumentIcon,
  StarIcon,
  GitHubIcon,
  GlobeFilledIcon,
  DocumentFilledIcon,
} from "./icons";
import { formatDate } from "./utils";
import type {
  ResumeDisplayData,
  ResumeDisplayMeta,
  ResumeExperienceEntry,
  ResumeEducationEntry,
  ResumeProjectEntry,
  ResumeCertification,
  ResumeSkills,
} from "@/lib/api-client";
import "./styles.css";

export interface ResumeViewProps {
  data: ResumeDisplayData;
  meta: ResumeDisplayMeta;
  className?: string;
}

// Experience Section
const ExperienceSection = memo<{ entries: ResumeExperienceEntry[] }>(
  ({ entries }) => {
    if (!entries.length) return null;
    return (
      <div className="resume-section">
        <SectionHeader title="Experience" icon={<BriefcaseIcon />} />
        <div className="resume-section-content">
          {entries.map((exp, idx) => (
            <div key={idx} className="resume-entry">
              <div className="resume-entry-header">
                <div className="resume-entry-title-row">
                  <h4 className="resume-entry-title">{exp.title}</h4>
                  {exp.category && (
                    <span className="resume-entry-badge">{exp.category}</span>
                  )}
                </div>
                <span className="resume-entry-date">
                  {formatDate(exp.start_date ?? undefined)} -{" "}
                  {exp.is_ongoing
                    ? "Present"
                    : formatDate(exp.end_date ?? undefined)}
                </span>
              </div>
              <p className="resume-entry-subtitle">
                {exp.company}
                {exp.location && (
                  <span className="resume-entry-location"> | {exp.location}</span>
                )}
              </p>
              {exp.content.length > 0 && (
                <ul className="resume-entry-list">
                  {exp.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {exp.skills && exp.skills.length > 0 && (
                <div className="resume-entry-skills">
                  {exp.skills.map((skill, i) => (
                    <span key={i} className="resume-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
ExperienceSection.displayName = "ExperienceSection";

// Education Section
const EducationSection = memo<{ entries: ResumeEducationEntry[] }>(
  ({ entries }) => {
    if (!entries.length) return null;
    return (
      <div className="resume-section">
        <SectionHeader title="Education" icon={<GraduationIcon />} />
        <div className="resume-section-content">
          {entries.map((edu, idx) => (
            <div key={idx} className="resume-entry">
              <div className="resume-entry-header">
                <div className="resume-entry-title-row">
                  <h4 className="resume-entry-title">{edu.degree}</h4>
                  {edu.level && (
                    <span className="resume-entry-badge resume-entry-badge-edu">
                      {edu.level}
                    </span>
                  )}
                </div>
                <span className="resume-entry-date">
                  {formatDate(edu.start_date ?? undefined)} -{" "}
                  {edu.is_current
                    ? "Present"
                    : formatDate(edu.end_date ?? undefined)}
                </span>
              </div>
              <p className="resume-entry-subtitle">
                {edu.institution}
                {edu.score_value && (
                  <span className="resume-entry-score">
                    {" "}
                    | CGPA: {edu.score_value}
                  </span>
                )}
              </p>
              {edu.field_of_study && (
                <p className="resume-entry-field">{edu.field_of_study}</p>
              )}
              {edu.relevant_coursework && edu.relevant_coursework.length > 0 && (
                <div className="resume-entry-coursework">
                  <span className="resume-entry-coursework-label">
                    Relevant Coursework:
                  </span>
                  <span className="resume-entry-coursework-list">
                    {edu.relevant_coursework.join(", ")}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
EducationSection.displayName = "EducationSection";

// Projects Section
const ProjectsSection = memo<{ entries: ResumeProjectEntry[] }>(
  ({ entries }) => {
    if (!entries.length) return null;
    return (
      <div className="resume-section">
        <SectionHeader title="Projects" icon={<DocumentIcon />} />
        <div className="resume-section-content">
          {entries.map((project, idx) => (
            <div key={idx} className="resume-entry">
              <div className="resume-entry-header">
                <div className="resume-entry-title-row">
                  <h4 className="resume-entry-title">{project.name}</h4>
                  {project.category && (
                    <span className="resume-entry-badge">{project.category}</span>
                  )}
                </div>
                <div className="resume-entry-links">
                  {project.source_url && (
                    <a
                      href={project.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-entry-link"
                      title="Source Code"
                    >
                      <GitHubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-entry-link"
                      title="Live Demo"
                    >
                      <GlobeFilledIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              {project.content.length > 0 && (
                <ul className="resume-entry-list">
                  {project.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {project.skills && project.skills.length > 0 && (
                <div className="resume-entry-skills">
                  {project.skills.map((skill, i) => (
                    <span key={i} className="resume-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
ProjectsSection.displayName = "ProjectsSection";

// Skills Section
const SkillsSection = memo<{ skills: ResumeSkills }>(({ skills }) => {
  const hasSkills =
    (skills.technical?.length || 0) +
      (skills.soft?.length || 0) +
      (skills.languages?.length || 0) >
    0;
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
                <span key={i} className="resume-skill-tag resume-skill-tag-tech">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {skills.soft && skills.soft.length > 0 && (
          <div className="resume-skills-group">
            <span className="resume-skills-group-label">Soft Skills</span>
            <div className="resume-skills-tags">
              {skills.soft.map((skill, i) => (
                <span key={i} className="resume-skill-tag resume-skill-tag-soft">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {skills.languages && skills.languages.length > 0 && (
          <div className="resume-skills-group">
            <span className="resume-skills-group-label">Languages</span>
            <div className="resume-skills-tags">
              {skills.languages.map((skill, i) => (
                <span key={i} className="resume-skill-tag resume-skill-tag-lang">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
SkillsSection.displayName = "SkillsSection";

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
SummarySection.displayName = "SummarySection";

// Certifications Section
const CertificationsSection = memo<{ certifications: ResumeCertification[] }>(
  ({ certifications }) => {
    if (!certifications.length) return null;
    return (
      <div className="resume-section">
        <SectionHeader title="Certifications" icon={<StarIcon />} />
        <div className="resume-section-content">
          {certifications.map((cert, idx) => (
            <div key={idx} className="resume-cert">
              <span className="resume-cert-name">{cert.name}</span>
              {cert.issuer && (
                <span className="resume-cert-issuer">{cert.issuer}</span>
              )}
              {cert.date && <span className="resume-cert-date">{cert.date}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
CertificationsSection.displayName = "CertificationsSection";

// Cover Letter Section
const CoverLetterSection = memo<{ coverLetter: string }>(({ coverLetter }) => {
  return (
    <div className="resume-section">
      <SectionHeader title="Cover Letter" icon={<DocumentIcon />} />
      <div className="resume-section-content">
        <div className="resume-cover-letter-text">{coverLetter}</div>
      </div>
    </div>
  );
});
CoverLetterSection.displayName = "CoverLetterSection";

// Main Component
export const ResumeView = memo<ResumeViewProps>(
  ({ data, meta, className = "" }) => {
    // Transform personal_info to match PersonalInfoDisplay expected shape
    const personalInfo = {
      full_name: data.personal_info.full_name,
      email: data.personal_info.email ?? undefined,
      phone: data.personal_info.phone ?? undefined,
      location: data.personal_info.location ?? undefined,
      linkedin_url: data.personal_info.linkedin_url ?? undefined,
      github_url: data.personal_info.github_url ?? undefined,
      portfolio_url: data.personal_info.portfolio_url ?? undefined,
    };

    return (
      <div className={`resume-view ${className}`}>
        {/* Personal Info */}
        <PersonalInfoDisplay info={personalInfo} variant="card" showName={true} />

        {/* View Original Resume Button */}
        {meta.resume_url && (
          <a
            href={meta.resume_url}
            target="_blank"
            rel="noopener noreferrer"
            className="resume-view-original-btn"
          >
            <DocumentFilledIcon className="w-5 h-5" />
            <span>View Original Resume</span>
            {meta.resume_filename && (
              <span className="resume-view-original-filename">
                {meta.resume_filename}
              </span>
            )}
          </a>
        )}

        {/* Professional Summary */}
        {data.professional_summary && (
          <SummarySection summary={data.professional_summary} />
        )}

        {/* Skills */}
        <SkillsSection skills={data.skills} />

        {/* Experience */}
        <ExperienceSection entries={data.experience.entries} />

        {/* Projects */}
        <ProjectsSection entries={data.projects.entries} />

        {/* Education */}
        <EducationSection entries={data.education.entries} />

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <CertificationsSection certifications={data.certifications} />
        )}

        {/* Cover Letter */}
        {meta.has_cover_letter && meta.cover_letter && (
          <CoverLetterSection coverLetter={meta.cover_letter} />
        )}
      </div>
    );
  }
);

ResumeView.displayName = "ResumeView";

export default ResumeView;
