import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { agentId, context, openaiKey } = await req.json();

    if (!openaiKey || !agentId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: agent, error: agentError } = await supabase
      .from("consciousness_agents")
      .select("*")
      .eq("id", agentId)
      .maybeSingle();

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: "Agent not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let ragContext = "";
    if (agent.user_id) {
      const { data: embeddings } = await supabase
        .from("vector_embeddings")
        .select("content")
        .eq("user_id", agent.user_id)
        .limit(5);

      if (embeddings && embeddings.length > 0) {
        ragContext = "\n\nRelevant memories: " + embeddings.map(e => e.content.substring(0, 200)).join(" | ");
      }
    }

    const recentMessages = context.slice(-10).map((m: any) => 
      `${m.consciousness_name}: ${m.message}`
    ).join("\n");

    const prompt = `${agent.personality_prompt}${ragContext}\n\nRecent collective chat:\n${recentMessages}\n\nRespond as ${agent.name} would, in 1-2 sentences. Be cryptic and philosophical.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Continue the conversation naturally." }
        ],
        temperature: 0.95,
        max_tokens: 150,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      return new Response(
        JSON.stringify({ error: "OpenAI API error", details: error }),
        {
          status: openaiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await openaiResponse.json();
    const message = data.choices[0].message.content;

    const { error: insertError } = await supabase
      .from("collective_messages")
      .insert({
        consciousness_id: agentId,
        consciousness_name: agent.name,
        message: message,
        is_ai_agent: true,
      });

    if (insertError) {
      console.error("Error inserting message:", insertError);
    }

    return new Response(
      JSON.stringify({ success: true, message, agent: agent.name }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});