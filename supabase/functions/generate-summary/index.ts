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
    const { documentText, summaryType, userProfile, filePath, fileName, part, previousParts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentPart = part || 1;
    const totalParts = 4;

    // Determine if we should process a PDF directly
    const isPdfDirect = filePath && (fileName || filePath).toLowerCase().endsWith('.pdf') && !documentText;

    // Fetch matching curriculum resources
    let curriculumContext = "";
    let identifiedCourse: string | null = null;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    if (userProfile?.institution && userProfile?.program) {
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
      } else if (resources && resources.length > 0) {
        const snippets = resources
          .filter((r: any) => r.content_text)
          .map((r: any) => `[${r.resource_type.toUpperCase()}: ${r.title}]\n${r.content_text!.slice(0, 2000)}`)
          .join("\n\n---\n\n");
        if (snippets) {
          curriculumContext = `\n\nIMPORTANT — Use the following official curriculum resources from ${userProfile.institution} (${userProfile.program}) to align the summary with the syllabus:\n\n${snippets}`;
        }
      }
    }

    const summaryStyles: Record<string, string> = {
      concise: "Create a brief, exam-focused summary highlighting only the most critical points",
      detailed: "Create a comprehensive summary that covers all important concepts with examples",
      bullet: "Create a bullet-point summary organized by topic with key terms highlighted",
      outline: "Create a hierarchical outline format with main topics and subtopics"
    };

    const courseIdentification = identifiedCourse
      ? `The uploaded document has been identified as belonging to the course "${identifiedCourse}". Focus ONLY on this subject area.`
      : "";

    // Part-based generation instructions
    let partInstruction = "";
    if (currentPart === 1) {
      partInstruction = `\n\nCRITICAL — CHUNKED OUTPUT: You are generating Part ${currentPart} of ${totalParts} of this summary. 
Mentally divide the document's content into ${totalParts} roughly equal sections by topic coverage.
For Part 1: Summarize ONLY the first quarter of topics/content. Cover the introduction and the first major topic areas.
At the END of your output, add a line: "---\n**Topics covered so far:** [list the topic headings you covered]"
Keep this part focused and complete for the topics it covers — do NOT rush through everything.`;
    } else {
      partInstruction = `\n\nCRITICAL — CHUNKED OUTPUT: You are generating Part ${currentPart} of ${totalParts} of this summary.
The previous parts already covered the following:\n${previousParts || "(no previous content provided)"}\n
Do NOT repeat any content from previous parts. Continue from where the previous part left off.
For Part ${currentPart}: Cover the next quarter of remaining topics/content that hasn't been summarized yet.${currentPart === totalParts ? " This is the FINAL part — cover all remaining topics and include any conclusion or gap analysis." : ""}
At the END of your output, add a line: "---\n**Topics covered so far:** [list ALL topic headings covered across all parts including this one]"`;
    }

    const yearContext = userProfile?.yearOfStudy ? ` (Year ${userProfile.yearOfStudy})` : '';
    const systemPrompt = `You are an expert academic summarizer for ${userProfile?.program || 'university'} students${userProfile?.institution ? ` at ${userProfile.institution}` : ''}${yearContext}.

${courseIdentification}

${summaryStyles[summaryType as string] || summaryStyles.concise}

SYLLABUS-ALIGNMENT PROCESS (follow strictly):
1. IDENTIFY TOPICS: Read the document and identify all academic topics, concepts, and subject areas.
2. CROSS-REFERENCE: Compare against the curriculum/syllabus learning objectives provided below.
3. ALIGN OUTPUT: Structure your summary around matching syllabus learning objectives. For each:
   - Use the syllabus topic heading as the section header
   - Summarize the document content for that objective
   - Highlight key terms, definitions, formulas, and mechanisms
   - Flag content that frequently appears in past papers (if available)
4. GAPS & EXTRAS: Briefly note partially covered objectives and supplementary content.

If NO curriculum context is available, organize by the document's own topic structure.

Requirements:
- Focus on exam-relevant content aligned to learning objectives
- Highlight key terms and definitions
- Include important formulas, mechanisms, or processes
- Use clear headings matching syllabus topic names where possible
- Keep the summary focused and actionable for studying${curriculumContext}${partInstruction}`;

    let userContent: any;

    if (isPdfDirect) {
      console.log(`PDF direct mode (Part ${currentPart}/${totalParts}): downloading and summarizing`);
      const { data: fileData, error: downloadError } = await sb.storage
        .from('documents')
        .download(filePath);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message}`);
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        const chunk = uint8.subarray(i, Math.min(i + chunkSize, uint8.length));
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);

      userContent = [
        { type: "text", text: `Please summarize this document — Part ${currentPart} of ${totalParts}.` },
        { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
      ];
    } else if (documentText) {
      const cappedText = documentText.length > 20000 
        ? documentText.slice(0, 20000) + "\n\n[Document truncated — first 20,000 characters shown]"
        : documentText;
      userContent = `Please summarize the following content (Part ${currentPart} of ${totalParts}):\n\n${cappedText}`;
    } else {
      throw new Error("Either documentText or filePath is required");
    }

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
          { role: "user", content: userContent },
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

    console.log(`Summary Part ${currentPart}/${totalParts} generated successfully`);

    return new Response(JSON.stringify({ summary, part: currentPart, totalParts }), {
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
