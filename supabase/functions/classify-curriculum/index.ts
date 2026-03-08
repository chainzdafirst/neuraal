import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import JSZip from "npm:jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function stripXmlTags(xml: string): string {
  return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getFirstPageText(data: Uint8Array, fileName: string): Promise<string | null> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
    const zip = await JSZip.loadAsync(data);
    const docXml = await zip.file("word/document.xml")?.async("string");
    if (!docXml) return null;
    const text = stripXmlTags(docXml);
    // Return first ~2000 chars as approximation of first page
    return text.slice(0, 2000);
  }

  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) {
    const zip = await JSZip.loadAsync(data);
    const slide1 = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide1\.xml$/.test(name))[0];
    if (!slide1) return null;
    const xml = await zip.file(slide1)?.async("string");
    return xml ? stripXmlTags(xml) : null;
  }

  if (lower.endsWith('.txt')) {
    const text = new TextDecoder().decode(data);
    return text.slice(0, 2000);
  }

  // PDF and others — return null to use multimodal approach
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileName } = await req.json();
    if (!filePath) throw new Error("filePath is required");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Download file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath);
    if (downloadError || !fileData) throw new Error(`Download failed: ${downloadError?.message}`);

    const arrayBuffer = await fileData.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // Get known institutions for context
    const { data: existingResources } = await supabase
      .from('curriculum_resources')
      .select('institution, program')
      .limit(500);

    const knownInstitutions = [...new Set((existingResources || []).map(r => r.institution))];
    const knownPrograms = [...new Set((existingResources || []).map(r => r.program))];

    // Try text extraction for non-PDF, or use multimodal for PDF
    const lowerName = (fileName || filePath).toLowerCase();
    const firstPageText = await getFirstPageText(uint8, lowerName);

    const systemPrompt = `You are a document classifier for academic curriculum resources. Analyze the document content and extract structured metadata.

Known institutions in the system: ${knownInstitutions.length > 0 ? knownInstitutions.join(', ') : 'None yet'}
Known programs in the system: ${knownPrograms.length > 0 ? knownPrograms.join(', ') : 'None yet'}

If the document matches a known institution or program, use the EXACT same spelling. Otherwise, use the name as written in the document.`;

    const userPrompt = `Extract the following metadata from this academic document:
1. title: The document's full title
2. resource_type: One of "syllabus", "past_paper", "reference_material"
3. institution: The examining body or institution (e.g. "TEVETA", "University of Zambia")
4. program: The academic program (e.g. "Diploma in Business Administration")
5. education_level: "diploma" or "degree"
6. exam_type: "board" or "semester"
7. description: A one-sentence summary of the document

Focus on the first/cover page for metadata.`;

    // Build messages based on whether we have text or need multimodal
    let messages: any[];
    if (firstPageText) {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${userPrompt}\n\nDocument text (first page):\n${firstPageText}` },
      ];
    } else if (lowerName.endsWith('.pdf')) {
      const base64 = btoa(String.fromCharCode(...uint8));
      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
          ],
        },
      ];
    } else {
      throw new Error("Unsupported file type for classification");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "classify_document",
              description: "Return structured metadata extracted from the academic document.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Document title" },
                  resource_type: { type: "string", enum: ["syllabus", "past_paper", "reference_material"] },
                  institution: { type: "string", description: "Examining body or institution" },
                  program: { type: "string", description: "Academic program name" },
                  education_level: { type: "string", enum: ["diploma", "degree"] },
                  exam_type: { type: "string", enum: ["board", "semester"] },
                  description: { type: "string", description: "One-sentence summary" },
                },
                required: ["title", "resource_type", "institution", "program", "education_level", "exam_type", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_document" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI classification failed: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured classification");
    }

    const metadata = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ metadata }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Classification error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Classification failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
