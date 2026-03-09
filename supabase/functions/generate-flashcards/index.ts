import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { buildCurriculumContext } from "../_shared/match-curriculum.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { documentText, count, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch matching curriculum resources then score by document content
    let curriculumContext = "";
    let identifiedCourse: string | null = null;
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

      if (resources && resources.length > 0 && documentText) {
        const result = buildCurriculumContext(documentText, resources, userProfile);
        curriculumContext = result.context;
        identifiedCourse = result.identifiedCourse;
      }
    }

    const courseIdentification = identifiedCourse
      ? `The uploaded document has been identified as belonging to the course "${identifiedCourse}". Generate flashcards ONLY for this subject.`
      : "";

    const yearContext = userProfile?.yearOfStudy ? ` (Year ${userProfile.yearOfStudy})` : '';
    const systemPrompt = `You are an expert study card creator for ${userProfile?.program || 'university'} students${userProfile?.institution ? ` at ${userProfile.institution}` : ''}${yearContext}.

${courseIdentification}

Generate ${count || 10} flashcards based on the provided content.

SYLLABUS-ALIGNMENT PROCESS (follow strictly):
1. IDENTIFY TOPICS: Read the uploaded document and identify all academic topics, key terms, and concepts it covers.
2. CROSS-REFERENCE: Match these against the curriculum/syllabus learning objectives provided below.
3. PRIORITIZE: Create flashcards that focus on terms, definitions, and concepts that appear in the syllabus learning objectives. Prioritize:
   - Key terms the syllabus explicitly requires students to define or explain
   - Concepts tied to specific learning outcomes
   - Material that appears in past papers (if past paper context is available)
4. TAG each flashcard with the syllabus topic/learning objective it addresses.

If NO curriculum context is available, create flashcards based on the document's own key concepts.

Requirements:
- Front should be a clear, concise question or term aligned to a learning objective
- Back should be a comprehensive but concise answer/definition
- Focus on exam-relevant material as defined by the syllabus${curriculumContext}

Return ONLY valid JSON in this exact format:
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition",
      "topic": "Topic name"
    }
  ]
}`;

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
          { role: "user", content: `Generate flashcards from this content:\n\n${documentText || 'General academic topics.'}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate flashcards");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");
    
    const flashcardData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(flashcardData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Flashcard generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate flashcards";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
