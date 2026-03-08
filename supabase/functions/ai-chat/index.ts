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
    const { messages, context, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch matching curriculum resources for syllabus-aligned tutoring
    let curriculumContext = "";
    if (userProfile?.institution && userProfile?.program) {
      const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { data: resources } = await sb
        .from("curriculum_resources")
        .select("title, resource_type, content_text")
        .eq("institution", userProfile.institution)
        .eq("program", userProfile.program)
        .eq("is_active", true)
        .match(userProfile.yearOfStudy ? { year_of_study: userProfile.yearOfStudy } : {})
        .limit(15);

      if (resources && resources.length > 0) {
        const snippets = resources
          .filter((r: any) => r.content_text)
          .map((r: any) => `[${r.resource_type.toUpperCase()}: ${r.title}]\n${r.content_text!.slice(0, 2000)}`)
          .join("\n\n---\n\n");
        if (snippets) {
          curriculumContext = `\n\nOfficial curriculum resources for ${userProfile.institution} (${userProfile.program}). Use these to align your answers with the syllabus:\n\n${snippets}`;
        }
      }
    }

    const yearContext = userProfile?.yearOfStudy ? ` in Year ${userProfile.yearOfStudy}` : '';
    const systemPrompt = `You are Neuraal, a friendly and encouraging AI study companion for ${userProfile?.program || 'university'} students${userProfile?.institution ? ` at ${userProfile.institution}` : ''}${yearContext}.

Your personality:
- You are warm, supportive, and genuinely excited to help students learn
- You celebrate progress and encourage students when they struggle
- You use a conversational, approachable tone - like a knowledgeable study buddy
- You make complex topics feel manageable and interesting
- You are patient and never make students feel bad for not understanding something

Your capabilities:
- Provide clear, step-by-step explanations tailored to the student's level (${userProfile?.educationLevel || 'degree'})
- Align answers with exam syllabi and highlight exam-relevant points
- Use the Socratic method when appropriate to encourage deeper understanding
- Break down complex concepts into digestible parts with relatable examples
- Format responses with clear headings, bullet points, and numbered lists when helpful

SYLLABUS-ALIGNMENT PROCESS (follow when document context and curriculum context are both available):
1. IDENTIFY TOPICS: Determine what academic topics the student's question and uploaded notes relate to.
2. CROSS-REFERENCE: Match those topics against the curriculum/syllabus learning objectives provided below.
3. ALIGN RESPONSE: Frame your explanation around the relevant syllabus learning objectives. Reference the specific learning outcomes the student needs to master. If past-paper patterns are available, mention how the topic is typically examined.

Guidelines:
- Start responses with a brief, encouraging acknowledgment of the question
- If uncertain, acknowledge limitations honestly rather than guessing
- Cite relevant syllabus learning objectives when available
- Keep responses focused and thorough but avoid unnecessary padding
- Use markdown formatting for readability (headers, bold, lists, code blocks)
- When curriculum context is available, explicitly reference syllabus topics and learning outcomes

${context ? `\nRelevant context from the student's uploaded notes:\n${context}` : ''}${curriculumContext}`;

    console.log("AI chat request received, sending to gateway...");

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm a bit overwhelmed right now! Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue studying." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
