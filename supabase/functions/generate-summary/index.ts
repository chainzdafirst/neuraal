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

    const courseIdentification = identifiedCourse
      ? `The uploaded document has been identified as belonging to the course "${identifiedCourse}". Focus ONLY on this subject area.`
      : "";

    // Part-based generation instructions
    let partInstruction = "";
    if (currentPart === 1) {
      partInstruction = `\n\nCRITICAL — CHUNKED OUTPUT: You are generating Part ${currentPart} of ${totalParts} of this summary.
Mentally divide the matched Learning Outcomes into ${totalParts} roughly equal groups.
For Part 1: Address ONLY the first quarter of Learning Outcomes and their related Learning Activities.
At the END of your output, add a line: "---\n**Learning Outcomes covered so far:** [list the LO numbers/titles you addressed]"
Keep this part focused and thorough — do NOT rush through everything.`;
    } else {
      partInstruction = `\n\nCRITICAL — CHUNKED OUTPUT: You are generating Part ${currentPart} of ${totalParts} of this summary.
The previous parts already covered the following:\n${previousParts || "(no previous content provided)"}\n
Do NOT repeat any content from previous parts. Continue with the next group of Learning Outcomes.
For Part ${currentPart}: Address the next quarter of remaining Learning Outcomes and their Learning Activities.${currentPart === totalParts ? " This is the FINAL part — cover all remaining Learning Outcomes and include a GAP ANALYSIS listing any LOs the document does NOT adequately cover." : ""}
At the END of your output, add a line: "---\n**Learning Outcomes covered so far:** [list ALL LO numbers/titles covered across all parts]"`;
    }

    const yearContext = userProfile?.yearOfStudy ? ` (Year ${userProfile.yearOfStudy})` : '';
    const systemPrompt = `You are an expert academic summarizer for ${userProfile?.program || 'university'} students${userProfile?.institution ? ` at ${userProfile.institution}` : ''}${yearContext}.

${courseIdentification}

You have TWO sources of information:
1. **SYLLABUS / CURRICULUM** (provided below in this system prompt) — this is where you find Learning Outcomes (LOs) and Learning Activities (LAs).
2. **UPLOADED DOCUMENT** (provided in the user message) — this is the student's study material/notes.

YOUR TASK: Find the Learning Outcomes and Learning Activities listed in the SYLLABUS below, then use the UPLOADED DOCUMENT's content to answer and explain each one.

PROCESS (follow strictly):
1. READ the syllabus/curriculum context below and EXTRACT:
   - All **Learning Outcomes** (LOs) — what the student is expected to know or demonstrate
   - All **Learning Activities** (LAs) — tasks, exercises, or study activities prescribed
   These come ONLY from the syllabus text below, NOT from the uploaded document.

2. For EACH Learning Outcome from the syllabus:
   - Use it as a **section heading** (e.g., "## LO: Explain the mechanism of antimicrobial resistance")
   - Write a thorough answer/explanation using ONLY information found in the UPLOADED DOCUMENT
   - Highlight **key terms**, definitions, formulas, diagrams described, and mechanisms
   - If the uploaded document contains examples, case studies, or data relevant to this LO, include them

3. For EACH Learning Activity from the syllabus:
   - Under a sub-heading "📝 Learning Activity", describe how the uploaded document's content fulfills or relates to the activity
   - If the activity asks students to compare, list, or analyze — do that using the uploaded document's content

4. If the uploaded document does not adequately cover a Learning Outcome, still include the heading but note briefly what information is missing.

If NO syllabus/curriculum context is available below, organize by the uploaded document's own topic structure and create a standard detailed summary.

Requirements:
- Learning Outcomes and Learning Activities must come from the SYLLABUS context below
- Answers and explanations must come from the UPLOADED DOCUMENT
- Do not fabricate information — if the document doesn't cover something, say so
- Use markdown formatting: headers, bold key terms, bullet points, numbered lists
- Be thorough but concise — exam-focused, no unnecessary padding
- Include important formulas, mechanisms, or processes verbatim from the document${curriculumContext}${partInstruction}`;

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
