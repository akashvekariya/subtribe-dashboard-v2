"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { api, APIError } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Company, User } from "@/types";
import {
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  GlobeAltIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

// Validation schema for company settings
const settingsSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(255, "Organization name must be less than 255 characters"),
  slug: z
    .string()
    .min(2, "URL slug must be at least 2 characters")
    .max(100, "URL slug must be less than 100 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Only lowercase letters, numbers, and hyphens allowed. Must start and end with a letter or number."
    ),
  logo_url: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  website_url: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
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

type SettingsInput = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [copiedInviteCode, setCopiedInviteCode] = useState(false);
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo_url: "",
      website_url: "",
      tagline: "",
      about: "",
    },
  });

  const formValues = watch();

  // Auto-format slug: lowercase only, validate in real-time
  useEffect(() => {
    const currentSlug = formValues.slug;
    if (currentSlug) {
      const formatted = currentSlug.toLowerCase();
      if (formatted !== currentSlug) {
        setValue("slug", formatted, { shouldDirty: true });
      }
      // Trigger validation to show errors as user types
      trigger("slug");
    }
  }, [formValues.slug, setValue, trigger]);

  // Reset logo preview error when URL changes
  useEffect(() => {
    setLogoPreviewError(false);
  }, [formValues.logo_url]);

  // Load company data
  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          window.location.href = "/sign-in";
          return;
        }
        setUser(currentUser);

        if (currentUser.company?.id) {
          // Fetch full company data (includes invite_code, created_at, etc.)
          const fullCompany = await api.company.getCompany(
            currentUser.company.id
          );
          setCompany(fullCompany);
          reset({
            name: fullCompany.name || "",
            slug: fullCompany.slug || "",
            logo_url: fullCompany.logo_url || "",
            website_url: fullCompany.website_url || "",
            tagline: fullCompany.tagline || "",
            about: fullCompany.about || "",
          });
        }
      } catch {
        showToast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [reset]);

  async function onSubmit(data: SettingsInput) {
    if (!company) return;

    setIsSaving(true);
    const toastId = showToast.loading("Saving changes...");

    try {
      const updatedCompany = await api.company.updateCompany(company.id, {
        name: data.name,
        slug: data.slug,
        logo_url: data.logo_url || undefined,
        website_url: data.website_url || undefined,
        tagline: data.tagline || undefined,
        about: data.about || undefined,
      });

      setCompany(updatedCompany);
      reset({
        name: updatedCompany.name || "",
        slug: updatedCompany.slug || "",
        logo_url: updatedCompany.logo_url || "",
        website_url: updatedCompany.website_url || "",
        tagline: updatedCompany.tagline || "",
        about: updatedCompany.about || "",
      });

      showToast.dismiss(toastId);
      showToast.success("Settings saved successfully");
    } catch (error) {
      showToast.dismiss(toastId);
      if (error instanceof APIError) {
        if (error.code === "slug_taken") {
          showToast.error(
            "This URL slug is already taken. Please choose a different one."
          );
        } else {
          showToast.error(error.message);
        }
      } else {
        showToast.error("Failed to save settings. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function copyInviteCode() {
    if (company?.invite_code) {
      try {
        await navigator.clipboard.writeText(company.invite_code);
        setCopiedInviteCode(true);
        showToast.success("Invite code copied to clipboard");
        setTimeout(() => setCopiedInviteCode(false), 2000);
      } catch {
        showToast.error("Failed to copy invite code");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No organization found. Please complete onboarding first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Organization Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your organization profile and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">
                  Basic Information
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This information is displayed to candidates on your job listings
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-4 py-5 sm:px-6 space-y-5">
                <FormField
                  id="name"
                  label="Organization Name"
                  type="text"
                  placeholder="Acme Inc."
                  required
                  error={errors.name?.message}
                  {...register("name")}
                />

                <div>
                  <FormField
                    id="slug"
                    label="URL Slug"
                    type="text"
                    placeholder="acme-inc"
                    required
                    error={errors.slug?.message}
                    {...register("slug")}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Only lowercase letters, numbers, and hyphens allowed. Your
                    careers page:{" "}
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      careers.thesubtribe.com/{formValues.slug || "your-slug"}
                    </span>
                  </p>
                </div>

                <FormField
                  id="tagline"
                  label="Tagline"
                  type="text"
                  placeholder="Building the future of work"
                  error={errors.tagline?.message}
                  helperText="A short phrase that describes your organization (max 500 characters)"
                  {...register("tagline")}
                />

                <div className="flex flex-col">
                  <Label htmlFor="about" className="mb-2">
                    About
                  </Label>
                  <Textarea
                    id="about"
                    rows={5}
                    placeholder="Tell candidates about your organization, culture, and what makes you a great place to work..."
                    hasError={!!errors.about}
                    {...register("about")}
                  />
                  {errors.about && (
                    <p className="text-xs mt-1.5 text-red-600">
                      {errors.about.message}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-500">
                    Displayed on your careers page (max 20,000 characters)
                  </p>
                </div>
              </div>

              {/* Links Section */}
              <div className="px-4 py-5 sm:px-6 border-t border-gray-200 space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  <h3 className="text-base font-medium text-gray-900">Links</h3>
                </div>

                <FormField
                  id="website_url"
                  label="Website"
                  type="url"
                  placeholder="https://example.com"
                  error={errors.website_url?.message}
                  {...register("website_url")}
                />

                <div>
                  <FormField
                    id="logo_url"
                    label="Logo URL"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    error={errors.logo_url?.message}
                    {...register("logo_url")}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    File upload is not currently supported. Please paste a
                    direct link to your logo image hosted elsewhere (PNG, JPG,
                    or SVG recommended).
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={!isDirty || isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!isDirty || isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Takes 1 column on large screens */}
        <div className="space-y-6">
          {/* Logo Preview Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <PhotoIcon className="h-5 w-5 text-gray-400" />
                <h3 className="text-base font-medium text-gray-900">
                  Logo Preview
                </h3>
              </div>
            </div>
            <div className="px-4 py-6 sm:px-6 flex justify-center">
              {formValues.logo_url && !logoPreviewError ? (
                <div className="relative">
                  <Image
                    src={formValues.logo_url}
                    alt="Logo preview"
                    width={120}
                    height={120}
                    className="object-contain rounded-lg border border-gray-200"
                    unoptimized
                    onError={() => setLogoPreviewError(true)}
                  />
                </div>
              ) : (
                <div className="h-[120px] w-[120px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {formValues.logo_url && logoPreviewError ? (
                    <span className="text-xs text-red-500 text-center px-2">
                      Failed to load image
                    </span>
                  ) : (
                    <span className="text-3xl font-bold text-gray-400">
                      {formValues.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">
                Account Info
              </h3>
            </div>
            <div className="px-4 py-4 sm:px-6 space-y-4">
              {/* Plan */}
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Plan
                </dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {company.plan || "Free"}
                  </span>
                </dd>
              </div>

              {/* Invite Code */}
              {company.invite_code && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Team Invite Code
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {company.invite_code}
                    </code>
                    <button
                      type="button"
                      onClick={copyInviteCode}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy invite code"
                    >
                      {copiedInviteCode ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </button>
                  </dd>
                  <p className="mt-1 text-xs text-gray-500">
                    Share this code to invite team members
                  </p>
                </div>
              )}

              {/* Created Date */}
              {company.created_at && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {(() => {
                      const date = new Date(company.created_at);
                      return isNaN(date.getTime())
                        ? "N/A"
                        : date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });
                    })()}
                  </dd>
                </div>
              )}

              {/* Current User */}
              {user && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Your Role
                  </dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {user.role}
                    </span>
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
