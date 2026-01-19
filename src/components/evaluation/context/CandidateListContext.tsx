"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import type { UseCandidateListReturn } from "../hooks/useCandidateList";

// The context value is the return type of useCandidateList
type CandidateListContextValue = UseCandidateListReturn;

const CandidateListContext = createContext<CandidateListContextValue | null>(null);

interface CandidateListProviderProps {
  children: ReactNode;
  value: CandidateListContextValue;
}

export function CandidateListProvider({ children, value }: CandidateListProviderProps) {
  return (
    <CandidateListContext.Provider value={value}>
      {children}
    </CandidateListContext.Provider>
  );
}

export function useCandidateListContext(): CandidateListContextValue {
  const context = useContext(CandidateListContext);
  if (!context) {
    throw new Error("useCandidateListContext must be used within a CandidateListProvider");
  }
  return context;
}
