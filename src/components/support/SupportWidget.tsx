"use client";

import { useState } from "react";
import { SupportWidgetButton } from "./SupportWidgetButton";
import { SupportWidgetPanel } from "./SupportWidgetPanel";

export type SupportTab = "faqs" | "contact" | "chat" | "tickets";

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SupportTab>("faqs");

  return (
    <>
      {/* Floating Button */}
      <SupportWidgetButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      {/* Panel */}
      <SupportWidgetPanel
        isOpen={isOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
