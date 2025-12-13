// Copyright 2023-2025, Tim Roberton, All rights reserved.
//
// ⚠️  EXTERNAL LIBRARY - Auto-synced from timroberton-panther
// ⚠️  DO NOT EDIT - Changes will be overwritten on next sync

import type { ColorKeyOrString, TextInfo } from "./deps.ts";

const _DS = {
  scale: 1,

  baseText: {
    font: { key: "main400" },
    fontSize: 14,
    color: "#333333",
    lineHeight: 1.2,
    lineBreakGap: 0.5,
    letterSpacing: "0px",
    fontVariants: {
      bold: { key: "main700" },
    },
  } as TextInfo,

  text: {
    h1: { relFontSize: 2.0, font: { key: "main700" } },
    h2: { relFontSize: 1.5, font: { key: "main700" } },
    h3: { relFontSize: 1.25, font: { key: "main700" } },
  } as const,

  marginsEm: {
    paragraph: { top: 1, bottom: 1 },
    h1: { top: 0.9, bottom: 0 },
    h2: { top: 0.95, bottom: 0 },
    h3: { top: 1, bottom: 0 },
    h4: { top: 1, bottom: 0 },
    h5: { top: 1, bottom: 0 },
    h6: { top: 1, bottom: 0 },
    list: { top: 1, bottom: 1, gap: 0.5 },
    image: { top: 1, bottom: 1.5 },
    table: { top: 1, bottom: 1.5 },
    blockquote: { top: 1.5, bottom: 1.5 },
    horizontalRule: { top: 1.5, bottom: 1.5 },
    code: { top: 1.5, bottom: 1.5 },
  },

  // List-specific structure
  bulletList: {
    level0: { marker: "•", markerIndentEm: 0, textIndentEm: 1.714 },
    level1: { marker: "◦", markerIndentEm: 1.714, textIndentEm: 3.429 },
    level2: { marker: "▪", markerIndentEm: 3.429, textIndentEm: 5.143 },
  },

  numberedList: {
    level0: { marker: ".", markerIndentEm: 0, textIndentEm: 1.714 },
    level1: { marker: ".", markerIndentEm: 1.714, textIndentEm: 3.429 },
    level2: { marker: ".", markerIndentEm: 3.429, textIndentEm: 5.143 },
  },

  // Blockquote - align lives here only
  blockquote: {
    leftBorderWidth: 3,
    leftBorderColor: "#cccccc" as ColorKeyOrString,
    leftIndentEm: 1.714,
    align: "left" as "left" | "center" | "right",
    backgroundColor: "none" as ColorKeyOrString | "none",
  },

  // Code styling
  code: {
    backgroundColor: { key: "base300" } as ColorKeyOrString,
  },

  // Horizontal rule
  horizontalRule: {
    strokeWidth: 1,
    strokeColor: { key: "base300" } as ColorKeyOrString,
  },

  // Link styling
  link: {
    color: "#0066cc" as ColorKeyOrString,
    underline: true,
  },

  // Image styling
  image: {
    defaultAspectRatio: 16 / 9,
  },

  // Table styling
  table: {
    border: {
      width: 1,
      color: { key: "base300" } as ColorKeyOrString,
      style: "single" as "single" | "double" | "dotted",
    },
    cellPaddingEm: {
      horizontal: 1,
      vertical: 0.5,
    },
    headerShading: {
      color: { key: "base200" } as ColorKeyOrString,
      opacity: 1,
    },
  },

  // Math display alignment
  math: {
    displayAlign: "center" as "left" | "center" | "right",
  },
};

export type DefaultMarkdownStyle = typeof _DS;

export function getDefaultMarkdownStyle(): DefaultMarkdownStyle {
  return _DS;
}
