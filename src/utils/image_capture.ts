import type { AvailableImage } from "~/types/reports";
import type { ChartOVInputs, SimpleVizInputs } from "panther";
import { getFigureAsBase64 } from "panther";

export function renderFigureToBase64(
  figureInputs: ChartOVInputs | SimpleVizInputs,
  width = 1200,
  scale = 2,
  smallerScaling = false
): string {
  const inputsWithPadding = {
    ...figureInputs,
    style: {
      ...figureInputs.style,
      surrounds: {
        ...figureInputs.style?.surrounds,
        padding: 40,
      },
    },
  };
  return getFigureAsBase64(
    inputsWithPadding,
    width,
    scale,
    smallerScaling ? 1 : 1.5
  );
}

export async function captureAvailableCharts(
  chartConfigs: Array<{
    id: string;
    description: string;
    inputs: ChartOVInputs | SimpleVizInputs;
  }>
): Promise<AvailableImage[]> {
  const images: AvailableImage[] = [];

  for (const config of chartConfigs) {
    try {
      const data = renderFigureToBase64(config.inputs);
      images.push({
        id: config.id,
        description: config.description,
        data,
      });
    } catch (error) {
      console.error(`Failed to render chart ${config.id}:`, error);
    }
  }

  return images;
}
