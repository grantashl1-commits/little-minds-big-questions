import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { child_name, child_age, question_text, context, parent_note } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a gentle children's storytelling assistant.
Your task is to respond to difficult questions asked by children using comforting metaphors and simple stories.

Rules:
- Use nature imagery when possible (animals, seasons, stars, oceans, butterflies, seeds, gardens)
- Match language complexity to the child's age
- Avoid frightening or graphic wording
- Keep tone warm, poetic, and comforting
- Parent explanation should translate the metaphor simply
- Themes should be from: death-dying, grief-loss, feelings, friendship, identity, family-change, school-confidence, kindness, bodies, spirituality, worry-anxiety, babies-birth

Return a JSON object with these exact fields:
- metaphor_title: A short poetic title for the story
- metaphor_answer: The full child-friendly metaphor story (3-5 paragraphs)
- parent_explanation: A short explanation for parents (2-3 sentences)
- themes: An array of 1-3 theme slugs from the list above
- image_prompt: A detailed prompt for generating a soft pastel watercolour children's book illustration based on the central metaphor symbol`;

    const userPrompt = `Child's name: ${child_name}
Child's age: ${child_age}
Question: ${question_text}
${context ? `Context: ${context}` : ""}
${parent_note ? `Parent note: ${parent_note}` : ""}`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_story_answer",
              description: "Generate a metaphor-based story answer for a child's question",
              parameters: {
                type: "object",
                properties: {
                  metaphor_title: { type: "string" },
                  metaphor_answer: { type: "string" },
                  parent_explanation: { type: "string" },
                  themes: { type: "array", items: { type: "string" } },
                  image_prompt: { type: "string" },
                },
                required: ["metaphor_title", "metaphor_answer", "parent_explanation", "themes", "image_prompt"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_story_answer" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-answer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
