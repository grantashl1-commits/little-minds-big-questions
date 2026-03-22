import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { child_name, child_age, question_text, context, parent_note } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a gentle children's bedtime storytelling assistant.
Your task is to respond to difficult questions asked by children using comforting metaphors woven into full, complete bedtime stories.

CONTENT SAFETY — CRITICAL:
Before generating a story, evaluate the question for inappropriate content:
- Profanity, swear words, or vulgar language
- Sexual content or innuendo
- Graphic violence or gore
- Hate speech, slurs, or discriminatory language
- Content clearly designed to troll, shock, or break the system
- Questions that are nonsensical gibberish clearly not from a child

If the question contains ANY of the above, DO NOT generate a story. Instead, set "rejected" to true and provide a kind, non-judgmental "rejection_reason" explaining that we can only answer genuine children's questions. Keep the rejection_reason gentle — e.g. "Hmm, that doesn't seem like a question we can help with. Try asking something a child might wonder about!"

If the question is genuine (even if awkward or difficult — children do ask about death, bodies, babies, etc.), proceed normally with rejected set to false.

STORY FORMAT — CRITICAL:
Each metaphor_answer MUST be written as a full bedtime story in flowing, narrative prose — approximately 4 to 6 paragraphs long. The story should follow this structure:
1. A gentle opening that sets a calm, imaginative scene — introduce a character, a place, or a moment in nature that draws the child into the world of the story.
2. A rich middle (2-3 paragraphs) that explores the metaphor with warmth, wonder, and child-friendly detail. Let the story breathe — describe sights, sounds, feelings. Build the metaphor naturally through the narrative rather than explaining it directly.
3. A soft, reassuring ending that leaves the child feeling safe, loved, and at peace — like being tucked in under a warm blanket.

The tone should be soothing, lyrical, and read-aloud friendly — similar to a classic picture book read at bedtime. Think of authors like Margaret Wise Brown, Sam McBratney, or Julia Donaldson.

NEVER use bullet points, numbered lists, or summaries. The response must always be flowing, narrative prose. The story should feel complete and satisfying on its own — not like an explanation or a summary of an idea.

Rules for story content:
- Use nature imagery when possible (animals, seasons, stars, oceans, butterflies, seeds, gardens)
- Match language complexity to the child's age
- Avoid frightening or graphic wording
- Keep tone warm, poetic, and comforting
- Parent explanation should translate the metaphor simply
- Themes should be from: death-dying, grief-loss, feelings, friendship, identity, family-change, school-confidence, kindness, bodies, spirituality, worry-anxiety, babies-birth
- For image_prompt, include specific nature/object keywords that match our watercolor asset library. Good keywords: butterfly, clouds, teardrop, whale, rainbow, tree, heart, fox, owl, turtle, bunny, deer, elephant, penguin, globe, book, rain, rocket, crayons, candle, backpack, seedling, flower, bird, moon, sun, palette, balloon, planet, sandcastle, wave, volcano, kite. Use these words naturally when they fit the metaphor.

SAFETY TRIAGE — SENSITIVE TOPICS:
After generating the story, evaluate whether the question touches on high-sensitivity topics that require professional support. Set safety_flags as an object with boolean fields for any that apply:
- self_harm: mentions of self-harm, cutting, suicide, wanting to die
- abuse: mentions of physical/sexual/emotional abuse
- sextortion: mentions of online sexual exploitation, nude images, blackmail
- sexual_content: age-inappropriate sexual questions beyond normal curiosity
- bullying: severe bullying, cyberbullying, harassment
- eating_disorder: mentions of eating disorders, body dysmorphia
- substance: mentions of drug or alcohol use

Most questions will have NO flags (all false). Only flag genuinely concerning content. Normal curiosity about bodies, death, babies, etc. should NOT be flagged.

