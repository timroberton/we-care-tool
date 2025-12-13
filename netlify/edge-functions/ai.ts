import type { Context } from "@netlify/edge-functions";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export default async (req: Request, context: Context) => {
  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { stream = false, conversationId, ...anthropicPayload } = body;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };

    const betaFeatures: string[] = [];

    if (stream || anthropicPayload.system?.some?.((block: any) => block.cache_control)) {
      betaFeatures.push("prompt-caching-2024-07-31");
    }

    // Check if any message contains document blocks (Files API)
    const hasDocuments = anthropicPayload.messages?.some((msg: any) => {
      if (Array.isArray(msg.content)) {
        return msg.content.some((block: any) => block.type === "document");
      }
      return false;
    });

    if (hasDocuments) {
      betaFeatures.push("files-api-2025-04-14");
    }

    if (betaFeatures.length > 0) {
      headers["anthropic-beta"] = betaFeatures.join(",");
    }

    const anthropicRequest = {
      ...anthropicPayload,
      stream,
    };

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(anthropicRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Detect HTML error pages (e.g., from Cloudflare) and return a clean message
      const isHtmlError = errorText.trim().startsWith("<!DOCTYPE") || errorText.trim().startsWith("<html");
      const cleanError = isHtmlError
        ? `Service temporarily unavailable (${response.status}). Please try again in a few moments.`
        : errorText;
      return new Response(
        JSON.stringify({
          error: `Anthropic API error: ${response.status} - ${cleanError}`,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config = {
  path: "/api/ai",
};
