"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

/**
 * Tawk.to Live Chat Widget
 * Loads the Tawk.to script for customer support chat
 */
export function TawkTo() {
  useEffect(() => {
    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/69537fda3df5ac197b2a9bd8/1jdn2msc6";
    script.setAttribute("charset", "UTF-8");
    script.setAttribute("crossorigin", "*");

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);

    return () => {
      // Cleanup on unmount
      script.remove();
    };
  }, []);

  return null;
}
