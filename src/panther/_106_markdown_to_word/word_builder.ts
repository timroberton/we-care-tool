// Copyright 2023-2025, Tim Roberton, All rights reserved.
//
// ⚠️  EXTERNAL LIBRARY - Auto-synced from timroberton-panther
// ⚠️  DO NOT EDIT - Changes will be overwritten on next sync

import {
  BorderStyle,
  CustomMarkdownStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "./deps.ts";
import type {
  DocElement,
  InlineContent,
  ParsedDocument,
} from "./document_model.ts";
import type { MergedMarkdownStyle } from "./deps.ts";
import type { ConvertMarkdownToWordOptions } from "./converter.ts";
import { parseEmailsInText } from "./parser.ts";
import {
  createFooterFromWordConfig,
  createNumberingFromMerged,
  createStylesFromMerged,
  getLinkColorFromMerged,
  getPagePropertiesFromWordConfig,
  mergeWordConfig,
} from "./styles.ts";
import {
  DEFAULT_WORD_SPECIFIC_CONFIG,
  type WordSpecificConfig,
} from "./word_specific_config.ts";
import { pixelsToTwips } from "./word_units.ts";

type ElementMargins = { top: number; bottom: number };

function getElementMargins(
  element: DocElement,
  merged: MergedMarkdownStyle,
): ElementMargins {
  switch (element.type) {
    case "paragraph":
      return merged.margins.paragraph;
    case "heading": {
      const key = `h${element.level}` as
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6";
      return merged.margins[key];
    }
    case "list-item": {
      return {
        top: element.isFirstInList
          ? merged.margins.list.top
          : merged.margins.list.gap,
        bottom: element.isLastInList
          ? merged.margins.list.bottom
          : merged.margins.list.gap,
      };
    }
    case "blockquote":
      return merged.margins.blockquote;
    case "horizontal-rule":
      return merged.margins.horizontalRule;
    case "image":
      return merged.margins.image;
    case "table":
      return merged.margins.table;
  }
}

export function buildWordDocument(
  parsedDoc: ParsedDocument,
  options?: ConvertMarkdownToWordOptions,
): Document {
  const styleClass = new CustomMarkdownStyle(options?.markdownStyle);
  const merged = styleClass.getMergedMarkdownStyle();

  const wordConfig = mergeWordConfig(options?.wordConfig);

  let currentNumberingInstance = 0;
  let currentBulletInstance = 0;
  let prevMarginBottom = 0;

  const paragraphs: (Paragraph | Table)[] = parsedDoc.elements.map(
    (element, index) => {
      const isNumberedListItem = element.type === "list-item" &&
        element.listType === "numbered";
      const isBulletListItem = element.type === "list-item" &&
        element.listType === "bullet";

      if (
        isNumberedListItem &&
        (index === 0 || parsedDoc.elements[index - 1]?.type !== "list-item" ||
          (parsedDoc.elements[index - 1] as any).listType !== "numbered")
      ) {
        currentNumberingInstance++;
      }

      if (
        isBulletListItem &&
        (index === 0 || parsedDoc.elements[index - 1]?.type !== "list-item" ||
          (parsedDoc.elements[index - 1] as any).listType !== "bullet")
      ) {
        currentBulletInstance++;
      }

      const margins = getElementMargins(element, merged);
      const isFirst = index === 0;
      const isLast = index === parsedDoc.elements.length - 1;

      const collapsedSpacingBefore = isFirst
        ? 0
        : Math.max(prevMarginBottom, margins.top);

      const spacingAfter = isLast ? margins.bottom : 0;

      prevMarginBottom = margins.bottom;

      return buildParagraph(
        element,
        merged,
        wordConfig,
        currentNumberingInstance,
        currentBulletInstance,
        collapsedSpacingBefore,
        spacingAfter,
      );
    },
  );

  return new Document({
    styles: createStylesFromMerged(merged, wordConfig),
    numbering: createNumberingFromMerged(merged, wordConfig),
    sections: [
      {
        properties: getPagePropertiesFromWordConfig(wordConfig),
        children: paragraphs,
        footers: {
          default: createFooterFromWordConfig(wordConfig),
        },
      },
    ],
  });
}

function buildParagraph(
  element: DocElement,
  merged: MergedMarkdownStyle,
  wordConfig: WordSpecificConfig,
  numberingInstance: number,
  bulletInstance: number,
  spacingBefore: number,
  spacingAfter: number,
): Paragraph | Table {
  const children = buildInlineContent(element.content, merged);

  switch (element.type) {
    case "heading": {
      const headingLevel = element.level === 1
        ? HeadingLevel.HEADING_1
        : element.level === 2
        ? HeadingLevel.HEADING_2
        : element.level === 3
        ? HeadingLevel.HEADING_3
        : element.level === 4
        ? HeadingLevel.HEADING_4
        : element.level === 5
        ? HeadingLevel.HEADING_5
        : HeadingLevel.HEADING_6;

      return new Paragraph({
        heading: headingLevel,
        children,
        spacing: {
          before: pixelsToTwips(spacingBefore),
          after: pixelsToTwips(spacingAfter),
        },
      });
    }

    case "list-item": {
      const level = element.listLevel || 0;

      return new Paragraph({
        numbering: {
          reference: element.listType === "bullet" ? "bullets" : "numbering",
          level: level,
          instance: element.listType === "numbered"
            ? numberingInstance
            : bulletInstance,
        },
        spacing: {
          before: pixelsToTwips(spacingBefore),
          after: pixelsToTwips(spacingAfter),
        },
        children,
      });
    }

    case "horizontal-rule":
      return new Paragraph({
        text: "",
        thematicBreak: true,
        spacing: {
          before: pixelsToTwips(spacingBefore),
          after: pixelsToTwips(spacingAfter),
          line: 0,
        },
      });

    case "blockquote":
      return new Paragraph({
        children,
        indent: {
          left: pixelsToTwips(merged.blockquote.leftIndent),
        },
        border: {
          left: {
            style: BorderStyle.SINGLE,
            size: merged.blockquote.leftBorderWidth * 2,
            color: typeof merged.blockquote.leftBorderColor === "string"
              ? merged.blockquote.leftBorderColor
              : "#000000",
          },
        },
        spacing: {
          before: pixelsToTwips(spacingBefore),
          after: pixelsToTwips(spacingAfter),
        },
      });

    case "table":
      return buildWordTable(
        element,
        merged,
        wordConfig,
        spacingBefore,
        spacingAfter,
      );

    case "image": {
      if (!element.imageData) {
        return new Paragraph({ children: [] });
      }

      try {
        const imageRun = createImageRun(
          element,
          merged,
          wordConfig,
        );
        return new Paragraph({
          children: [imageRun],
          spacing: {
            before: pixelsToTwips(spacingBefore),
            after: pixelsToTwips(spacingAfter),
          },
        });
      } catch (error) {
        console.error("Failed to create image:", error);
        return new Paragraph({
          children: [
            new TextRun({ text: `[Image: ${element.imageAlt || ""}]` }),
          ],
          spacing: {
            before: pixelsToTwips(spacingBefore),
            after: pixelsToTwips(spacingAfter),
          },
        });
      }
    }

    case "paragraph":
    default:
      return new Paragraph({
        children,
        spacing: {
          before: pixelsToTwips(spacingBefore),
          after: pixelsToTwips(spacingAfter),
        },
      });
  }
}

function createImageRun(
  element: DocElement,
  merged: MergedMarkdownStyle,
  wordConfig: WordSpecificConfig,
): ImageRun {
  const matches = element.imageData!.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid image data URL format");
  }

  const [, imageType, base64Data] = matches;

  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  let normalizedType = imageType.toLowerCase();
  if (normalizedType === "jpeg") {
    normalizedType = "jpg";
  }

  if (!["png", "jpg", "gif", "bmp"].includes(normalizedType)) {
    throw new Error(`Unsupported image type: ${imageType}`);
  }

  let widthPixels: number;
  let heightPixels: number;

  if (element.imageWidth && element.imageHeight) {
    const maxWidthInches = wordConfig.image?.maxWidthInches ??
      DEFAULT_WORD_SPECIFIC_CONFIG.image!.maxWidthInches!;
    const maxWidthPixels = maxWidthInches * 96;

    const scale = Math.min(1, maxWidthPixels / element.imageWidth);
    widthPixels = element.imageWidth * scale;
    heightPixels = element.imageHeight * scale;
  } else {
    const maxWidthInches = wordConfig.image?.maxWidthInches ??
      DEFAULT_WORD_SPECIFIC_CONFIG.image!.maxWidthInches!;
    widthPixels = maxWidthInches * 96;
    heightPixels = widthPixels / merged.image.defaultAspectRatio;
  }

  return new ImageRun({
    type: normalizedType as "png" | "jpg" | "gif" | "bmp",
    data: bytes,
    transformation: {
      width: widthPixels,
      height: heightPixels,
    },
  });
}

