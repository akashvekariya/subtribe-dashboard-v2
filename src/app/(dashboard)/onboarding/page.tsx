"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations";
import { api, APIError } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";

type Step = "basics" | "details" | "review";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("basics");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo_url: "",
      tagline: "",
      about: "",
    },
  });

  const formValues = watch();

  // Check if user should be on this page
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/sign-in");
          return;
        }

        if (!user.email_verified) {
          router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
          return;
        }

        // If company exists and onboarding is completed, redirect to dashboard
        if (user.company?.onboarding_completed) {
          router.push("/");
          return;
        }

        setIsLoading(false);
      } catch {
        router.push("/sign-in");
      }
    }

    checkOnboardingStatus();
  }, [router]);

  // Auto-generate slug from name
  useEffect(() => {
    const name = formValues.name;
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 100);
      setValue("slug", slug);
    }
  }, [formValues.name, setValue]);

  async function handleNext() {
    if (currentStep === "basics") {
      const isValid = await trigger(["name", "slug"]);
      if (isValid) {
        setCurrentStep("details");
      }
    } else if (currentStep === "details") {
      setCurrentStep("review");
    }
  }

  function handleBack() {
    if (currentStep === "details") {
      setCurrentStep("basics");
    } else if (currentStep === "review") {
      setCurrentStep("details");
    }
  }

  async function onSubmit(data: OnboardingInput) {
    setIsSubmitting(true);
    const toastId = showToast.loading("Setting up your organization...");

    try {
      await api.company.completeOnboarding({
        name: data.name,
        slug: data.slug,
        logo_url: data.logo_url || undefined,
        tagline: data.tagline || undefined,
        about: data.about || undefined,
      });

      showToast.dismiss(toastId);
      showToast.success("Organization setup complete! Welcome to Subtribe.");

      // Force refresh to get updated user data
      router.push("/");
      router.refresh();
    } catch (error) {
      showToast.dismiss(toastId);
      if (error instanceof APIError) {
        if (error.code === "slug_taken") {
          showToast.error(
            "This URL slug is already taken. Please choose a different one."
          );
          setCurrentStep("basics");
        } else {
          showToast.error(error.message);
        }
      } else {
        showToast.error("Failed to complete setup. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const steps = [
    { key: "basics", label: "Basics", number: 1 },
    { key: "details", label: "Details", number: 2 },
    { key: "review", label: "Review", number: 3 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Set up your organization
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete these steps to start posting jobs and receiving
            applications
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStepIndex >= index
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-500"
                    }`}
                  >
                    {currentStepIndex > index ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStepIndex >= index
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStepIndex > index ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basics */}
            {currentStep === "basics" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Organization basics
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Enter your organization name and choose a unique URL for
                    your job listings page.
                  </p>
                </div>

                <FormField
                  id="name"
                  label="Organization name"
                  type="text"
                  placeholder="Acme Inc."
                  required
                  error={errors.name?.message}
                  {...register("name")}
                />

                <div>
                  <FormField
                    id="slug"
                    label="URL slug"
                    type="text"
                    placeholder="acme-inc"
                    required
                    error={errors.slug?.message}
                    {...register("slug")}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your job listings will be available at:{" "}
                    <span className="font-mono">
                      careers.thesubtribe.com/{formValues.slug || "your-slug"}
                    </span>
                  </p>
                </div>

                <FormField
                  id="logo_url"
                  label="Logo URL (optional)"
                  type="text"
                  placeholder="https://example.com/logo.png"
                  error={errors.logo_url?.message}
                  {...register("logo_url")}
                />
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === "details" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Organization details
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Add a tagline and description that will be shown to
                    candidates on your job listings page.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="tagline"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tagline (optional)
                  </label>
                  <input
                    id="tagline"
                    type="text"
                    placeholder="Building the future of work"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    {...register("tagline")}
                  />
                  {errors.tagline && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.tagline.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    A short phrase that describes your organization
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium text-gray-700"
                  >
                    About (optional)
                  </label>
                  <textarea
                    id="about"
                    rows={5}
                    placeholder="Tell candidates about your organization, culture, and what makes you a great place to work..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    {...register("about")}
                  />
                  {errors.about && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.about.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === "review" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Review your setup
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Please review your organization details before completing
                    the setup.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    {formValues.logo_url ? (
                      <img
                        src={formValues.logo_url}
                        alt="Logo preview"
                        className="h-16 w-16 object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400">
                          {formValues.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formValues.name || "Organization Name"}
                      </h3>
                      {formValues.tagline && (
                        <p className="text-sm text-gray-600">
                          {formValues.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          URL
                        </dt>
                        <dd className="text-sm text-gray-900 font-mono">
                          careers.thesubtribe.com/{formValues.slug}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {formValues.about && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        About
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {formValues.about}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === "basics"}
                className={currentStep === "basics" ? "invisible" : ""}
              >
                Back
              </Button>

              {currentStep !== "review" ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Setting up..." : "Complete setup"}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Skip option */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            You can update these details later in your organization settings.
          </p>
        </div>
      </div>
    </div>
  );
}
