"use client";

import React, { useEffect, useState } from "react";
import {
  InformationCircleIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/Button";
import { emailAPI } from "@/lib/api-client";
import { EmailWildcard } from "@/types";

interface WildcardHelperProps {
  onInsert?: (wildcard: string) => void;
  className?: string;
}

export function WildcardHelper({ onInsert, className }: WildcardHelperProps) {
  const [wildcards, setWildcards] = useState<EmailWildcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedWildcard, setCopiedWildcard] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWildcards() {
      try {
        const response = await emailAPI.getWildcards();
        setWildcards(response.data);
      } catch (error) {
        console.error("Failed to fetch wildcards:", error);
        // Fallback to default wildcards if API fails
        setWildcards([
          { name: "candidate_name", description: "Candidate's first name" },
          { name: "candidate_full_name", description: "Candidate's full name" },
          { name: "candidate_email", description: "Candidate's email address" },
          { name: "job_title", description: "Job position title" },
          { name: "company_name", description: "Your company name" },
          { name: "recruiter_name", description: "Recruiter's name (you)" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchWildcards();
  }, []);

  const handleCopy = async (wildcard: string) => {
    const wildcardText = `{${wildcard}}`;
    try {
      await navigator.clipboard.writeText(wildcardText);
      setCopiedWildcard(wildcard);
      setTimeout(() => setCopiedWildcard(null), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  };

  const handleInsert = (wildcard: string) => {
    if (onInsert) {
      onInsert(`{${wildcard}}`);
    } else {
      handleCopy(wildcard);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-gray-500 hover:text-gray-700 ${className}`}
        >
          <InformationCircleIcon className="h-4 w-4" />
          <span className="text-xs">Wildcards</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[400px] overflow-hidden" align="start">
        <div className="p-3 border-b border-gray-100">
          <h4 className="font-medium text-sm text-gray-900">
            Available Wildcards
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Click to {onInsert ? "insert" : "copy"} a wildcard. These will be
            replaced with actual values when sending.
          </p>
        </div>
        <div className="max-h-[280px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading wildcards...
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {wildcards.map((wildcard) => (
                <li key={wildcard.name}>
                  <button
                    type="button"
                    onClick={() => handleInsert(wildcard.name)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <code className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {`{${wildcard.name}}`}
                      </code>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {wildcard.description}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {copiedWildcard === wildcard.name ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Example: &quot;Hi {"{candidate_name}"}&quot; becomes &quot;Hi
            John&quot;
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
