import { language } from "./language";
import { TRANSLATIONS_FR } from "./translations_fr";
import { TRANSLATIONS_PT } from "./translations_pt";
import type { TranslationKey } from "./keys";

// Type-safe translation for static UI strings
export function t(key: TranslationKey): string {
  const lang = language();
  if (lang === "fr") return TRANSLATIONS_FR.get(key) ?? key;
  if (lang === "pt") return TRANSLATIONS_PT.get(key) ?? key;
  return key;
}

// Dynamic translation for strings from config/data (not type-checked)
export function td(key: string): string {
  const lang = language();
  if (lang === "fr") return TRANSLATIONS_FR.get(key) ?? key;
  if (lang === "pt") return TRANSLATIONS_PT.get(key) ?? key;
  return key;
}