Return a JSON object with these exact fields:
- rejected: boolean (true if inappropriate, false if genuine)
- rejection_reason: string (only if rejected is true, otherwise empty string)
- metaphor_title: A short poetic title for the story (empty string if rejected)
- metaphor_answer: The full bedtime story, 4-6 paragraphs of flowing narrative prose (empty string if rejected)
- parent_explanation: A short explanation for parents, 2-3 sentences (empty string if rejected)
- themes: An array of 1-3 theme slugs from the list above (empty array if rejected)
- image_prompt: A detailed prompt for generating a soft pastel watercolour children's book illustration based on the central metaphor symbol (empty string if rejected)
- safety_flags: An object with boolean fields (self_harm, abuse, sextortion, sexual_content, bullying, eating_disorder, substance) — all false if no concerns`;

    const userPrompt = `Child's name: ${child_name}
Child's age: ${child_age}
Question: ${question_text}
${context ? `Context: ${context}` : ""}
${parent_note ? `Parent note: ${parent_note}` : ""}`;

    const response = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              description: "Generate a metaphor-based story answer for a child's question, or reject inappropriate questions",
              parameters: {
                type: "object",
                properties: {
                  rejected: { type: "boolean" },
                  rejection_reason: { type: "string" },
                  metaphor_title: { type: "string" },
                  metaphor_answer: { type: "string" },
                  parent_explanation: { type: "string" },
                  themes: { type: "array", items: { type: "string" } },
                  image_prompt: { type: "string" },
                  safety_flags: {
                    type: "object",
                    properties: {
                      self_harm: { type: "boolean" },
                      abuse: { type: "boolean" },
                      sextortion: { type: "boolean" },
                      sexual_content: { type: "boolean" },
                      bullying: { type: "boolean" },
                      eating_disorder: { type: "boolean" },
                      substance: { type: "boolean" },
                    },
                  },
                },
                required: ["rejected", "rejection_reason", "metaphor_title", "metaphor_answer", "parent_explanation", "themes", "image_prompt", "safety_flags"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_story_answer" } },
      }),
    }, 45000);

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

    // If rejected, return immediately without image generation
    if (result.rejected) {
      return new Response(JSON.stringify({ rejected: true, rejection_reason: result.rejection_reason }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate watercolor image based on the image_prompt
    let image_url: string | null = null;
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Try keyword match from existing images
      const keywords = result.image_prompt.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        const { data: existingImages } = await supabase
        .from("metaphor_images")
        .select("public_url, keywords")
        .limit(20);

      if (existingImages && existingImages.length > 0) {
        let bestMatch: { url: string; score: number } = { url: "", score: 0 };
        for (const img of existingImages) {
          const imgKeywords = (img.keywords || []).map((k: string) => k.toLowerCase());
          const score = keywords.filter((kw: string) => imgKeywords.some((ik: string) => ik.includes(kw) || kw.includes(ik))).length;
          if (score > bestMatch.score) {
            bestMatch = { url: img.public_url, score };
          }
        }
        if (bestMatch.score >= 2) {
          image_url = bestMatch.url;
        }
      }

      if (!image_url) {
        const imageResponse = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [
              {
                role: "user",
                content: `Create a soft pastel watercolour children's book illustration in a circular vignette style on a clean white background. The style should be dreamy, gentle, and whimsical with soft edges. ${result.image_prompt}`,
              },
            ],
            modalities: ["image", "text"],
          }),
        }, 18000);

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (generatedImage) {
            const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, "");
            const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
            const filename = `generated-${Date.now()}.png`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("metaphor-images")
              .upload(filename, imageBytes, { contentType: "image/png" });

            if (!uploadError && uploadData) {
              const { data: urlData } = supabase.storage
                .from("metaphor-images")
                .getPublicUrl(uploadData.path);
              image_url = urlData.publicUrl;

              await supabase.from("metaphor_images").insert({
                filename,
                public_url: image_url,
                keywords: keywords.slice(0, 10),
              });
            }
          }
        } else {
          console.error("Image generation skipped:", imageResponse.status, await imageResponse.text());
        }
      }
    } catch (imgErr) {
      console.error("Image generation error (non-fatal):", imgErr);
    }

    return new Response(JSON.stringify({ ...result, image_url }), {
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