function buildInlineContent(
  content: InlineContent[],
  merged: MergedMarkdownStyle,
): (TextRun | ExternalHyperlink)[] {
  const result: (TextRun | ExternalHyperlink)[] = [];
  const linkColor = getLinkColorFromMerged(merged);

  for (const item of content) {
    switch (item.type) {
      case "text": {
        const emailParts = parseEmailsInText(item.text);
        for (const part of emailParts) {
          if (part.type === "email" && part.url) {
            result.push(
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: part.text,
                    color: linkColor,
                    underline: {},
                  }),
                ],
                link: part.url,
              }),
            );
          } else {
            result.push(
              new TextRun({
                text: part.text,
              }),
            );
          }
        }
        break;
      }

      case "bold":
        result.push(
          new TextRun({
            text: item.text,
            bold: true,
          }),
        );
        break;

      case "italic":
        result.push(
          new TextRun({
            text: item.text,
            italics: true,
          }),
        );
        break;

      case "link":
        result.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: item.text,
                color: linkColor,
                underline: {},
              }),
            ],
            link: item.url || "",
          }),
        );
        break;

      case "email":
        result.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: item.text,
                color: linkColor,
                underline: {},
              }),
            ],
            link: item.url || `mailto:${item.text}`,
          }),
        );
        break;

      case "break":
        result.push(
          new TextRun({
            text: "",
            break: 1,
          }),
        );
        break;
    }
  }

  return result;
}

