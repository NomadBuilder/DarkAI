import { LANGUAGE_RULES } from "./rules";
import type {
  LanguageRule,
  RulePreference,
  RulePreferences,
  Severity,
} from "./types";

export const PREFS_STORAGE_KEY = "decolonize.rulePreferences.v1";

export function resolveRules(
  preferences?: RulePreferences | null,
): LanguageRule[] {
  return LANGUAGE_RULES.flatMap((rule) => {
    const pref = preferences?.[rule.id];
    if (pref?.enabled === false) return [];
    return [
      {
        ...rule,
        severity: pref?.severity ?? rule.severity,
      },
    ];
  });
}

export function defaultPreferences(): RulePreferences {
  const prefs: RulePreferences = {};
  for (const rule of LANGUAGE_RULES) {
    prefs[rule.id] = { enabled: true, severity: rule.severity };
  }
  return prefs;
}

export function mergePreferences(
  stored: RulePreferences | null | undefined,
): RulePreferences {
  const base = defaultPreferences();
  if (!stored) return base;
  for (const rule of LANGUAGE_RULES) {
    const pref = stored[rule.id];
    if (!pref) continue;
    base[rule.id] = {
      enabled: pref.enabled ?? true,
      severity: pref.severity ?? rule.severity,
    };
  }
  return base;
}

export function countPreferenceDrift(prefs: RulePreferences): {
  disabled: number;
  severityChanged: number;
} {
  let disabled = 0;
  let severityChanged = 0;
  for (const rule of LANGUAGE_RULES) {
    const pref = prefs[rule.id];
    if (pref?.enabled === false) disabled += 1;
    if (pref?.severity && pref.severity !== rule.severity) {
      severityChanged += 1;
    }
  }
  return { disabled, severityChanged };
}

export function setRuleEnabled(
  prefs: RulePreferences,
  ruleId: string,
  enabled: boolean,
): RulePreferences {
  return {
    ...prefs,
    [ruleId]: { ...prefs[ruleId], enabled },
  };
}

export function setRuleSeverity(
  prefs: RulePreferences,
  ruleId: string,
  severity: Severity,
): RulePreferences {
  return {
    ...prefs,
    [ruleId]: { ...prefs[ruleId], enabled: prefs[ruleId]?.enabled ?? true, severity },
  };
}

export function setCategoryEnabled(
  prefs: RulePreferences,
  category: LanguageRule["category"],
  enabled: boolean,
): RulePreferences {
  const next = { ...prefs };
  for (const rule of LANGUAGE_RULES) {
    if (rule.category !== category) continue;
    next[rule.id] = { ...next[rule.id], enabled };
  }
  return next;
}

export function isValidPreferences(value: unknown): value is RulePreferences {
  if (!value || typeof value !== "object") return false;
  for (const [key, pref] of Object.entries(value as Record<string, unknown>)) {
    if (typeof key !== "string") return false;
    if (!pref || typeof pref !== "object") return false;
    const p = pref as RulePreference;
    if (p.enabled !== undefined && typeof p.enabled !== "boolean") return false;
    if (
      p.severity !== undefined &&
      p.severity !== "high" &&
      p.severity !== "medium" &&
      p.severity !== "low"
    ) {
      return false;
    }
  }
  return true;
}
