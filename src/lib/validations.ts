import { z } from "zod";

// Validation schemas for enhanced backend-compatible forms

// Enums for validation (matching backend API - see jobs.md)
const positionTypeEnum = z.enum([
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "other",
  "volunteer",
  "internship",
]);
const experienceLevelEnum = z.enum([
  "entry",
  "mid",
  "senior",
  "lead",
  "principal",
]);
const locationTypeEnum = z.enum(["remote", "hybrid", "onsite"]);
const applicationStatusEnum = z.enum([
  "applied",
  "screening",
  "interviewing",
  "offer",
  "hired",
  "rejected",
]);

// Authentication schemas
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Password validation matching backend requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
  .regex(/\d/, "Password must contain at least one number (0-9)")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character (!@#$%^&*...)"
  );

// Note: invite_token removed - users enter invite code on /claim-invite after email verification
export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Screening question schema
const screeningQuestionSchema = z.object({
  type: z.enum(["text", "textarea", "select", "radio", "checkbox"]),
  question: z.string().min(5, "Question must be at least 5 characters"),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

// Helper to transform empty strings to undefined for optional fields
const emptyStringToUndefined = z.preprocess((val) => {
  if (val === "" || val === null) return undefined;
  return val;
}, z.string().optional());

// Job creation schema (matching backend API - see jobs.md)
export const jobSchema = z
  .object({
    // Required fields
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    description: z
      .string()
      .min(50, "Description must be at least 50 characters"),

    // Job type & level
    position_type: positionTypeEnum,
    experience_level: z.preprocess((val) => {
      if (val === "" || val === null) return undefined;
      return val;
    }, experienceLevelEnum.optional()),
    department: emptyStringToUndefined.refine(
      (val) => !val || val.length <= 100,
      {
        message: "Department must be less than 100 characters",
      }
    ),

    // Location
    location_type: locationTypeEnum,
    location_city: emptyStringToUndefined.refine(
      (val) => !val || val.length <= 100,
      {
        message: "City must be less than 100 characters",
      }
    ),
    location_state: emptyStringToUndefined.refine(
      (val) => !val || val.length <= 100,
      {
        message: "State must be less than 100 characters",
      }
    ),
    location_country: emptyStringToUndefined.refine(
      (val) => !val || val.length <= 100,
      {
        message: "Country must be less than 100 characters",
      }
    ),

    // Salary
    salary_min: z
      .number()
      .min(0, "Minimum salary cannot be negative")
      .optional(),
    salary_max: z
      .number()
      .min(0, "Maximum salary cannot be negative")
      .optional(),
    salary_currency: z.string().max(10).default("INR"),

    // Experience (years)
    min_experience_years: z
      .number()
      .min(0, "Experience must be 0 or more years")
      .max(50, "Experience cannot exceed 50 years")
      .optional(),
    max_experience_years: z
      .number()
      .min(0, "Experience must be 0 or more years")
      .max(50, "Experience cannot exceed 50 years")
      .optional(),

    // Skills
    required_skills: z
      .array(z.string().min(1, "Skill cannot be empty"))
      .default([]),
    preferred_skills: z
      .array(z.string().min(1, "Skill cannot be empty"))
      .default([]),

    // Screening
    screening_questions: z.array(screeningQuestionSchema).default([]),
  })
  .refine(
    (data) => {
      if (data.salary_min && data.salary_max) {
        return data.salary_min <= data.salary_max;
      }
      return true;
    },
    {
      message: "Maximum salary must be greater than or equal to minimum salary",
      path: ["salary_max"],
    }
  )
  .refine(
    (data) => {
      if (data.min_experience_years && data.max_experience_years) {
        return data.min_experience_years <= data.max_experience_years;
      }
      return true;
    },
    {
      message:
        "Maximum experience must be greater than or equal to minimum experience",
      path: ["max_experience_years"],
    }
  )
  .refine(
    (data) => {
      // Location fields are required for hybrid and onsite positions
      if (data.location_type === "hybrid" || data.location_type === "onsite") {
        return !!data.location_city && data.location_city.trim().length > 0;
      }
      return true;
    },
    {
      message: "City is required for hybrid and onsite positions",
      path: ["location_city"],
    }
  )
  .refine(
    (data) => {
      // Location fields are required for hybrid and onsite positions
      if (data.location_type === "hybrid" || data.location_type === "onsite") {
        return !!data.location_state && data.location_state.trim().length > 0;
      }
      return true;
    },
    {
      message: "State is required for hybrid and onsite positions",
      path: ["location_state"],
    }
  )
  .refine(
    (data) => {
      // Location fields are required for hybrid and onsite positions
      if (data.location_type === "hybrid" || data.location_type === "onsite") {
        return (
          !!data.location_country && data.location_country.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Country is required for hybrid and onsite positions",
      path: ["location_country"],
    }
  );

// Enhanced application schema
export const applicationSchema = z
  .object({
    first_name: z
      .string()
      .min(2, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    last_name: z
      .string()
      .min(2, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    linkedin_url: z.string().url("LinkedIn profile URL is required"),
    github_url: z.preprocess((val) => {
      if (val === "" || val === null) return undefined;
      return val;
    }, z.string().url("Invalid GitHub URL").optional()),
    portfolio_url: z.preprocess((val) => {
      if (val === "" || val === null) return undefined;
      return val;
    }, z.string().url("Invalid portfolio URL").optional()),
    current_ctc: z
      .number()
      .min(0, "Current CTC must be a valid number")
      .optional(),
    expected_ctc: z
      .number()
      .min(0, "Expected CTC must be a valid number")
      .optional(),
    notice_period_days: z
      .number()
      .min(0, "Notice period cannot be negative")
      .max(365, "Notice period cannot exceed 365 days")
      .optional(),
    cover_letter: z.preprocess((val) => {
      if (val === "" || val === null) return undefined;
      return val;
    }, z.string().max(5000, "Cover letter must be 5000 characters or less. Please shorten your message.").optional()),
    screening_answers: z.record(z.string(), z.string()).default({}),
    resume: z.instanceof(File, { message: "Resume is required" }),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine(
    (data) => {
      if (data.current_ctc && data.expected_ctc) {
        return data.expected_ctc >= data.current_ctc * 0.5; // Expected should be at least 50% of current
      }
      return true;
    },
    {
      message: "Expected CTC seems too low compared to current CTC",
      path: ["expected_ctc"],
    }
  );

// Status update schema
export const statusUpdateSchema = z.object({
  status: applicationStatusEnum,
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// Company profile schema
export const companyProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  logo_url: z.preprocess((val) => {
    if (val === "" || val === null) return undefined;
    return val;
  }, z.string().url("Invalid logo URL").optional()),
  website_url: z.preprocess((val) => {
    if (val === "" || val === null) return undefined;
    return val;
  }, z.string().url("Invalid website URL").optional()),
  tagline: emptyStringToUndefined.refine((val) => !val || val.length <= 200, {
    message: "Tagline must be less than 200 characters",
  }),
  about: emptyStringToUndefined.refine((val) => !val || val.length <= 1000, {
    message: "About must be less than 1000 characters",
  }),
});

// Utility validation functions
export const validateFile = (
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ["application/pdf"]
) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File must be of type: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
};

export const validateCurrency = (amount: number, currency: string) => {
  const currencyLimits = {
    USD: { min: 1000, max: 1000000 },
    INR: { min: 100000, max: 50000000 },
    EUR: { min: 1000, max: 800000 },
    GBP: { min: 1000, max: 700000 },
  };

  const limits = currencyLimits[currency as keyof typeof currencyLimits];
  if (!limits) return { valid: false, error: "Invalid currency" };

  if (amount < limits.min || amount > limits.max) {
    return {
      valid: false,
      error: `Amount must be between ${limits.min.toLocaleString()} and ${limits.max.toLocaleString()} ${currency}`,
    };
  }

  return { valid: true };
};

// Onboarding schema for organization setup
export const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(255, "Organization name must be less than 255 characters"),
  slug: z
    .string()
    .min(2, "URL slug must be at least 2 characters")
    .max(100, "URL slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "URL slug can only contain lowercase letters, numbers, and hyphens"
    ),
  logo_url: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  tagline: z
    .string()
    .max(500, "Tagline must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  about: z
    .string()
    .max(20000, "About section must be less than 20,000 characters")
    .optional()
    .or(z.literal("")),
});

// Type exports
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type ScreeningQuestionInput = z.infer<typeof screeningQuestionSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

// Backward compatibility types
export type JobFormData = JobInput;
export type ApplicationFormData = ApplicationInput;
