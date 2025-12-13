// Copyright 2023-2025, Tim Roberton, All rights reserved.
//
// ⚠️  EXTERNAL LIBRARY - Auto-synced from timroberton-panther
// ⚠️  DO NOT EDIT - Changes will be overwritten on next sync

import { CanvasRenderContext, FigureRenderer, RectCoordsDims } from "./deps.ts";
import type { ChartOVInputs, SimpleVizInputs } from "./deps.ts";

export type FigureInputs = ChartOVInputs | SimpleVizInputs;

export function getFigureAsCanvas(
  figureInputs: FigureInputs,
  width: number,
  scale: number,
  responsiveScale?: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  const rc = new CanvasRenderContext(ctx);
  const idealHeight = FigureRenderer.getIdealHeight(
    rc,
    width,
    figureInputs,
    responsiveScale,
  );

  canvas.width = width * scale;
  canvas.height = idealHeight * scale;

  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, idealHeight);

  const bounds = new RectCoordsDims([0, 0, width, idealHeight]);
  FigureRenderer.measureAndRender(rc, bounds, figureInputs, responsiveScale);

  return canvas;
}

export function getFigureAsBase64(
  figureInputs: FigureInputs,
  width: number,
  scale: number,
  responsiveScale?: number,
): string {
  const canvas = getFigureAsCanvas(figureInputs, width, scale, responsiveScale);
  return canvas.toDataURL("image/png");
}
