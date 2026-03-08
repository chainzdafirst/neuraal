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

async function extractDocx(data: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(data);
  const docXml = await zip.file("word/document.xml")?.async("string");
  if (!docXml) throw new Error("No document.xml found in DOCX");
  return stripXmlTags(docXml);
}

async function extractPptx(data: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(data);
  const texts: string[] = [];
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort();
  
  for (const slideName of slideFiles) {
    const xml = await zip.file(slideName)?.async("string");
    if (xml) texts.push(stripXmlTags(xml));
  }
  if (texts.length === 0) throw new Error("No slides found in PPTX");
  return texts.join("\n\n");
}

async function extractEpub(data: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(data);
  const texts: string[] = [];
  const contentFiles = Object.keys(zip.files)
    .filter(name => /\.(xhtml|html|htm)$/i.test(name))
    .sort();

  for (const fileName of contentFiles) {
    const html = await zip.file(fileName)?.async("string");
    if (html) texts.push(stripXmlTags(html));
  }
  if (texts.length === 0) throw new Error("No content found in EPUB");
  return texts.join("\n\n");
}

async function extractPdfViaAI(data: Uint8Array, firstPageOnly: boolean): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const base64 = btoa(String.fromCharCode(...data));
  const fileSizeMB = data.length / (1024 * 1024);

  let extractionPrompt = firstPageOnly
    ? "Extract ALL text content from the FIRST PAGE ONLY of this PDF document. Return only the extracted text, nothing else."
    : "Extract ALL text content from this PDF document verbatim. Preserve the structure, headings, paragraphs, lists, and tables as closely as possible. Return only the extracted text, nothing else.";

  if (!firstPageOnly && fileSizeMB > 5) {
    extractionPrompt += " This is a large document — focus on efficient, accurate text extraction.";
  }

  // Use flash-lite for simple text extraction (cheaper/faster), flash for first-page (used by classify which needs accuracy)
  const model = "google/gemini-2.5-flash-lite";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: extractionPrompt },
            { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI extraction failed: ${response.status}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content;
  if (!text) throw new Error("No text extracted from PDF");
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileType, fileName, firstPageOnly = false } = await req.json();
    if (!filePath) throw new Error("filePath is required");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    let extractedText: string;
    const lowerName = (fileName || filePath).toLowerCase();

    if (lowerName.endsWith('.pdf')) {
      extractedText = await extractPdfViaAI(uint8, firstPageOnly);
    } else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
      extractedText = await extractDocx(uint8);
      if (firstPageOnly) extractedText = extractedText.slice(0, 3000);
    } else if (lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt')) {
      extractedText = await extractPptx(uint8);
      if (firstPageOnly) extractedText = extractedText.slice(0, 3000);
    } else if (lowerName.endsWith('.epub')) {
      extractedText = await extractEpub(uint8);
      if (firstPageOnly) extractedText = extractedText.slice(0, 3000);
    } else {
      throw new Error(`Unsupported file type: ${lowerName}`);
    }

    return new Response(JSON.stringify({ extractedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Text extraction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to extract text";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
