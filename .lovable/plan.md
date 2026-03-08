

## Plan: Add Document Text Extraction Edge Function

### Problem
Currently only `.txt` files get text extracted (client-side). PDF, DOCX, PPTX, and EPUB files are uploaded to storage but no text is extracted, so AI features can't generate content from them.

### Approach
Create a new `extract-text` edge function that downloads the file from storage and uses the Lovable AI gateway's vision/document capabilities to extract text. Then update the `FileUploader` component to call this function for non-txt files.

### Technical Details

**1. New Edge Function: `supabase/functions/extract-text/index.ts`**
- Accepts `filePath` and `fileType` in the request body
- Downloads the file from the `documents` storage bucket using the Supabase service role key
- For **PDF files**: Convert to base64, send to the AI gateway using `google/gemini-2.5-flash` with a prompt like "Extract all text content from this document verbatim" using the multimodal (image/file) input capability
- For **DOCX/DOC files**: Parse using a lightweight approach — DOCX files are ZIP archives containing XML. Use Deno's built-in ZIP capabilities or a simple XML extraction approach to pull text from `word/document.xml`
- For **PPTX/PPT files**: Similar ZIP-based extraction, pulling text from slide XML files
- For **EPUB files**: ZIP-based extraction, pulling text from XHTML content files
- Returns `{ extractedText: string }`
- Add `[functions.extract-text]` with `verify_jwt = false` to `config.toml`

**2. Update `FileUploader.tsx`**
- After uploading a non-txt file to storage and saving the DB record, call the `extract-text` edge function
- On success, update the document record's `extracted_text` and `status` to "ready"
- Show "processing" status while extraction runs, then "ready" when complete
- Handle errors gracefully with a toast message

**3. Update accepted file types**
- Add `.epub` to the accepted types list in `FileUploader.tsx`
- Update the help text to include EPUB

### Edge Function Strategy for Binary Files
Since Deno edge functions have limited library support, the most reliable approach:
- **DOCX/PPTX/EPUB**: These are ZIP files. Use `JSZip` via `npm:jszip` to unzip, then parse the XML/HTML content to extract plain text
- **PDF**: Use the AI gateway's multimodal capability — send the PDF as base64 to Gemini which natively understands PDFs

### Files to Create/Modify
1. **Create** `supabase/functions/extract-text/index.ts` — the extraction edge function
2. **Edit** `supabase/config.toml` — add function config
3. **Edit** `src/components/FileUploader.tsx` — call extraction for non-txt files, add `.epub`

