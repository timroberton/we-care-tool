import { For, Show } from "solid-js";
import type { HSBuildingBlock } from "~/config/param_fields";
import { capitalizeFirstLetter } from "panther";
import { t } from "~/translate/mod";

type Props = {
  hsBuildingBlocks: HSBuildingBlock[];
};

export function BuildingBlocks(p: Props) {
  return (
    <Show when={p.hsBuildingBlocks.length > 0}>
      <div class="flex flex-wrap ui-gap-sm items-center">
        <div class="font-700 text-xs italic">
          {t("Health system building blocks:")}
        </div>
        <For each={p.hsBuildingBlocks}>
          {(bb) => {
            return (
              <div class="text-xs py-0.5 px-1.5 rounded bg-primary text-white">
                {capitalizeFirstLetter(bb)}
              </div>
            );
          }}
        </For>
      </div>
    </Show>
  );
}
