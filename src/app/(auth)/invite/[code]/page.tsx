"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, APIError, InviteValidationResponse } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";

type PageState = "loading" | "valid" | "invalid" | "expired" | "used";

// Storage key for invite code (used by /claim-invite page)
// Using localStorage instead of sessionStorage so it persists across tabs
// (verification email opens in a new tab)
const INVITE_CODE_STORAGE_KEY = "subtribe-pending-invite-code";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [inviteData, setInviteData] = useState<InviteValidationResponse | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!code) {
      setPageState("invalid");
      setErrorMessage("Invalid invite link");
      return;
    }

    async function validateInvite() {
      try {
        const result = await api.invites.validate(code);

        if (result.valid) {
          setInviteData(result);
          setPageState("valid");
          // Store invite code in localStorage for /claim-invite to use
          localStorage.setItem(INVITE_CODE_STORAGE_KEY, code);
        } else {
          switch (result.error) {
            case "not_found":
              setPageState("invalid");
              setErrorMessage("This invite link is not valid.");
              break;
            case "expired":
              setPageState("expired");
              setErrorMessage("This invite link has expired.");
              break;
            case "maxed_out":
              setPageState("used");
              setErrorMessage("This invite link has already been used.");
              break;
            case "inactive":
              setPageState("invalid");
              setErrorMessage("This invite link has been deactivated.");
              break;
            default:
              setPageState("invalid");
              setErrorMessage("This invite link is not valid.");
          }
        }
      } catch (error) {
        setPageState("invalid");
        if (error instanceof APIError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Failed to validate invite. Please try again.");
        }
      }
    }

    validateInvite();
  }, [code]);

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Validating invite...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your invitation.
          </p>
        </div>
      </div>
    );
  }

  // Invalid/Expired/Used states
  if (pageState !== "valid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div
            className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
              pageState === "expired" ? "bg-yellow-100" : "bg-red-100"
            }`}
          >
            {pageState === "expired" ? (
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {pageState === "expired"
              ? "Invite expired"
              : pageState === "used"
                ? "Invite already used"
                : "Invalid invite"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              Please contact your team admin for a new invitation.
            </p>
            <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
              <p>
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine if this is an org_creator invite
  const isOrgCreatorInvite = inviteData?.invite_type === "org_creator";

  // Valid invite - show invite details and options to sign up or sign in
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Show different header for org_creator vs team_member invites */}
          {isOrgCreatorInvite ? (
            <>
              {/* Org creator invite - rocket icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Create Your Organization
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You&apos;ve been invited to create your organization on Subtribe
                ATS
              </p>
              {inviteData?.inviter_name && (
                <p className="mt-1 text-xs text-gray-500">
                  Invited by {inviteData.inviter_name}
                </p>
              )}
            </>
          ) : (
            <>
              {/* Team member invite - company logo or building icon */}
              {inviteData?.company_logo ? (
                <img
                  src={inviteData.company_logo}
                  alt={inviteData.company_name || "Company"}
                  className="mx-auto h-16 w-auto object-contain"
                />
              ) : (
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              )}
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Join {inviteData?.company_name || "the team"}
              </h2>
              {inviteData?.inviter_name && (
                <p className="mt-2 text-sm text-gray-600">
                  {inviteData.inviter_name} invited you to join the team
                </p>
              )}
            </>
          )}
        </div>

        {/* Invite code saved notice */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Your invite code has been saved. It will be automatically
                applied after you sign up or sign in.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Button className="w-full" onClick={() => router.push("/sign-up")}>
            Create Account
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-in")}
          >
            Sign In
          </Button>
        </div>

        {/* Manual code entry note */}
        <p className="text-center text-xs text-gray-500">
          You can also enter this invite code manually at{" "}
          <Link
            href="/claim-invite"
            className="text-blue-600 hover:text-blue-500"
          >
            /claim-invite
          </Link>
        </p>
      </div>
    </div>
  );
}
