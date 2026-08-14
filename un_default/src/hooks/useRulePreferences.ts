"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PREFS_STORAGE_KEY,
  LEGACY_PREFS_STORAGE_KEY,
  countPreferenceDrift,
  defaultPreferences,
  mergePreferences,
  setCategoryEnabled,
  setRuleEnabled,
  setRuleSeverity,
} from "@/lib/preferences";
import { readMigratedStorage } from "@/lib/storage";
import type { Category, RulePreferences, Severity } from "@/lib/types";

export function useRulePreferences() {
  const [preferences, setPreferences] = useState<RulePreferences>(() =>
    defaultPreferences(),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = readMigratedStorage(
        PREFS_STORAGE_KEY,
        LEGACY_PREFS_STORAGE_KEY,
      );
      if (raw) {
        setPreferences(mergePreferences(JSON.parse(raw)));
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // quota / private mode
    }
  }, [preferences, hydrated]);

  const toggleRule = useCallback((ruleId: string, enabled: boolean) => {
    setPreferences((prev) => setRuleEnabled(prev, ruleId, enabled));
  }, []);

  const changeSeverity = useCallback((ruleId: string, severity: Severity) => {
    setPreferences((prev) => setRuleSeverity(prev, ruleId, severity));
  }, []);

  const toggleCategory = useCallback((category: Category, enabled: boolean) => {
    setPreferences((prev) => setCategoryEnabled(prev, category, enabled));
  }, []);

  const reset = useCallback(() => {
    setPreferences(defaultPreferences());
  }, []);

  const drift = countPreferenceDrift(preferences);

  return {
    preferences,
    hydrated,
    toggleRule,
    changeSeverity,
    toggleCategory,
    reset,
    drift,
  };
}
