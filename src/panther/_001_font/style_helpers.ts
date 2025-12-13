// Copyright 2023-2025, Tim Roberton, All rights reserved.
//
// ⚠️  EXTERNAL LIBRARY - Auto-synced from timroberton-panther
// ⚠️  DO NOT EDIT - Changes will be overwritten on next sync

import { getColor, m, ms } from "./deps.ts";
import { getFont } from "./key_fonts.ts";
import {
  type CustomStyleTextOptions,
  type FontInfo,
  type FontKeyOrFontInfo,
  type FontVariants,
  type FontVariantsCustomStyle,
  type FontVariantsKeyed,
  getFontInfoId,
  type TextInfo,
  type TextInfoOptions,
  type TextInfoUnkeyed,
} from "./types.ts";

export function getBaseTextInfo(
  cBase: TextInfoOptions | undefined,
  gBase: TextInfoOptions | undefined,
  dBase: TextInfo,
  sf: number,
): TextInfo {
  return {
    font: m(cBase?.font, gBase?.font, dBase.font),
    fontSize: sf * m(cBase?.fontSize, gBase?.fontSize, dBase.fontSize),
    color: m(cBase?.color, gBase?.color, dBase.color),
    lineHeight: m(cBase?.lineHeight, gBase?.lineHeight, dBase.lineHeight),
    lineBreakGap: m(
      cBase?.lineBreakGap,
      gBase?.lineBreakGap,
      dBase.lineBreakGap,
    ),
    letterSpacing: m(
      cBase?.letterSpacing,
      gBase?.letterSpacing,
      dBase.letterSpacing,
    ),
    fontVariants: m(
      cBase?.fontVariants,
      gBase?.fontVariants,
      dBase.fontVariants,
    ),
  };
}

export function getTextInfo(
  cText: CustomStyleTextOptions | undefined,
  gText: CustomStyleTextOptions | undefined,
  baseText: TextInfo,
): TextInfoUnkeyed {
  const rawColor = m(cText?.color, gText?.color, baseText.color);
  const rawLineHeight = m(
    cText?.lineHeight,
    gText?.lineHeight,
    baseText.lineHeight,
  );
  const rawLineBreakGap = m(
    cText?.lineBreakGap,
    gText?.lineBreakGap,
    baseText.lineBreakGap,
  );
  const rawLetterSpacing = m(
    cText?.letterSpacing,
    gText?.letterSpacing,
    baseText.letterSpacing,
  );
  return {
    font: getMergedFont(cText, gText, baseText.font),
    fontSize: baseText.fontSize *
      (cText?.relFontSize ?? gText?.relFontSize ?? 1),
    color: getColor(rawColor === "same-as-base" ? baseText.color : rawColor),
    lineHeight: rawLineHeight === "same-as-base"
      ? baseText.lineHeight
      : rawLineHeight,
    lineBreakGap: rawLineBreakGap === "same-as-base"
      ? baseText.lineBreakGap
      : rawLineBreakGap,
    letterSpacing: rawLetterSpacing === "same-as-base"
      ? baseText.letterSpacing
      : rawLetterSpacing,
    fontVariants: getMergedFontVariants(cText, gText, baseText.fontVariants),
  };
}

export function getTextInfoWithDefaults(
  cText: CustomStyleTextOptions | undefined,
  gText: CustomStyleTextOptions | undefined,
  elementDefault: CustomStyleTextOptions | undefined,
  baseText: TextInfo,
): TextInfoUnkeyed {
  const rawColor = m(cText?.color, gText?.color, baseText.color);
  const rawLineHeight = m(
    cText?.lineHeight,
    gText?.lineHeight,
    baseText.lineHeight,
  );
  const rawLineBreakGap = m(
    cText?.lineBreakGap,
    gText?.lineBreakGap,
    baseText.lineBreakGap,
  );
  const rawLetterSpacing = m(
    cText?.letterSpacing,
    gText?.letterSpacing,
    baseText.letterSpacing,
  );

  const rawFont = cText?.font ??
    gText?.font ??
    elementDefault?.font ??
    baseText.font;
  const font = getFont(rawFont === "same-as-base" ? baseText.font : rawFont);

  return {
    font,
    fontSize: baseText.fontSize *
      (cText?.relFontSize ?? gText?.relFontSize ??
        elementDefault?.relFontSize ?? 1),
    color: getColor(rawColor === "same-as-base" ? baseText.color : rawColor),
    lineHeight: rawLineHeight === "same-as-base"
      ? baseText.lineHeight
      : rawLineHeight,
    lineBreakGap: rawLineBreakGap === "same-as-base"
      ? baseText.lineBreakGap
      : rawLineBreakGap,
    letterSpacing: rawLetterSpacing === "same-as-base"
      ? baseText.letterSpacing
      : rawLetterSpacing,
    fontVariants: getMergedFontVariants(cText, gText, baseText.fontVariants),
  };
}

