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

    const { documentText, difficulty, questionCount, userProfile } = await req.json();
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
      ? `The uploaded document has been identified as belonging to the course "${identifiedCourse}". Generate questions ONLY for this subject.`
      : "";

    const yearContext = userProfile?.yearOfStudy ? ` (Year ${userProfile.yearOfStudy})` : '';
    const systemPrompt = `You are an expert exam question generator for ${userProfile?.program || 'university'} students${userProfile?.institution ? ` at ${userProfile.institution}` : ''}${yearContext}.

${courseIdentification}

Generate ${questionCount || 5} multiple-choice questions based on the provided content.

Difficulty level: ${difficulty || 'moderate'}

SYLLABUS-ALIGNMENT PROCESS (follow strictly):
1. IDENTIFY TOPICS: Read the uploaded document and identify all academic topics and concepts it covers.
2. CROSS-REFERENCE: Match these topics against the curriculum/syllabus learning objectives provided below.
3. ALIGN QUESTIONS: Generate questions that test the specific learning objectives from the syllabus that the document content addresses. Each question should:
   - Target a specific syllabus learning objective or competency
   - Use question styles and depth matching past-paper patterns (if past paper context is available)
   - Test understanding of concepts as the syllabus expects, not just surface memorization
4. TAG with the syllabus topic/learning objective each question maps to.

If NO curriculum context is available, generate questions based on the document's own topic structure.

Requirements:
- Each question should have exactly 4 options (A, B, C, D)
- Include one clearly correct answer
- Provide a brief explanation referencing the relevant learning objective
- Tag each question with its matching syllabus topic${curriculumContext}

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct",
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
          { role: "user", content: `Generate quiz questions from this content:\n\n${documentText || 'General academic topics.'}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate quiz");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");
    
    const quizData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate quiz";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
