import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

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

    // Fetch matching curriculum resources for this user's institution/program
    let curriculumContext = "";
    if (userProfile?.institution && userProfile?.program) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const sb = createClient(supabaseUrl, supabaseKey);

      const { data: resources } = await sb
        .from("curriculum_resources")
        .select("title, resource_type, content_text")
        .eq("institution", userProfile.institution)
        .eq("program", userProfile.program)
        .eq("is_active", true)
        .limit(5);

      if (resources && resources.length > 0) {
        const snippets = resources
          .filter((r: any) => r.content_text)
          .map((r: any) => `[${r.resource_type.toUpperCase()}: ${r.title}]\n${r.content_text!.slice(0, 3000)}`)
          .join("\n\n---\n\n");
        if (snippets) {
          curriculumContext = `\n\nIMPORTANT — Use the following official curriculum resources from ${userProfile.institution} (${userProfile.program}) to align the summary with the syllabus. Highlight topics that appear in the syllabus/past papers and flag exam-relevant areas:\n\n${snippets}`;
        }
      }
    }

    const summaryStyles: Record<string, string> = {
      concise: "Create a brief, exam-focused summary highlighting only the most critical points",
      detailed: "Create a comprehensive summary that covers all important concepts with examples",
      bullet: "Create a bullet-point summary organized by topic with key terms highlighted",
      outline: "Create a hierarchical outline format with main topics and subtopics"
    };

    const systemPrompt = `You are an expert academic summarizer for ${userProfile?.program || 'university'} students${userProfile?.institution ? ` at ${userProfile.institution}` : ''}.

${summaryStyles[summaryType as string] || summaryStyles.concise}

Requirements:
- Focus on exam-relevant content
- Highlight key terms and definitions
- Include important formulas, mechanisms, or processes
- Organize logically by topic
- Use clear headings and formatting
- Keep the summary focused and actionable for studying
- If curriculum/syllabus context is provided, align the summary to match syllabus topics and flag past-paper-relevant areas${curriculumContext}`;

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
