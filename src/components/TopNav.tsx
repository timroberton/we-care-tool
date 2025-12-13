import { Button, Select, type IconName, type SelectOption } from "panther";
import { Show, type JSX } from "solid-js";
import { language, setLanguage, type Language } from "~/translate/mod";

const LANGUAGE_OPTIONS: SelectOption<Language>[] = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
  { value: "pt", label: "PT" },
];

type NavLink = {
  label: string;
  href: string;
};

type NavButton = {
  label: string;
  onClick: () => void;
  intent?: "primary" | "base-100" | "neutral" | "success" | "danger";
  outline?: boolean;
  iconName?: IconName;
};

type TopNavProps = {
  title: string | JSX.Element;
  navLinks?: NavLink[];
  buttons?: NavButton[];
};

export function TopNav(p: TopNavProps) {
  return (
    <div class="ui-pad text-primary text-2xl border-b-2 border-base-content flex items-center ui-gap h-[64px] bg-base-200">
      <div class="flex-shrink-0 font-900">{p.title}</div>
      <Show when={p.buttons && p.buttons.length > 0}>
        <div class="ui-gap-sm flex items-center ml-1">
          {p.buttons!.map((button) => (
            <Button
              onClick={button.onClick}
              // intent={button.intent || "primary"}
              // intent="base-100"
              // outline={button.outline}
              iconName={button.iconName}
              outline
              fillBase100
            >
              {/* {button.label} */}
            </Button>
          ))}
        </div>
      </Show>
      <div class="flex-1"></div>
      <Show when={p.navLinks && p.navLinks.length > 0}>
        <div class="ui-gap flex items-center text-base text-base-content">
          {p.navLinks!.map((link) => (
            <a
              href={link.href}
              class="border-transparent hover:border-base-content pt-0.5 border-b-2 whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Show>
      <div class="w-18">
        <Select
          value={language()}
          options={LANGUAGE_OPTIONS}
          onChange={(v) => setLanguage(v as Language)}
          // size="sm"
          fullWidth
        />
      </div>
    </div>
  );
}
