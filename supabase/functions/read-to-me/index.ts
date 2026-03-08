import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VOICE_MODES: Record<string, { voiceId: string; stability: number; speed: number }> = {
  bedtime: { voiceId: "pFZP5JQG7iQjIQuC4Bku", stability: 0.7, speed: 0.85 },
  daytime: { voiceId: "Xb7hH8MSUJpSbSDYk0k2", stability: 0.5, speed: 1.0 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is not configured");

    const { text, mode = "bedtime", questionId } = await req.json();
    if (!text) throw new Error("No text provided");

    // Check audio cache if questionId provided
    if (questionId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      const { data: cached } = await sb
        .from("audio_cache")
        .select("audio_url")
        .eq("question_id", questionId)
        .eq("voice_mode", mode)
        .maybeSingle();

      if (cached?.audio_url) {
        return new Response(JSON.stringify({ cachedUrl: cached.audio_url }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const voice = VOICE_MODES[mode] || VOICE_MODES.bedtime;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: voice.stability,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: voice.speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    // Cache the audio if questionId provided
    if (questionId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);

        const filePath = `tts/${questionId}_${mode}.mp3`;
        await sb.storage.from("audio-recordings").upload(filePath, audioBuffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });

        const { data: publicUrl } = sb.storage.from("audio-recordings").getPublicUrl(filePath);

        await sb.from("audio_cache").upsert({
          question_id: questionId,
          voice_mode: mode,
          audio_url: publicUrl.publicUrl,
        }, { onConflict: "question_id,voice_mode" });
      } catch (cacheErr) {
        console.error("Cache write failed (non-blocking):", cacheErr);
      }
    }

    return new Response(audioBuffer, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
    });
  } catch (e) {
    console.error("read-to-me error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
