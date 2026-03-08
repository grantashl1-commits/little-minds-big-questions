import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin role from auth header
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleData) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Step 1: Generate question + story via AI
    const systemPrompt = `You are a gentle children's storytelling assistant for "Little Minds Big Questions".
Generate a thought-provoking question that children ages 4-8 commonly ask, along with a warm, metaphor-based story answer.

Pick from themes like: death & loss, meaning & purpose, fairness, love, identity, time, nature, feelings.

Return JSON with these fields:
- question: The child's question (natural, curious tone)
- story_title: A poetic title for the story (3-6 words)
- story: A warm metaphor-based story answer (3-5 paragraphs, age-appropriate, nature imagery)
- image_prompt: A detailed prompt for a soft pastel watercolour children's book illustration`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate a new Question of the Week. Make it different from common ones about death — try themes like time, identity, love, fairness, or the universe." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_weekly_question",
              description: "Generate a weekly featured question with story",
              parameters: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  story_title: { type: "string" },
                  story: { type: "string" },
                  image_prompt: { type: "string" },
                },
                required: ["question", "story_title", "story", "image_prompt"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_weekly_question" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    // Step 2: Generate illustration
    let image_url: string | null = null;
    try {
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Create a soft pastel watercolour children's book illustration in a circular vignette style on a clean white background. Dreamy, gentle, whimsical with soft edges. ${result.image_prompt}`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (generatedImage) {
          const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, "");
          const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const filename = `weekly-${Date.now()}.png`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("metaphor-images")
            .upload(filename, imageBytes, { contentType: "image/png" });

          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage
              .from("metaphor-images")
              .getPublicUrl(uploadData.path);
            image_url = urlData.publicUrl;
          }
        }
      }
    } catch (imgErr) {
      console.error("Image generation error (non-fatal):", imgErr);
    }

    // Step 3: Calculate week_start (Monday of current week)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // Step 4: Insert into weekly_questions
    const { data: wq, error: insertError } = await supabase
      .from("weekly_questions")
      .insert({
        question: result.question,
        story: result.story,
        story_title: result.story_title,
        image_url,
        week_start: weekStartStr,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify(wq), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-weekly-question error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
