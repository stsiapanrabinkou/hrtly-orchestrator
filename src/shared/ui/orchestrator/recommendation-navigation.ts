import type { MouseEvent } from "react";

export type RecommendationDecision = "pending" | "accepted" | "modified" | "dismissed";
export type RecommendationDecisionPreview = {
  recommendationId: string;
  title: string;
  patientId: string;
  decision: Exclude<RecommendationDecision, "pending">;
  text: string;
  reason: string;
  author: string;
  date: string;
};
export type RecommendationDecisions = Record<string, RecommendationDecisionPreview>;
export type RecommendationReturnTab = "overview" | "communications" | "recommendations";

// Navigation-only state for the mock review flow; no persisted patient data.
declare module "@tanstack/history" {
  interface HistoryState {
    recommendationDecisions?: RecommendationDecisions;
  }
}

export function followPreviewLink(event: MouseEvent<HTMLAnchorElement>, onOpen?: () => void) {
  if (onOpen && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    onOpen();
  }
}

export function recommendationDecisionLabel(decision: RecommendationDecision) {
  return { pending: "Pending review", accepted: "Approved", modified: "Edited & approved", dismissed: "Dismissed" }[decision];
}
