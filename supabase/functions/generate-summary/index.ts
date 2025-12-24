import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText, summaryType, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const summaryStyles = {
      concise: "Create a brief, exam-focused summary highlighting only the most critical points",
      detailed: "Create a comprehensive summary that covers all important concepts with examples",
      bullet: "Create a bullet-point summary organized by topic with key terms highlighted",
      outline: "Create a hierarchical outline format with main topics and subtopics"
    };

    const systemPrompt = `You are an expert academic summarizer for ${userProfile?.program || 'university'} students.

${summaryStyles[summaryType as keyof typeof summaryStyles] || summaryStyles.concise}

Requirements:
- Focus on exam-relevant content
- Highlight key terms and definitions
- Include important formulas, mechanisms, or processes
- Organize logically by topic
- Use clear headings and formatting
- Keep the summary focused and actionable for studying`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please summarize the following content:\n\n${documentText}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Summary generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate summary";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
