

## Optimize Text Extraction Pipeline

### Current State
The hybrid approach already exists — DOCX/PPTX/EPUB use JSZip (free, fast), and PDFs use AI OCR. However, **every PDF sends the entire document** to Gemini, which is wasteful and expensive when the document is large.

### What to Implement

**1. Add first-page-only extraction mode for `extract-text` edge function**
- Accept an optional `firstPageOnly` parameter
- When true (used by `classify-curriculum`), send only page 1 to AI — reduces tokens and cost
- When false (default, used by user uploads), extract the full document as today

**2. Optimize large PDF handling in `extract-text`**
- Add a file size check: if PDF > 5MB, warn in the prompt to focus on text extraction efficiency
- Use `google/gemini-2.5-flash-lite` for simple text extraction (cheaper, faster) instead of `gemini-2.5-flash`
- Keep `gemini-2.5-flash` for the classification function which needs reasoning

**3. Skip redundant AI calls in admin upload flow (`AdminContent.tsx`)**
- Currently, the admin upload calls `classify-curriculum` (AI) AND `extract-text` (AI again) for PDFs — two AI calls for one document
- Optimize: have `classify-curriculum` return the extracted first-page text it already processes, and reuse it as partial `content_text` to avoid a second full extraction call when not needed
- Only call `extract-text` for full extraction if the admin explicitly wants full text indexing

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/extract-text/index.ts` | Add `firstPageOnly` param; switch to `gemini-2.5-flash-lite` for text extraction |
| `supabase/functions/classify-curriculum/index.ts` | Return extracted first-page text alongside metadata |
| `src/pages/admin/AdminContent.tsx` | Use first-page text from classification response; skip redundant `extract-text` call when classification already provided text |

### Cost Impact
- Classification: unchanged (already optimized with JSZip for DOCX/PPTX)
- PDF text extraction: ~40-60% cheaper by using `flash-lite` instead of `flash`
- Admin uploads: eliminates duplicate AI call for PDFs (saves one full-document AI request per upload)

