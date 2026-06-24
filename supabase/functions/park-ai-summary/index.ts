const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  
  type ParkSummaryRequest = {
    parkName?: string;
  };
  
  type ParkSummaryResponse = {
    parkName: string;
    summary: string;
    bestTimeToVisit: string;
  };
  
  function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
  
  function cleanText(value: string) {
    return value
      .replace(/```[\s\S]*?```/g, "")
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
  
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }
  
    try {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
  
      if (!apiKey) {
        return jsonResponse(
          { error: "Missing OPENAI_API_KEY secret in Supabase" },
          500
        );
      }
  
      const body = (await req.json()) as ParkSummaryRequest;
      const parkName = body.parkName?.trim();
  
      if (!parkName) {
        return jsonResponse({ error: "parkName is required" }, 400);
      }
  
      const prompt = `
  You are writing for a mobile app user.
  
  Return only valid JSON with these keys:
  - summary
  - bestTimeToVisit
  
  Rules:
  - Do not use markdown.
  - Do not use bullets.
  - Do not use headings.
  - Keep it concise and friendly.
  - summary should explain what the park is known for.
  - bestTimeToVisit should mention the best season or months and briefly explain why.
  
  Park name: ${parkName}
  `.trim();
  
      const openAiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            temperature: 0.4,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You generate concise park summaries and best-time-to-visit guidance.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );
  
      if (!openAiResponse.ok) {
        const errorText = await openAiResponse.text();
        return jsonResponse(
          {
            error: "OpenAI request failed",
            details: errorText,
          },
          500
        );
      }
  
      const data = await openAiResponse.json();
      const content = data?.choices?.[0]?.message?.content ?? "{}";
  
      let parsed: Partial<ParkSummaryResponse>;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = {
          summary: content,
          bestTimeToVisit: "",
        };
      }
  
      const response: ParkSummaryResponse = {
        parkName,
        summary: cleanText(String(parsed.summary ?? "")),
        bestTimeToVisit: cleanText(String(parsed.bestTimeToVisit ?? "")),
      };
  
      return jsonResponse(response);
    } catch (error) {
      return jsonResponse(
        {
          error: "Unexpected error",
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  });