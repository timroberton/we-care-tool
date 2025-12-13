import type { JSX } from "solid-js";

type FormModalProps = {
  title: string;
  width?: "sm" | "md" | "lg" | "xl";
  widthOverride?: string;
  children: JSX.Element;
  actions: JSX.Element;
};

const WIDTH_MAP = {
  sm: "400px",
  md: "600px",
  lg: "800px",
  xl: "80vw",
};

export function FormModal(p: FormModalProps) {
  const width = () => {
    if (p.widthOverride) return p.widthOverride;
    return WIDTH_MAP[p.width || "md"];
  };

  return (
    <div class="ui-pad-lg ui-spy" style={{ width: width() }}>
      <h2 class="text-2xl font-700">{p.title}</h2>
      {p.children}
      <div class="ui-gap-sm flex justify-start">{p.actions}</div>
    </div>
  );
}
