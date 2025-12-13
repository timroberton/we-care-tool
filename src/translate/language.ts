import { createSignal } from "solid-js";

export type Language = "en" | "fr" | "pt";

const STORAGE_KEY = "who-abortion-care-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "pt") return stored;
  return "en";
}

const [language, _setLanguage] = createSignal<Language>(getInitialLanguage());

export function setLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang);
  _setLanguage(lang);
}

export { language };
