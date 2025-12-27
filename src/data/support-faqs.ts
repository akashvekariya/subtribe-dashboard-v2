/**
 * Static FAQ data for the support widget
 */

export interface FAQQuestion {
  question: string;
  answer: string;
}

export interface FAQCategory {
  category: string;
  icon: string;
  questions: FAQQuestion[];
}

export const SUPPORT_FAQS: FAQCategory[] = [
  {
    category: "Getting Started",
    icon: "rocket",
    questions: [
      {
        question: "How do I create my first job posting?",
        answer:
          'Navigate to the Jobs page and click the "Create Job" button. Fill in the job details including title, description, requirements, and screening questions. You can save as draft or publish immediately.',
      },
      {
        question: "How do I invite team members to my company?",
        answer:
          "Go to Settings > Team and share your company invite code with team members. They can use this code during registration to join your company account.",
      },
      {
        question: "What is a screening question?",
        answer:
          "Screening questions are custom questions you can add to your job posting. Candidates must answer these when applying, helping you filter and evaluate candidates based on specific criteria.",
      },
    ],
  },
  {
    category: "Managing Applications",
    icon: "users",
    questions: [
      {
        question: "How do I review candidate applications?",
        answer:
          "Click on any job to see all applications. You can view candidate details, download resumes, review screening answers, and update application status (Applied, Screening, Interviewing, Offer, Hired, or Rejected).",
      },
      {
        question: "Can I search and filter applications?",
        answer:
          "Yes! Use the filter button on the job detail page to search by candidate name or email, filter by status, and sort by date or other criteria.",
      },
      {
        question: "How do I download a candidate's resume?",
        answer:
          'Open the candidate\'s application and click the "View Resume" button. This opens a secure, time-limited link to view or download the PDF.',
      },
      {
        question: "What do the different application statuses mean?",
        answer:
          "Applied = New application, Screening = Under initial review, Interviewing = In interview process, Offer = Offer extended, Hired = Accepted offer, Rejected = Not proceeding.",
      },
    ],
  },
  {
    category: "Email & Communication",
    icon: "mail",
    questions: [
      {
        question: "How do I send emails to candidates?",
        answer:
          'Open a candidate\'s application, click "Send Email", and compose your message. You can use templates and wildcards like {{candidate_name}} to personalize emails.',
      },
      {
        question: "What are email wildcards?",
        answer:
          "Wildcards are placeholders like {{candidate_name}}, {{job_title}}, and {{company_name}} that automatically get replaced with actual values when sending emails.",
      },
      {
        question: "Can I schedule emails to send later?",
        answer:
          "Yes, when composing an email you can choose to schedule it for a specific date and time. Scheduled emails can be cancelled before they are sent.",
      },
      {
        question: "How do I create custom email templates?",
        answer:
          "Go to Settings > Email Templates to create, edit, and manage your email templates. You can create templates for different scenarios like interview invites, rejections, and offers.",
      },
    ],
  },
  {
    category: "Job Postings",
    icon: "briefcase",
    questions: [
      {
        question: "How do I share a job posting?",
        answer:
          "Each published job has a unique public URL. You can find the share link on the job detail page. Copy and share this link on job boards, social media, or your website.",
      },
      {
        question: "Can I edit a job after publishing?",
        answer:
          "Yes, you can edit job details at any time. Changes will be reflected on the public job page immediately.",
      },
      {
        question: "How do I close a job posting?",
        answer:
          'Click the "Close Job" button on the job detail page. Closed jobs will no longer accept new applications but you can still view existing applications.',
      },
      {
        question: "What's the difference between Draft and Active jobs?",
        answer:
          "Draft jobs are not visible to candidates and cannot receive applications. Active jobs are published and visible on your public careers page.",
      },
    ],
  },
  {
    category: "Account & Settings",
    icon: "settings",
    questions: [
      {
        question: "How do I update my company profile?",
        answer:
          "Go to Settings > Company Profile to update your company name, logo, description, and other details that appear on your public careers page.",
      },
      {
        question: "How do I change my password?",
        answer:
          'Currently, you can reset your password by logging out and using the "Forgot Password" link on the login page.',
      },
      {
        question: "Can I export application data?",
        answer:
          "Data export functionality is coming soon. Contact support if you need to export data urgently.",
      },
    ],
  },
];

export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/subtribe";
