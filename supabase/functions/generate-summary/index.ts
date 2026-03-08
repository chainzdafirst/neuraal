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
    const { documentText, summaryType, userProfile, filePath, fileName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine if we should process a PDF directly (skip separate extraction)
    const isPdfDirect = filePath && (fileName || filePath).toLowerCase().endsWith('.pdf') && !documentText;

    // Fetch matching curriculum resources for this user's institution/program
    let curriculumContext = "";
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

      if (resources && resources.length > 0) {
        const snippets = resources
          .filter((r: any) => r.content_text)
          .map((r: any) => `[${r.resource_type.toUpperCase()}: ${r.title}]\n${r.content_text!.slice(0, 2000)}`)
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

    const yearContext = userProfile?.yearOfStudy ? ` (Year ${userProfile.yearOfStudy})` : '';
    const systemPrompt = `You are an expert academic summarizer for ${userProfile?.program || 'university'} students${userProfile?.institution ? ` at ${userProfile.institution}` : ''}${yearContext}.

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
- Keep the summary focused and actionable for studying${curriculumContext}`;

    let userContent: any;

    if (isPdfDirect) {
      // PDF direct mode: download file and send as multimodal input (single AI call)
      console.log("PDF direct mode: downloading and summarizing in one pass");
      const { data: fileData, error: downloadError } = await sb.storage
        .from('documents')
        .download(filePath);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message}`);
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      // Chunked base64 encoding
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        const chunk = uint8.subarray(i, Math.min(i + chunkSize, uint8.length));
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);

      userContent = [
        { type: "text", text: "Please read and summarize this document according to your instructions." },
        { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
      ];
    } else if (documentText) {
      // Text mode: cap at 20k chars to reduce token processing time
      const cappedText = documentText.length > 20000 
        ? documentText.slice(0, 20000) + "\n\n[Document truncated for processing speed — first 20,000 characters shown]"
        : documentText;
      userContent = `Please summarize the following content:\n\n${cappedText}`;
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

    // If PDF direct mode, also save extracted text for other features
    if (isPdfDirect && summary) {
      // We don't have separate extracted text in this mode, 
      // but the summary itself serves as the processed output
      console.log("PDF direct summary generated successfully");
    }

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
