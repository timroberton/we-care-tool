import { td } from "~/translate/mod";

export const _COMPLICATON_CATEGORY = [
  { id: "moderate", label: "Moderate" },
  { id: "severe", label: "Severe" },
];

export type ComplicationCategory = "moderate" | "severe";

export const _COMPLICATIONS: Array<{
  id: string;
  label: string;
  category: ComplicationCategory;
}> = [
  { id: "incomple", label: "Incomplete abortion", category: "moderate" },
  { id: "continuing", label: "Continuing pregnancy", category: "moderate" },
  { id: "infection", label: "Infection", category: "moderate" },
  { id: "trauma", label: "Trauma", category: "severe" },
  { id: "hemorrhage", label: "Hemorrhage", category: "severe" },
  { id: "other", label: "Other", category: "severe" },
];

export function getComplicationLabel(label: string): string {
  return td(label);
}

export function getComplicationCategoryLabel(category: ComplicationCategory): string {
  return category === "moderate" ? td("Moderate") : td("Severe");
}
