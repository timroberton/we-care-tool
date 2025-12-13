// Copyright 2023-2025, Tim Roberton, All rights reserved.
//
// ⚠️  EXTERNAL LIBRARY - Auto-synced from timroberton-panther
// ⚠️  DO NOT EDIT - Changes will be overwritten on next sync

import type { ColorKeyOrString, PaddingOptions, TextInfo } from "./deps.ts";

const _DS = {
  scale: 1,
  baseText: {
    font: { key: "main400" },
    fontSize: 24,
    color: { key: "baseContent" },
    lineHeight: 1.4,
    lineBreakGap: 0.5,
    letterSpacing: "0px",
    fontVariants: {
      bold: { key: "main700" },
    },
  } as TextInfo,
  cover: {
    backgroundColor: { key: "base300" } as ColorKeyOrString,
    logoHeight: 320,
    logoGapX: 40,
    gapY: 30,
  },
  section: {
    backgroundColor: { key: "base300" } as ColorKeyOrString,
    gapY: 30,
  },
  header: {
    padding: [40, 60] as PaddingOptions,
    logoHeight: 300,
    logoGapX: 40,
    logoPlacement: "left" as "left" | "right",
    backgroundColor: { key: "base200" } as ColorKeyOrString,
    logoBottomPadding: 20,
    headerBottomPadding: 20,
    subHeaderBottomPadding: 20,
    bottomBorderStrokeWidth: 0,
    bottomBorderColor: { key: "primary" } as ColorKeyOrString,
  },
  footer: {
    padding: 60 as PaddingOptions,
    logoHeight: 200,
    logoGapX: 40,
    backgroundColor: { key: "base200" } as ColorKeyOrString,
  },
  content: {
    padding: 60 as PaddingOptions,
    backgroundColor: { key: "base100" } as ColorKeyOrString,
    gapX: 40,
    gapY: 40,
    nColumns: 12,
  },
  layoutContainers: {
    padding: 0 as PaddingOptions,
    backgroundColor: "none" as ColorKeyOrString,
    borderColor: "none" as ColorKeyOrString,
    borderWidth: 0,
    borderRadius: 0,
  },
};

export type DefaultPageStyle = typeof _DS;

export function getDefaultPageStyle(): DefaultPageStyle {
  return _DS;
}
