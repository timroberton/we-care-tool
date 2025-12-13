import { Show, type JSX } from "solid-js";

export function Section(p: {
  children: JSX.Element;
  header: string;
  rightPanel?: JSX.Element;
}) {
  return (
    // <div class="border ui-pad ui-spy-sm border-base-300 rounded">
    <div class="border-base-300 rounded">
      <div class="flex items-center ui-gap">
        <div class="font-700 text-lg flex-1">{p.header}</div>
        <Show when={p.rightPanel}>
          <div class="flex-none">{p.rightPanel}</div>
        </Show>
      </div>
      <div class="">{p.children}</div>
    </div>
  );
}
