// Copyright 2023-2025, Tim Roberton, All rights reserved.
//
// ⚠️  EXTERNAL LIBRARY - Auto-synced from timroberton-panther
// ⚠️  DO NOT EDIT - Changes will be overwritten on next sync

export {
  cleanFontFamilyForJsPdf,
  normalizeFontFamily,
  quoteFontFamilyForCanvas,
} from "./font_name_helpers.ts";
export { getFont, setKeyFonts } from "./key_fonts.ts";
export {
  deduplicateFonts,
  getBaseTextInfo,
  getFontsToRegister,
  getMergedFont,
  getMergedFontVariants,
  getTextInfo,
  getTextInfoWithDefaults,
} from "./style_helpers.ts";
export {
  type CustomStyleTextOptions,
  type FontInfo,
  type FontKeyOrFontInfo,
  type FontVariants,
  type FontVariantsCustomStyle,
  type FontVariantsKeyed,
  getAdjustedText,
  getFontInfoId,
  type KeyFonts,
  type StyleWithFontRegistration,
  type TextAdjustmentOptions,
  type TextInfo,
  type TextInfoOptions,
  type TextInfoUnkeyed,
} from "./types.ts";
export { collectFontsFromStyles } from "./collect_fonts.ts";
export { TIM_FONT_SETS, TIM_FONTS } from "./generated/fonts.ts";
export { FONT_MAP_TTF } from "./generated/map_ttf.ts";
export type { FontId_TTF } from "./generated/map_ttf.ts";
export { FONT_MAP_WOFF } from "./generated/map_woff.ts";
export type { FontId_WOFF } from "./generated/map_woff.ts";
