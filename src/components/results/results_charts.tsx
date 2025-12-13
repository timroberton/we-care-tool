import { trackDeep } from "@solid-primitives/deep";
import { Button, ChartHolder, downloadBase64Image } from "panther";
import { createMemo } from "solid-js";
import type { Results } from "~/types/mod";
import { cleanFilename } from "~/utils/clean_filename";
import { renderFigureToBase64 } from "~/utils/image_capture";
import { getChart1, getChart2, getChart3 } from "./_chart_inputs";
import { language } from "~/translate/mod";

type Props = {
  results: Results;
};

export function ResultsCharts(p: Props) {
  const chart1 = createMemo(() => {
    trackDeep(p.results);
    language(); // Track language changes
    return getChart1(p.results);
  });

  const chart2 = createMemo(() => {
    trackDeep(p.results);
    language(); // Track language changes
    return getChart2(p.results);
  });

  const chart3 = createMemo(() => {
    trackDeep(p.results);
    language(); // Track language changes
    return getChart3(p.results);
  });

  const handleDownloadChart1 = () => {
    const filename = cleanFilename("Safe less safe least safe abortions");
    downloadBase64Image(
      renderFigureToBase64(chart1(), 1200, 2, true),
      `${filename}.png`
    );
  };

  const handleDownloadChart2 = () => {
    const filename = cleanFilename("Proportion of abortions that are safe");
    downloadBase64Image(
      renderFigureToBase64(chart2(), 1200, 2, true),
      `${filename}.png`
    );
  };

  const handleDownloadChart3 = () => {
    const filename = cleanFilename("Proportion receiving post-abortion care");
    downloadBase64Image(
      renderFigureToBase64(chart3(), 1200, 2, true),
      `${filename}.png`
    );
  };

  return (
    <div class="w-full h-full ui-pad ui-spy overflow-y-scroll">
      <div class="ui-spy-sm ui-pad border rounded border-base-300 relative">
        {/* <div class="font-700 text-lg">
          Safe, less safe, and least safe abortions
        </div> */}
        <ChartHolder chartInputs={chart1()} height={400} />
        <div class="absolute right-4 top-4">
          <Button
            iconName="download"
            outline
            onClick={handleDownloadChart1}
          ></Button>
        </div>
      </div>

      <div class="ui-spy-sm ui-pad border rounded border-base-300 relative">
        {/* <div class="font-700 text-lg">
          Proportion of abortions that are safe
        </div> */}
        <ChartHolder chartInputs={chart2()} height={400} />
        <div class="absolute right-4 top-4">
          <Button
            iconName="download"
            outline
            onClick={handleDownloadChart2}
          ></Button>
        </div>
      </div>

      <div class="ui-spy-sm ui-pad border rounded border-base-300 relative">
        {/* <div class="font-700 text-lg">
          Proportion of women with abortion complications who receive effective
          care
        </div> */}
        <ChartHolder chartInputs={chart3()} height={400} />
        <div class="absolute right-4 top-4">
          <Button
            iconName="download"
            outline
            onClick={handleDownloadChart3}
          ></Button>
        </div>
      </div>

      <div class="p-6"></div>
    </div>
  );
}
