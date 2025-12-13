import { AlertComponentProps, Button } from "panther";
import { t } from "~/translate/mod";
import { FormModal } from "./FormModal";

export function AIAssistantInfoModal(p: AlertComponentProps<{}, void>) {
  return (
    <FormModal
      title={t("AI Analysis Assistant")}
      width="md"
      actions={
        <Button onClick={() => p.close()} intent="primary">
          {t("Got it")}
        </Button>
      }
    >
      <p>
        {t(
          "Use this assistant to analyze your scenario results and modify parameters and manage scenarios."
        )}
      </p>

      <div>
        <h3 class="font-700">{t("What you can do")}</h3>
        <ul class="list-disc ml-6 ui-spx-sm">
          <li>{t("Analyze and compare scenario results")}</li>
          <li>{t("Add or delete scenarios")}</li>
          <li>{t("Modify scenario parameters")}</li>
          <li>{t("View specific results and metrics")}</li>
        </ul>
      </div>

      <div>
        <h3 class="font-700">{t("Reports")}</h3>
        <p>
          {t(
            'You can create and edit reports either with this assistant or using the "Create report" button on the Reports pane itself.'
          )}
        </p>
      </div>

      <div>
        <h3 class="font-700">{t("Documents")}</h3>
        <p>
          {t(
            "Upload PDF documents in the Documents tab to include them in AI analysis. The assistant can read and reference these documents when answering questions or generating reports. Documents are included automatically in the first message of each conversation."
          )}
        </p>
      </div>

      <div>
        <h3 class="font-700">{t("Example prompts")}</h3>
        <ul class="list-disc ml-6 ui-spx-sm">
          <li>{t('"Compare safety outcomes across all scenarios"')}</li>
          <li>{t("\"Add a scenario called 'Improved Access'\"")}</li>
          <li>
            {t(
              '"What are the key differences between the base case and scenario 1?"'
            )}
          </li>
          <li>{t('"Show me the data sources used for this analysis"')}</li>
          <li>
            {t('"What happens if we increase facility access to 80%?"')}
          </li>
          <li>{t('"Create a summary report for policymakers"')}</li>
          <li>{t('"Show me the flow diagram from baseline to outcomes"')}</li>
          <li>
            {t(
              '"How many safe abortions would result from improving family planning?"'
            )}
          </li>
          <li>
            {t(
              '"Based on the uploaded documents, what data sources are available for this country?"'
            )}
          </li>
          <li>
            {t(
              '"Review the uploaded National Strategy for Abortion Care and interpret our analysis findings with reference to the national targets"'
            )}
          </li>
        </ul>
      </div>
    </FormModal>
  );
}
