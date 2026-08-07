export { analyzeSegments, analyzeText } from "./analyzer";
export type { AnalyzeOptions } from "./analyzer";
export {
  analyzeCodeFiles,
  CODE_EXTENSIONS,
  extractReviewableSegments,
  hasSupportedExtension,
} from "./code-scanner";
export {
  feedbackEventFromFinding,
  fineInContextIssueUrl,
  recordFeedbackLocally,
  FEEDBACK_STORAGE_KEY,
} from "./feedback";
export type { FeedbackEvent, FeedbackKind } from "./feedback";
export { defaultPreferences } from "./preferences";
export {
  applyPassageRewrites,
  applySuggestionToText,
  previewRewrite,
} from "./rewrite";
export { LANGUAGE_RULES } from "./rules";
export {
  isSafeAutofixRule,
  planSafeFixes,
  preserveCase,
  safeReplacementFor,
} from "./safe-fix";
export type { SafeFixPlan } from "./safe-fix";
export type {
  AnalysisResult,
  AnalysisSummary,
  Category,
  Finding,
  LanguageRule,
  RulePreference,
  RulePreferences,
  RuleSourceRef,
  Severity,
} from "./types";
