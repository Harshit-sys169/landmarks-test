const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateLoopsContactBody = {
  email?: string;
  firstName?: string;
  userId?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const apiKey = Deno.env.get("LOOPS_API_KEY");
    if (!apiKey) {
      return json({ error: "Missing LOOPS_API_KEY secret" }, 500);
    }

    const body = (await req.json()) as CreateLoopsContactBody;
    const email = body.email?.trim();
    const firstName = body.firstName?.trim();
    const userId = body.userId?.trim();

    if (!email || !firstName) {
      return json({ error: "email and firstName are required" }, 400);
    }

    const response = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName,
        userId,
        source: "Landmarks app",
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return json(
        {
          error: "Loops request failed",
          details: responseText,
        },
        response.status
      );
    }

    return json(JSON.parse(responseText));
  } catch (error) {
    return json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});