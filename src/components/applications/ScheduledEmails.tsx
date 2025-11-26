"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Mail, AlertCircle, CheckCircle, XCircle, Ban } from "lucide-react";
import { api } from "@/lib/api-client";
import { ScheduledEmail } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ScheduledEmailsProps {
  applicationId: string;
}

// Simple time ago formatter
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

// Simple badge component
function Badge({ children, variant = "default", className = "" }: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}) {
  const variantStyles = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700",
  };
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function ScheduledEmails({ applicationId }: ScheduledEmailsProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmails() {
      try {
        setLoading(true);
        const response = await api.applications.getScheduledEmails(applicationId);
        setEmails(response.data);
      } catch (err) {
        console.error("Failed to fetch scheduled emails:", err);
        setError("Failed to load email history");
      } finally {
        setLoading(false);
      }
    }

    fetchEmails();
  }, [applicationId]);

  function getStatusBadge(status: ScheduledEmail["status"]) {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600 text-white">
            <CheckCircle className="h-3 w-3" />
            Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Ban className="h-3 w-3" />
            Cancelled
          </Badge>
        );
    }
  }

  function getTemplateLabel(templateType: string) {
    switch (templateType) {
      case "interview_invite":
        return "Interview Invitation";
      case "rejection":
        return "Rejection";
      default:
        return templateType;
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading email history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-8 text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (emails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No emails scheduled yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="border-l-2 border-muted pl-4 pb-4 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {getTemplateLabel(email.template_type)}
                    </span>
                    {getStatusBadge(email.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {email.subject}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>To: {email.recipient_email}</span>
                </div>

                {email.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Scheduled for {new Date(email.scheduled_for).toLocaleString()}
                    </span>
                  </div>
                )}

                {email.status === "sent" && email.sent_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>
                      Sent {formatTimeAgo(new Date(email.sent_at))}
                    </span>
                  </div>
                )}

                {email.status === "failed" && email.error_message && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>Error: {email.error_message}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    Created {formatTimeAgo(new Date(email.created_at))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
