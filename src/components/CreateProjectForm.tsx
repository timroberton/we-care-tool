import {
  AlertComponentProps,
  Button,
  Input,
  timQuery,
  StateHolderWrapper,
  RadioGroup,
  getSelectOptionsFromIdLabel,
  Select,
} from "panther";
import { createSignal, Show } from "solid-js";
import { loadDataManifest, type DataManifest } from "~/utils/data_manifest";
import { t } from "~/translate/mod";
import { FormModal } from "./FormModal";

type CreateProjectResult = {
  name: string;
  country: string;
  dataSourceId?: string;
};

export function CreateProjectForm(
  p: AlertComponentProps<{}, CreateProjectResult>
) {
  const [projectName, setProjectName] = createSignal<string>("");
  const [customCountry, setCustomCountry] = createSignal<string>("");
  const [selectedDataSource, setSelectedDataSource] = createSignal<string>("");
  const [isSaving, setIsSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const manifestQuery = timQuery<DataManifest>(
    () => loadDataManifest(),
    t("Loading data sources...")
  );

  async function handleSave() {
    setError(null);
    setIsSaving(true);

    const resManifest = manifestQuery.state();
    if (resManifest.status !== "ready") {
      setError(t("Data manifest not yet loaded"));
      setIsSaving(false);
      return;
    }

    const goodName = projectName().trim();
    if (!goodName) {
      setError(t("You must enter a project name"));
      setIsSaving(false);
      return;
    }

    if (selectedDataSource() === "") {
      setError(t("You must select a data source"));
      setIsSaving(false);
      return;
    }

    const selectedSource = resManifest.data.dataSources.find(
      (ds) => ds.id === selectedDataSource()
    );
    if (!selectedSource) {
      setError(t("Selected data source not found"));
      setIsSaving(false);
      return;
    }

    const country = selectedSource.country || customCountry().trim();
    if (!country) {
      setError(t("You must enter a country name"));
      setIsSaving(false);
      return;
    }

    p.close({
      name: goodName,
      country,
      dataSourceId: selectedDataSource(),
    });
  }

  return (
    <FormModal
      title={t("Create new project")}
      width="md"
      actions={
        <>
          <Button
            onClick={handleSave}
            intent="primary"
            loading={isSaving()}
            iconName="sparkles"
          >
            {t("Create")}
          </Button>
          <Button onClick={() => p.close(undefined)} outline>
            {t("Cancel")}
          </Button>
        </>
      }
    >
      <Input
        label={t("Project name")}
        value={projectName()}
        onChange={setProjectName}
        fullWidth
        autoFocus
      />
      <StateHolderWrapper state={manifestQuery.state()} noPad>
        {(manifest) => {
          const selectedSource = () =>
            manifest.dataSources.find((ds) => ds.id === selectedDataSource());
          const needsCustomCountry = () => {
            const source = selectedSource();
            return source && !source.country;
          };

          return (
            <>
              <Select
                label={t("Initial data source")}
                options={getSelectOptionsFromIdLabel(manifest.dataSources)}
                value={selectedDataSource()}
                onChange={setSelectedDataSource}
                fullWidth
              />

              <Show when={needsCustomCountry()}>
                <Input
                  label={t("Country name")}
                  value={customCountry()}
                  onChange={setCustomCountry}
                  fullWidth
                  placeholder={t("Enter country name...")}
                />
              </Show>

              <Show when={selectedSource()?.country}>
                <div class="text-sm text-secondary">
                  {t("Country:")}{" "}
                  <span class="font-600">{selectedSource()?.country}</span>
                </div>
              </Show>
            </>
          );
        }}
      </StateHolderWrapper>

      <Show when={error()}>
        <div class="text-danger text-sm">{error()}</div>
      </Show>
    </FormModal>
  );
}
