import { Button } from "panther";
import { For, Show, createSignal } from "solid-js";
import { projectStore, type UploadedFile } from "~/stores/project";
import { t } from "~/translate/mod";

export function FileUploadPanel() {
  const [isUploading, setIsUploading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  let fileInputRef: HTMLInputElement | undefined;

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError(t("Only PDF files are supported"));
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError(t("File size must be less than 500MB"));
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      const uploadedFile: UploadedFile = {
        file_id: data.id,
        filename: file.name,
        uploadedAt: new Date(),
        size_bytes: file.size,
      };

      projectStore.addUploadedFile(uploadedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef) {
        fileInputRef.value = "";
      }
    }
  }

  async function handleDelete(fileId: string) {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }

      projectStore.removeUploadedFile(fileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div class="h-full flex flex-col">
      <div class="border-b border-base-300 ui-pad bg-base-100 flex-none flex items-center justify-between ui-gap">
        <h3 class="text-sm text-neutral italic">
          {t("Upload PDFs to include in AI analysis")}
        </h3>
        <Button
          onClick={() => fileInputRef?.click()}
          outline
          iconName="upload"
          loading={isUploading()}
        >
          {t("Upload PDF")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          class="hidden"
          onChange={handleFileSelect}
        />
      </div>
      <div class="flex-1 ui-pad h-0 overflow-auto">
        <Show when={error()}>
          <div class="text-error text-sm ui-spb-sm">{error()}</div>
        </Show>
        <Show
          when={projectStore.uploadedFiles.length > 0}
          fallback={
            <div class="text-sm text-neutral italic">
              {t("No documents uploaded")}
            </div>
          }
        >
          <div class="ui-spy-sm">
            <For each={projectStore.uploadedFiles}>
              {(file) => (
                <div class="flex items-center justify-between bg-base-200 rounded ui-gap ui-pad-sm">
                  <div class="flex items-center ui-gap-sm flex-1 w-0">
                    <div class="truncate text-sm">{file.filename}</div>
                    <div class="text-neutral text-xs flex-none">
                      ({formatFileSize(file.size_bytes)})
                    </div>
                  </div>
                  <div class="flex-none">
                    <Button
                      onClick={() => handleDelete(file.file_id)}
                      outline
                      intent="danger"
                      iconName="trash"
                    />
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
