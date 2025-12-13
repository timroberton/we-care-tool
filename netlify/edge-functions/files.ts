import type { Context } from "@netlify/edge-functions";

const ANTHROPIC_FILES_URL = "https://api.anthropic.com/v1/files";
const BETA_HEADER = "files-api-2025-04-14";

export default async (req: Request, context: Context) => {
  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // pathParts: ["api", "files"] or ["api", "files", "file_id"]
  const fileId = pathParts.length > 2 ? pathParts[2] : null;

  try {
    // POST /api/files - Upload a file
    if (req.method === "POST" && !fileId) {
      const formData = await req.formData();

      const response = await fetch(ANTHROPIC_FILES_URL, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": BETA_HEADER,
        },
        body: formData,
      });

      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/files - List all files
    if (req.method === "GET" && !fileId) {
      const response = await fetch(ANTHROPIC_FILES_URL, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": BETA_HEADER,
        },
      });

      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/files/:id - Get file metadata
    if (req.method === "GET" && fileId) {
      const response = await fetch(`${ANTHROPIC_FILES_URL}/${fileId}`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": BETA_HEADER,
        },
      });

      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // DELETE /api/files/:id - Delete a file
    if (req.method === "DELETE" && fileId) {
      const response = await fetch(`${ANTHROPIC_FILES_URL}/${fileId}`, {
        method: "DELETE",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": BETA_HEADER,
        },
      });

      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: ["/api/files", "/api/files/*"],
};
