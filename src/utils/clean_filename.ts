export function cleanFilename(name: string, maxLength: number = 100): string {
  if (!name || name.trim().length === 0) {
    return "untitled";
  }

  let cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (cleaned.length === 0) {
    return "untitled";
  }

  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).replace(/-+$/, "");
  }

  return cleaned;
}
