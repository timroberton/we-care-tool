import { language } from "~/translate/mod";

// English (default)
import welcome from "./welcome.md?raw";
import using from "./using.md?raw";
import methodology from "./methodology.md?raw";
import ai from "./ai.md?raw";
import faq from "./faq.md?raw";

// French
import welcomeFr from "./welcome_fr.md?raw";
import usingFr from "./using_fr.md?raw";
import methodologyFr from "./methodology_fr.md?raw";
import aiFr from "./ai_fr.md?raw";
import faqFr from "./faq_fr.md?raw";

// Portuguese
import welcomePt from "./welcome_pt.md?raw";
import usingPt from "./using_pt.md?raw";
import methodologyPt from "./methodology_pt.md?raw";
import aiPt from "./ai_pt.md?raw";
import faqPt from "./faq_pt.md?raw";

export type TabId = "welcome" | "using" | "methodology" | "ai" | "faq";

const CONTENT_EN: Record<TabId, string> = {
  welcome,
  using,
  methodology,
  ai,
  faq,
};

const CONTENT_FR: Record<TabId, string> = {
  welcome: welcomeFr,
  using: usingFr,
  methodology: methodologyFr,
  ai: aiFr,
  faq: faqFr,
};

const CONTENT_PT: Record<TabId, string> = {
  welcome: welcomePt,
  using: usingPt,
  methodology: methodologyPt,
  ai: aiPt,
  faq: faqPt,
};

export function getAboutContent(tabId: TabId): string {
  const lang = language();
  if (lang === "fr") return CONTENT_FR[tabId];
  if (lang === "pt") return CONTENT_PT[tabId];
  return CONTENT_EN[tabId];
}
