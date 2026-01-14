import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { ChevronLeftIcon } from './icons';
import { ScoreSummaryPanel, type PersonalInfo } from './ScoreSummaryPanel';
import { InsightsCard } from './InsightsCard';
import { ConstraintAccordion, type Constraint } from './ConstraintAccordion';
import { RedFlagsAccordion, type RedFlag } from './RedFlagsAccordion';
import { InterviewQuestionsAccordion, type InterviewQuestion } from './InterviewQuestionsAccordion';
import { SkillsGrid, type SkillMatch, type MissingSkill } from './SkillsGrid';
import { EvaluationTabs, type TabId } from './EvaluationTabs';
import { ResumeView, type ResumeData } from './ResumeView';
import { CandidateList, type CandidateListItem } from './CandidateList';
import {
  EvaluationPageSkeleton,
  ScoreSummaryPanelSkeleton,
  InsightsCardSkeleton,
  SkillsGridSkeleton,
  AccordionSkeleton,
} from './Skeleton';

// ============================================
// Mock Candidate Data (3 different candidates)
// ============================================

const mockCandidates: Record<string, {
  personalInfo: PersonalInfo;
  tier: 'excellent_match' | 'good_match' | 'average_match' | 'poor_match';
  totalScore: number;
  categories: Array<{ id: string; name: string; weight: number; score: number; maxScore: number; color: string }>;
  stats: { skillsMatched: number; skillsTotal: number; constraintsPassed: number; constraintsReview: number; constraintsTotal: number; redFlagsCount: number; redFlagsSeverity?: string };
  strengths: string[];
  concerns: string[];
  skills: SkillMatch[];
  missingSkills: MissingSkill[];
  constraints: Constraint[];
  interviewQuestions: InterviewQuestion[];
  redFlags: RedFlag[];
  resume: ResumeData;
}> = {
  'candidate-1': {
    personalInfo: {
      full_name: 'Gudiputi Sangeetha',
      email: 'sangeetha@gmail.com',
      phone: '+91 6302600635',
      location: 'Anantapur, India',
      linkedin_url: 'https://linkedin.com/in/sangeetha',
    },
    tier: 'good_match',
    totalScore: 75,
    categories: [
      { id: 'technical', name: 'Technical Fit', weight: 40, score: 7.3, maxScore: 10, color: 'emerald' },
      { id: 'problemsolving', name: 'Problem Solving', weight: 25, score: 7.5, maxScore: 10, color: 'orange' },
      { id: 'experience', name: 'Experience Fit', weight: 15, score: 7.5, maxScore: 10, color: 'blue' },
      { id: 'trajectory', name: 'Trajectory Fit', weight: 10, score: 7.5, maxScore: 10, color: 'violet' },
      { id: 'culture', name: 'Culture Fit', weight: 10, score: 8.2, maxScore: 10, color: 'red' },
    ],
    stats: { skillsMatched: 9, skillsTotal: 13, constraintsPassed: 5, constraintsReview: 1, constraintsTotal: 6, redFlagsCount: 3, redFlagsSeverity: '2 investigate' },
    strengths: ['Strong JavaScript and Node.js experience', 'Familiar with CI/CD pipelines', 'Demonstrates initiative through personal projects'],
    concerns: ['OOP principles need verification', 'Limited professional experience', 'TypeScript listed but no project evidence'],
    skills: [
      { skill_name: 'JavaScript', signal_strength: 'strong', source_type: 'experience', source_reference: 'Infosys', evidence: 'Used in web applications', is_dealbreaker: false },
      { skill_name: 'React', signal_strength: 'strong', source_type: 'experience', source_reference: 'Personal Project', evidence: 'Built form builder', is_dealbreaker: true },
      { skill_name: 'TypeScript', signal_strength: 'listed', source_type: 'keyword_only', source_reference: 'Skills', evidence: 'Listed but no evidence', is_dealbreaker: false },
    ],
    missingSkills: [{ skill_name: 'Problem Solving', category: 'Soft', is_dealbreaker: false }],
    constraints: [
      { id: '1', question: 'Must demonstrate OOP principles.', answer: 'Coursework includes OOP, needs verification.', eligible: 'review' },
      { id: '2', question: 'Must be proficient with Git.', answer: 'Uses GitHub Actions for deployment.', eligible: true },
    ],
    interviewQuestions: [
      { id: '1', question: 'Your coursework includes OOP. Can you describe a project where you specifically applied concepts like inheritance or polymorphism to solve a problem, and explain your design choices?', gap_addressed: 'Need to confirm practical application of OOP principles beyond coursework.', resume_reference: 'Anantha Lakshmi Institute - Relevant Coursework' },
      { id: '2', question: 'Can you walk me through a challenging technical problem you encountered during your System Engineer Trainee role at Infosys and how you approached solving it?', gap_addressed: 'Limited professional experience, primarily internship/trainee level.', resume_reference: 'Infosys Limited - System Engineer Trainee' },
      { id: '3', question: 'You\'ve listed TypeScript in your skills. Could you describe a situation where you used TypeScript, perhaps in a personal project or during your training, and what benefits it provided over plain JavaScript?', gap_addressed: 'Weak evidence for TypeScript application; needs verification.', resume_reference: 'Skills Section - typescript' },
      { id: '4', question: 'For the \'Travel Strove\' project, you mentioned applying reliability and availability principles. Can you elaborate on a specific instance where you had to troubleshoot and resolve a reliability issue, and what was the outcome?', gap_addressed: 'Some project descriptions are vague and require deeper probing.', resume_reference: 'Travel Strove project' },
    ],
    redFlags: [
      { id: '1', flag_type: 'short_tenure', severity: 'info', details: 'Only internship experience.', context: 'System Engineer Trainee', interview_probe: 'Describe your responsibilities.' },
    ],
    resume: {
      professional_summary: 'Software Engineer with hands-on experience in full-stack and cloud-native development using JavaScript, Python, and Angular. Skilled in API Integration, containerization (Docker), and CI/CD pipelines (Azure DevOps). Passionate about building secure, scalable, and high-performance software aligned with hybrid cloud and AI-driven infrastructure.',
      experience: [
        {
          title: 'System Engineer Trainee',
          company: 'Infosys Limited',
          location: 'Remote',
          start_date: '2024-10',
          end_date: '2025-05',
          is_ongoing: true,
          category: 'Internship',
          content: [
            'Developed responsive, secure web applications using Angular.js, JavaScript (ES6+), and REST APIs, enhancing performance by 25%.',
            'Integrated APIs and automated deployments through Azure DevOps CI/CD pipelines, improving release efficiency.',
            'Deployed front-end builds to Azure Blob Storage and Azure S3, ensuring scalability and reliability across hybrid cloud environments.',
            'Implemented security best practices (CSP, secure cookies, input sanitization, JWT authentication).',
          ],
          skills: ['Angular.js', 'JavaScript', 'REST APIs', 'Azure DevOps', 'CI/CD'],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Technology in Electronics & Communication Engineering',
          institution: 'Anantha Lakshmi Institute of Technology and Science',
          start_date: '2018-06',
          end_date: '2022-08',
          score_value: '7.6',
          relevant_coursework: ['Data Structures', 'Algorithms', 'OOP', 'DBMS', 'Cloud Fundamentals', 'Operating Systems'],
        },
      ],
      projects: [
        {
          name: 'Upliance Form Builder',
          category_raw: 'Personal Project',
          content: [
            'Built a dynamic form builder using React Hooks, Context API, and secure form validation.',
            'Improved initial render speed of 20% and containerized with Docker for consistent deployment.',
          ],
          skills: ['React Hooks', 'Context API', 'Docker'],
        },
        {
          name: 'Travel Strove',
          category_raw: 'Project at Infosys',
          content: [
            'Developed and deployed Azure App Services and AWS EC2, achieving 99.9% uptime.',
            'Integrated CI pipeline for testing, linting, and blue/green deployment strategies.',
            'Monitored performance via Azure AppInsights, reducing response times by 20%.',
          ],
          skills: ['Azure App Services', 'AWS EC2', 'CI pipeline', 'Azure AppInsights'],
        },
      ],
      skills: {
        technical: ['React.js', 'Angular.js', 'Node.js', 'Express.js', 'Python', 'JavaScript (ES6+)', 'Docker', 'Kubernetes', 'AWS EC2', 'Azure DevOps', 'MySQL', 'MongoDB'],
        soft: ['Collaboration', 'Problem Solving', 'Continuous Learning', 'Communication', 'Adaptability'],
      },
    },
  },
  'candidate-2': {
    personalInfo: {
      full_name: 'Rahul Sharma',
      email: 'rahul.sharma@outlook.com',
      phone: '+91 9876543210',
      location: 'Bangalore, India',
      linkedin_url: 'https://linkedin.com/in/rahulsharma',
      github_url: 'https://github.com/rahulsharma',
    },
    tier: 'excellent_match',
    totalScore: 88,
    categories: [
      { id: 'technical', name: 'Technical Fit', weight: 40, score: 9.0, maxScore: 10, color: 'emerald' },
      { id: 'problemsolving', name: 'Problem Solving', weight: 25, score: 8.5, maxScore: 10, color: 'orange' },
      { id: 'experience', name: 'Experience Fit', weight: 15, score: 8.8, maxScore: 10, color: 'blue' },
      { id: 'trajectory', name: 'Trajectory Fit', weight: 10, score: 8.5, maxScore: 10, color: 'violet' },
      { id: 'culture', name: 'Culture Fit', weight: 10, score: 9.0, maxScore: 10, color: 'red' },
    ],
    stats: { skillsMatched: 12, skillsTotal: 13, constraintsPassed: 6, constraintsReview: 0, constraintsTotal: 6, redFlagsCount: 0 },
    strengths: ['5+ years of full-stack experience', 'Led team of 4 engineers', 'Strong system design skills', 'Open source contributor'],
    concerns: ['Salary expectations may be high'],
    skills: [
      { skill_name: 'TypeScript', signal_strength: 'strong', source_type: 'experience', source_reference: 'Previous Company', evidence: '3 years of TypeScript', is_dealbreaker: true },
      { skill_name: 'React', signal_strength: 'strong', source_type: 'experience', source_reference: 'Previous Company', evidence: 'Built multiple apps', is_dealbreaker: true },
      { skill_name: 'Node.js', signal_strength: 'strong', source_type: 'experience', source_reference: 'Previous Company', evidence: 'Backend services', is_dealbreaker: false },
      { skill_name: 'AWS', signal_strength: 'strong', source_type: 'experience', source_reference: 'Previous Company', evidence: 'Deployed to AWS', is_dealbreaker: false },
    ],
    missingSkills: [],
    constraints: [
      { id: '1', question: 'Must demonstrate OOP principles.', answer: 'Strong evidence in codebase.', eligible: true },
      { id: '2', question: 'Must be proficient with Git.', answer: 'Active GitHub contributor.', eligible: true },
      { id: '3', question: 'Team leadership experience.', answer: 'Led team of 4.', eligible: true },
    ],
    interviewQuestions: [
      { id: '1', question: 'As a team lead, how do you balance your own technical contributions with mentoring and code reviews for junior developers?', gap_addressed: 'Understanding leadership style and hands-on technical involvement.', resume_reference: 'TechCorp Solutions - Senior Software Engineer' },
      { id: '2', question: 'What motivated you to create an open-source GraphQL client library, and how do you manage community contributions?', gap_addressed: 'Assessing open-source experience and collaboration skills.', resume_reference: 'Open Source GraphQL Client' },
    ],
    redFlags: [],
    resume: {
      professional_summary: 'Senior Full-Stack Engineer with 5+ years of experience building scalable web applications. Led engineering teams, architected microservices systems, and contributed to open-source projects. Expert in TypeScript, React, and cloud technologies with a focus on performance and maintainability.',
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'TechCorp Solutions',
          location: 'Bangalore, India',
          start_date: '2021-03',
          is_ongoing: true,
          category: 'Full-time',
          content: [
            'Led a team of 4 engineers in developing a customer-facing SaaS platform serving 50K+ users.',
            'Architected microservices infrastructure using Node.js, reducing deployment time by 60%.',
            'Implemented comprehensive testing strategy achieving 85% code coverage.',
            'Mentored junior developers through code reviews and pair programming sessions.',
          ],
          skills: ['TypeScript', 'React', 'Node.js', 'AWS', 'PostgreSQL', 'Redis'],
        },
        {
          title: 'Software Engineer',
          company: 'StartupXYZ',
          location: 'Bangalore, India',
          start_date: '2019-06',
          end_date: '2021-02',
          category: 'Full-time',
          content: [
            'Built React-based dashboard for real-time analytics processing 1M+ events daily.',
            'Developed RESTful APIs using Express.js with JWT authentication.',
            'Optimized database queries reducing average response time from 800ms to 120ms.',
          ],
          skills: ['React', 'Express.js', 'MongoDB', 'Docker'],
        },
      ],
      education: [
        {
          degree: 'Master of Technology in Computer Science',
          institution: 'Indian Institute of Technology, Bangalore',
          start_date: '2017-08',
          end_date: '2019-05',
          score_value: '8.9',
          relevant_coursework: ['Distributed Systems', 'Machine Learning', 'Advanced Algorithms', 'Database Systems'],
        },
        {
          degree: 'Bachelor of Engineering in Computer Science',
          institution: 'Bangalore University',
          start_date: '2013-08',
          end_date: '2017-05',
          score_value: '8.5',
        },
      ],
      projects: [
        {
          name: 'Open Source GraphQL Client',
          category_raw: 'Open Source',
          content: [
            'Created a lightweight GraphQL client library with 2K+ GitHub stars.',
            'Implemented automatic query batching and caching mechanisms.',
            'Wrote comprehensive documentation and migration guides.',
          ],
          skills: ['TypeScript', 'GraphQL', 'npm publishing'],
        },
      ],
      skills: {
        technical: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Express.js', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        soft: ['Team Leadership', 'Mentoring', 'System Design', 'Technical Writing', 'Problem Solving'],
      },
      certifications: [
        { name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services', date: '2022' },
        { name: 'Google Cloud Professional Data Engineer', issuer: 'Google Cloud', date: '2021' },
      ],
    },
  },
  'candidate-3': {
    personalInfo: {
      full_name: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      phone: '+91 8765432109',
      location: 'Mumbai, India',
    },
    tier: 'average_match',
    totalScore: 58,
    categories: [
      { id: 'technical', name: 'Technical Fit', weight: 40, score: 5.5, maxScore: 10, color: 'emerald' },
      { id: 'problemsolving', name: 'Problem Solving', weight: 25, score: 6.0, maxScore: 10, color: 'orange' },
      { id: 'experience', name: 'Experience Fit', weight: 15, score: 5.8, maxScore: 10, color: 'blue' },
      { id: 'trajectory', name: 'Trajectory Fit', weight: 10, score: 6.5, maxScore: 10, color: 'violet' },
      { id: 'culture', name: 'Culture Fit', weight: 10, score: 6.0, maxScore: 10, color: 'red' },
    ],
    stats: { skillsMatched: 5, skillsTotal: 13, constraintsPassed: 2, constraintsReview: 3, constraintsTotal: 6, redFlagsCount: 4, redFlagsSeverity: '2 concern' },
    strengths: ['Quick learner', 'Good communication skills'],
    concerns: ['Limited technical experience', 'No React experience', 'Career gap of 2 years', 'Vague project descriptions'],
    skills: [
      { skill_name: 'HTML/CSS', signal_strength: 'strong', source_type: 'experience', source_reference: 'Freelance', evidence: 'Built websites', is_dealbreaker: false },
      { skill_name: 'JavaScript', signal_strength: 'moderate', source_type: 'experience', source_reference: 'Freelance', evidence: 'Basic JS', is_dealbreaker: false },
      { skill_name: 'React', signal_strength: 'academic', source_type: 'education', source_reference: 'Online Course', evidence: 'Completed course', is_dealbreaker: true },
    ],
    missingSkills: [
      { skill_name: 'TypeScript', category: 'Technical', is_dealbreaker: true },
      { skill_name: 'Node.js', category: 'Technical', is_dealbreaker: false },
    ],
    constraints: [
      { id: '1', question: 'Must demonstrate OOP principles.', answer: 'No evidence found.', eligible: false },
      { id: '2', question: 'Must be proficient with Git.', answer: 'Mentioned GitHub in profile.', eligible: 'review' },
    ],
    interviewQuestions: [
      { id: '1', question: 'Can you walk me through what you did during 2021-2023? Were you pursuing any learning, personal projects, or other activities during this time?', gap_addressed: 'Career gap of 2 years needs explanation.', resume_reference: 'Career Timeline' },
      { id: '2', question: 'For the e-commerce website you built, can you describe the specific technical challenges you faced with payment gateway integration and how you resolved them?', gap_addressed: 'Project descriptions lack specific technical details.', resume_reference: 'E-commerce Website - Freelance Project' },
      { id: '3', question: 'What specifically drew you to React and modern JavaScript frameworks? Can you describe a feature from your React Todo App that you\'re particularly proud of?', gap_addressed: 'Limited React experience needs assessment.', resume_reference: 'React Todo App - Learning Project' },
    ],
    redFlags: [
      { id: '1', flag_type: 'unexplained_gaps', severity: 'concern', details: '2 year career gap.', interview_probe: 'What did you do during 2021-2023?' },
      { id: '2', flag_type: 'vague_contributions', severity: 'investigate', details: 'Project descriptions lack specifics.', interview_probe: 'What was your specific role?' },
    ],
    resume: {
      professional_summary: 'Web developer transitioning into full-stack development with a background in freelance website design. Currently expanding skills through online courses in React and modern JavaScript frameworks. Eager to grow in a collaborative team environment.',
      experience: [
        {
          title: 'Freelance Web Developer',
          company: 'Self-employed',
          location: 'Mumbai, India',
          start_date: '2019-01',
          end_date: '2021-03',
          category: 'Freelance',
          content: [
            'Designed and developed responsive websites for small businesses and personal clients.',
            'Managed client communications and project timelines independently.',
            'Implemented basic SEO optimizations for improved search rankings.',
          ],
          skills: ['HTML5', 'CSS3', 'JavaScript', 'WordPress'],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Science in Information Technology',
          institution: 'Mumbai University',
          start_date: '2015-06',
          end_date: '2018-05',
          score_value: '6.8',
        },
      ],
      projects: [
        {
          name: 'E-commerce Website',
          category_raw: 'Freelance Project',
          content: [
            'Built a WordPress-based e-commerce site for a local clothing store.',
            'Integrated payment gateway and inventory management plugins.',
          ],
          skills: ['WordPress', 'WooCommerce', 'PHP'],
        },
        {
          name: 'React Todo App',
          category_raw: 'Learning Project',
          content: [
            'Completed online course project building a todo application with React.',
            'Implemented state management using React hooks.',
          ],
          skills: ['React', 'JavaScript', 'CSS'],
        },
      ],
      skills: {
        technical: ['HTML5', 'CSS3', 'JavaScript', 'WordPress', 'Basic React', 'PHP'],
        soft: ['Communication', 'Self-motivated', 'Quick Learner', 'Client Management'],
      },
    },
  },
};

