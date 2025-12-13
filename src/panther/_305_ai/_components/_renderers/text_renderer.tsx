// Copyright 2023-2025, Tim Roberton, All rights reserved.
//
// ⚠️  EXTERNAL LIBRARY - Auto-synced from timroberton-panther
// ⚠️  DO NOT EDIT - Changes will be overwritten on next sync

import { type Component, Match, Switch } from "solid-js";
import type { DisplayItem, MessageStyle } from "../../_core/types.ts";
import {
  deriveMarkdownCssVars,
  MARKDOWN_BASE_STYLES,
  md,
} from "./_markdown_utils.ts";
import type { CustomMarkdownStyleOptions } from "../../deps.ts";

export const TextRenderer: Component<{
  item: Extract<DisplayItem, { type: "text" }>;
  userMessageStyle?: MessageStyle;
  assistantMessageStyle?: MessageStyle;
  markdownStyle?: CustomMarkdownStyleOptions;
}> = (p) => {
  const userBg = p.userMessageStyle?.background ?? "bg-base-200";
  const userText = p.userMessageStyle?.text ?? "text-base-content";
  const userClass = `${userBg} ${userText}`;

  const assistantBg = p.assistantMessageStyle?.background ?? "bg-primary/10";
  const assistantText = p.assistantMessageStyle?.text ?? "text-primary";
  const assistantClass = `${assistantBg} ${assistantText}`;

  return (
    <Switch>
      <Match when={p.item.role === "user"}>
        <div class="ml-auto max-w-[80%]">
          <div class={`ui-pad rounded text-right text-sm ${userClass}`}>
            <div class="whitespace-pre-wrap break-words">{p.item.text}</div>
          </div>
        </div>
      </Match>
      <Match when={p.item.role === "assistant"}>
        <div class="w-fit max-w-full">
          <div
            class={`ui-pad w-fit max-w-full rounded text-sm ${assistantClass} ${MARKDOWN_BASE_STYLES}`}
            style={deriveMarkdownCssVars(p.markdownStyle)}
            innerHTML={md.render(p.item.text)}
          />
        </div>
      </Match>
    </Switch>
  );
};
