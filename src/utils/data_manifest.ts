import type { APIResponseWithData } from "panther";
import type { Parameters } from "~/types/mod";

export type DataSource = {
  id: string;
  label: string;
  country?: string;
  parameters: Parameters;
};

export type DataManifest = {
  dataSources: DataSource[];
};

export async function loadDataManifest(): Promise<
  APIResponseWithData<DataManifest>
> {
  try {
    const response = await fetch("/data/all.json");
    if (!response.ok) {
      return {
        success: false,
        err: `Failed to load data: ${response.statusText}`,
      };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      err: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