// ============================================
// Simple LRU Cache for Demo
// ============================================

const demoCache = new Map<string, { data: typeof mockCandidates['candidate-1']; fetchedAt: number }>();
const MAX_CACHE = 7;

function getCachedCandidate(id: string) {
  const entry = demoCache.get(id);
  if (entry) {
    // Update access time
    entry.fetchedAt = Date.now();
    return entry.data;
  }
  return null;
}

function setCachedCandidate(id: string, data: typeof mockCandidates['candidate-1']) {
  // Evict oldest if at capacity
  if (demoCache.size >= MAX_CACHE && !demoCache.has(id)) {
    let oldest: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of demoCache.entries()) {
      if (entry.fetchedAt < oldestTime) {
        oldestTime = entry.fetchedAt;
        oldest = key;
      }
    }
    if (oldest) demoCache.delete(oldest);
  }
  demoCache.set(id, { data, fetchedAt: Date.now() });
}

// ============================================
// Debug Page Component
// ============================================

const ComponentsDebugPage = memo(() => {
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('ai');
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, 'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'>>({});
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const loadDelay = 1500; // Simulated network delay in ms

  // Set theme-color meta tag for mobile browsers
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#ffffff';
      document.head.appendChild(meta);
    }
  }, []);

  // Build candidate list items from mock data
  const candidateListItems: CandidateListItem[] = useMemo(() => {
    const defaultStatuses: Array<'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'> = ['applied', 'screening', 'interviewing'];
    return Object.entries(mockCandidates).map(([id, data], index) => ({
      id,
      personalInfo: data.personalInfo,
      tier: data.tier,
      score: data.totalScore,
      appliedDate: '2026-01-09',
      applicationStatus: candidateStatuses[id] || defaultStatuses[index % defaultStatuses.length],
    }));
  }, [candidateStatuses]);

  // Handle status change
  const handleStatusChange = useCallback((candidateId: string, status: 'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected') => {
    setCandidateStatuses(prev => ({ ...prev, [candidateId]: status }));
  }, []);

  // Close mobile detail panel
  const closeMobileDetail = useCallback(() => {
    setIsMobileDetailOpen(false);
  }, []);

  // Simulate fetching a candidate
  const selectCandidate = useCallback(async (id: string) => {
    // Open mobile detail panel and reset to AI tab
    setIsMobileDetailOpen(true);
    setActiveTab('ai');

    // Check cache first
    const cached = getCachedCandidate(id);
    if (cached) {
      setCurrentCandidateId(id);
      return;
    }

    // Simulate network fetch
    setIsLoading(true);
    setCurrentCandidateId(null);

    await new Promise(resolve => setTimeout(resolve, loadDelay));

    const data = mockCandidates[id];
    if (data) {
      setCachedCandidate(id, data);
      setCurrentCandidateId(id);
    }
    setIsLoading(false);
  }, [loadDelay]);

  const candidate = currentCandidateId ? mockCandidates[currentCandidateId] : null;

  return (
    <div className="eval-page-wrapper">
      {/* Main Container - Centered with border and border-radius */}
      <div className="eval-main-container">
        {/* Two Column Layout */}
        <div className="eval-layout-container">
          {/* Left Sidebar - Candidate List */}
          <div className="eval-layout-sidebar">
            <CandidateList
              candidates={candidateListItems}
              selectedId={currentCandidateId}
              onSelect={selectCandidate}
              onEmailClick={(c) => {
                if (c.personalInfo.email) {
                  window.open(`mailto:${c.personalInfo.email}`, '_blank');
                }
              }}
              onPhoneClick={(c) => {
                if (c.personalInfo.phone) {
                  window.open(`tel:${c.personalInfo.phone}`, '_blank');
                }
              }}
              onResumeClick={(c) => {
                // Switch to resume tab
                selectCandidate(c.id);
                setActiveTab('resume');
              }}
              onStatusChange={handleStatusChange}
              isLoading={false}
              title="Candidates"
            />
          </div>

          {/* Main Content */}
          <div className={`eval-layout-main ${isMobileDetailOpen ? 'mobile-detail-open' : ''}`}>
            {/* Mobile header with back button and tabs - hidden on desktop */}
            <div className="eval-mobile-header">
              <button className="eval-mobile-back" onClick={closeMobileDetail}>
                <ChevronLeftIcon strokeWidth={2} />
              </button>
              <div className="eval-mobile-tabs">
                <button
                  className={`eval-mobile-tab ${activeTab === 'ai' ? 'eval-mobile-tab-active' : ''}`}
                  onClick={() => setActiveTab('ai')}
                >
                  AI Evaluation
                </button>
                <button
                  className={`eval-mobile-tab ${activeTab === 'resume' ? 'eval-mobile-tab-active' : ''}`}
                  onClick={() => setActiveTab('resume')}
                >
                  Resume
                </button>
              </div>
            </div>

            {/* Show skeleton during loading */}
            {isLoading && <EvaluationPageSkeleton />}

            {/* Show "select candidate" message when idle */}
            {!isLoading && !candidate && (
              <div className="eval-tabs-container">
                <div className="eval-tabs">
                  <button className="eval-tab eval-tab-active">AI Evaluation</button>
                  <button className="eval-tab">Resume</button>
                </div>
                <div className="eval-tabs-content">
                  <div className="text-center py-20">
                    <p className="text-zinc-400 text-lg">Select a candidate to view details</p>
                    <p className="text-zinc-400 text-sm mt-2">
                      Click on a candidate from the list
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Show actual content when loaded */}
            {!isLoading && candidate && (
              <div className="eval-tabs-container">
                {/* Tabs */}
                <EvaluationTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Content */}
                <div className="eval-tabs-content">
                  {/* AI Evaluation Tab */}
                  {activeTab === 'ai' && (
                    <>
                      <div className="mb-4 sm:mb-6">
                        <ScoreSummaryPanel
                          categories={candidate.categories}
                          totalScore={candidate.totalScore}
                          maxTotalScore={100}
                          tier={candidate.tier}
                          stats={candidate.stats}
                          personalInfo={candidate.personalInfo}
                        />
                      </div>

                      <div className="mb-4 sm:mb-6">
                        <InsightsCard strengths={candidate.strengths} concerns={candidate.concerns} />
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <SkillsGrid
                          skills={candidate.skills}
                          matchedCount={candidate.stats.skillsMatched}
                          totalSkills={candidate.stats.skillsTotal}
                          missingSkills={candidate.missingSkills}
                          title="Skills"
                        />
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <ConstraintAccordion constraints={candidate.constraints} title="Constraints" />
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <InterviewQuestionsAccordion questions={candidate.interviewQuestions} title="Interview Questions" />
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <RedFlagsAccordion flags={candidate.redFlags} title="Red Flags" />
                      </div>
                    </>
                  )}

                  {/* Resume Tab */}
                  {activeTab === 'resume' && (
                    <ResumeView data={candidate.resume} personalInfo={candidate.personalInfo} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ComponentsDebugPage;