function buildWordTable(
  element: DocElement,
  merged: MergedMarkdownStyle,
  wordConfig: WordSpecificConfig,
  spacingBefore: number,
  spacingAfter: number,
): Table {
  const rows: TableRow[] = [];

  const cellMargins = {
    top: pixelsToTwips(merged.table.cellPaddingVertical),
    bottom: pixelsToTwips(merged.table.cellPaddingVertical),
    left: pixelsToTwips(merged.table.cellPaddingHorizontal),
    right: pixelsToTwips(merged.table.cellPaddingHorizontal),
  };

  const borderSize = merged.table.borderWidth * 8;
  const borderColor = merged.table.borderColor;

  const tableSpaceBefore = wordConfig.table?.spaceBefore ??
    DEFAULT_WORD_SPECIFIC_CONFIG.table!.spaceBefore!;
  const tableSpaceAfter = wordConfig.table?.spaceAfter ??
    DEFAULT_WORD_SPECIFIC_CONFIG.table!.spaceAfter!;

  if (element.tableHeader && element.tableHeader.length > 0) {
    for (const headerRow of element.tableHeader) {
      const cells = headerRow.map((cellContent) =>
        new TableCell({
          children: [
            new Paragraph({
              children: buildInlineContent(cellContent, merged),
              spacing: {
                before: 0,
                after: 0,
              },
            }),
          ],
          shading: {
            type: ShadingType.CLEAR,
            fill: merged.table.headerShadingColor.replace("#", ""),
            color: "auto",
          },
          margins: cellMargins,
        })
      );
      rows.push(new TableRow({ children: cells }));
    }
  }

  if (element.tableRows && element.tableRows.length > 0) {
    for (const bodyRow of element.tableRows) {
      const cells = bodyRow.map((cellContent) =>
        new TableCell({
          children: [
            new Paragraph({
              children: buildInlineContent(cellContent, merged),
              spacing: {
                before: 0,
                after: 0,
              },
            }),
          ],
          margins: cellMargins,
        })
      );
      rows.push(new TableRow({ children: cells }));
    }
  }

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    margins: {
      top: tableSpaceBefore + pixelsToTwips(spacingBefore),
      bottom: tableSpaceAfter + pixelsToTwips(spacingAfter),
    },
    borders: {
      top: {
        style: BorderStyle.SINGLE,
        size: borderSize,
        color: borderColor,
      },
      bottom: {
        style: BorderStyle.SINGLE,
        size: borderSize,
        color: borderColor,
      },
      left: {
        style: BorderStyle.SINGLE,
        size: borderSize,
        color: borderColor,
      },
      right: {
        style: BorderStyle.SINGLE,
        size: borderSize,
        color: borderColor,
      },
      insideHorizontal: {
        style: BorderStyle.SINGLE,
        size: borderSize,
        color: borderColor,
      },
      insideVertical: {
        style: BorderStyle.SINGLE,
        size: borderSize,
        color: borderColor,
      },
    },
  });
}

// export async function saveWordDocument(
//   doc: Document,
//   outputPath: string
// ): Promise<void> {
//   const buffer = await Packer.toBuffer(doc);
//   await Deno.writeFile(outputPath, buffer);
// }