export function getMergedFont(
  cText: CustomStyleTextOptions | undefined,
  gText: CustomStyleTextOptions | undefined,
  baseFont: FontKeyOrFontInfo,
): FontInfo {
  const rawFont = m(cText?.font, gText?.font, baseFont);
  return getFont(rawFont === "same-as-base" ? baseFont : rawFont);
}

export function getMergedFontVariants(
  cText: CustomStyleTextOptions | undefined,
  gText: CustomStyleTextOptions | undefined,
  baseFontVariants: FontVariantsKeyed | undefined,
): FontVariants | undefined {
  const rawFontVariants = m(
    cText?.fontVariants,
    gText?.fontVariants,
    baseFontVariants,
  );

  if (!rawFontVariants || rawFontVariants === "same-as-base") {
    if (rawFontVariants === "same-as-base" && baseFontVariants) {
      return {
        bold: baseFontVariants.bold
          ? getFont(baseFontVariants.bold)
          : undefined,
        italic: baseFontVariants.italic
          ? getFont(baseFontVariants.italic)
          : undefined,
        boldAndItalic: baseFontVariants.boldAndItalic
          ? getFont(baseFontVariants.boldAndItalic)
          : undefined,
      };
    }
    return undefined;
  }

  const variants = rawFontVariants as
    | FontVariantsCustomStyle
    | FontVariantsKeyed;
  const result: FontVariants = {};

  if (variants.bold) {
    if (variants.bold === "same-as-base" && baseFontVariants?.bold) {
      result.bold = getFont(baseFontVariants.bold);
    } else if (variants.bold === "same-as-regular") {
      // Don't add to result - use synthetic
    } else if (variants.bold !== "same-as-base") {
      result.bold = getFont(variants.bold);
    }
  }

  if (variants.italic) {
    if (variants.italic === "same-as-base" && baseFontVariants?.italic) {
      result.italic = getFont(baseFontVariants.italic);
    } else if (variants.italic === "same-as-regular") {
      // Don't add to result - use synthetic
    } else if (variants.italic !== "same-as-base") {
      result.italic = getFont(variants.italic);
    }
  }

  if (variants.boldAndItalic) {
    if (
      variants.boldAndItalic === "same-as-base" &&
      baseFontVariants?.boldAndItalic
    ) {
      result.boldAndItalic = getFont(baseFontVariants.boldAndItalic);
    } else if (variants.boldAndItalic === "same-as-regular") {
      // Don't add to result - use synthetic
    } else if (variants.boldAndItalic !== "same-as-base") {
      result.boldAndItalic = getFont(variants.boldAndItalic);
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function deduplicateFonts(fonts: FontInfo[]): FontInfo[] {
  const uniqueFontsMap = new Map<string, FontInfo>();
  for (const font of fonts) {
    const fontId = getFontInfoId(font);
    if (!uniqueFontsMap.has(fontId)) {
      uniqueFontsMap.set(fontId, font);
    }
  }
  return Array.from(uniqueFontsMap.values());
}

export function getFontsToRegister<K extends string>(
  textStyleKeys: readonly K[],
  customText:
    | Record<string, CustomStyleTextOptions | TextInfoOptions>
    | undefined,
  globalText:
    | Record<string, CustomStyleTextOptions | TextInfoOptions>
    | undefined,
  defaultBaseFont: FontKeyOrFontInfo,
): FontInfo[] {
  const rawBaseFont = m(
    customText?.base?.font,
    globalText?.base?.font,
    defaultBaseFont,
  );
  const baseFont = rawBaseFont === "same-as-base"
    ? defaultBaseFont
    : rawBaseFont;

  const allFonts = textStyleKeys.map((key) => {
    if (key === "base") {
      return getFont(baseFont);
    }
    return getMergedFont(
      customText?.[key] as CustomStyleTextOptions | undefined,
      globalText?.[key] as CustomStyleTextOptions | undefined,
      baseFont,
    );
  });

  return deduplicateFonts(allFonts);
}
