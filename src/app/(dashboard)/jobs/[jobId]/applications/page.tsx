"use client";

import React from "react";

export default function ApplicationsEmptyPage() {
  return (
    <div className="eval-tabs-container">
      <div className="eval-tabs-content">
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">
            Select a candidate to view details
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            Click on a candidate from the list
          </p>
        </div>
      </div>
    </div>
  );
}
