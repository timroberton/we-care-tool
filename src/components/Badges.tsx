import { t } from "~/translate/mod";

type SafetyBadgeProps = {
  safety: "safe" | "less" | "least";
  size?: "sm" | "md";
};

export function SafetyBadge(p: SafetyBadgeProps) {
  const sizeClass = p.size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      class={`rounded whitespace-nowrap px-2 py-0.5 font-700 ${sizeClass} ${
        p.safety === "safe"
          ? "bg-success/10 text-success"
          : p.safety === "less"
          ? "bg-[#FFA500]/10 text-[#FFA500]"
          : "bg-danger/10 text-danger"
      }`}
    >
      {p.safety === "safe"
        ? t("SAFE")
        : p.safety === "less"
        ? t("LESS SAFE")
        : t("LEAST SAFE")}
    </span>
  );
}

type ComplicationCategoryBadgeProps = {
  category: "moderate" | "severe";
  size?: "sm" | "md";
};

export function ComplicationCategoryBadge(p: ComplicationCategoryBadgeProps) {
  const sizeClass = p.size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      class={`rounded whitespace-nowrap px-2 py-0.5 font-700 ${sizeClass} ${
        p.category === "moderate"
          ? "bg-[#FFA500]/10 text-[#FFA500]"
          : "bg-danger/10 text-danger"
      }`}
    >
      {p.category === "moderate" ? t("MODERATE") : t("SEVERE")}
    </span>
  );
}

type ConfidenceBadgeProps = {
  confidence: "high_confidence" | "medium_confidence" | "low_confidence";
  size?: "sm" | "md";
};

export function ConfidenceBadge(p: ConfidenceBadgeProps) {
  const sizeClass = p.size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      class={`rounded whitespace-nowrap px-2 py-0.5 font-700 ${sizeClass} ${
        p.confidence === "high_confidence"
          ? "bg-success/10 text-success"
          : p.confidence === "medium_confidence"
          ? "bg-[#FFA500]/10 text-[#FFA500]"
          : "bg-danger/10 text-danger"
      }`}
    >
      {p.confidence === "high_confidence"
        ? t("STRONG EVIDENCE")
        : p.confidence === "medium_confidence"
        ? t("MODERATE EVIDENCE")
        : t("WEAK EVIDENCE")}
    </span>
  );
}

type SourceTypeBadgeProps = {
  label: string;
  size?: "sm" | "md";
};

export function SourceTypeBadge(p: SourceTypeBadgeProps) {
  const sizeClass = p.size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      class={`rounded whitespace-nowrap px-2 py-0.5 font-700 ${sizeClass} bg-base-200 text-neutral`}
    >
      {p.label}
    </span>
  );
}
