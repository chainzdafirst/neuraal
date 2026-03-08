

## Plan: AI-Powered Document Metadata Extraction for Curriculum Uploads

### Problem
Admins currently must manually fill in title, institution, program, resource type, education level, and exam type when uploading curriculum documents. This is tedious and error-prone.

### Solution
Create a new edge function `classify-curriculum` that uses Gemini to read the first page of an uploaded document and extract structured metadata (resource type, program, institution/exam board, education level). Then update the admin upload flow to:
1. Upload the file first
2. Call the classifier to auto-populate form fields
3. Let the admin review/confirm before saving

### Changes

**1. New Edge Function: `supabase/functions/classify-curriculum/index.ts`**
- Accepts a `filePath` pointing to an already-uploaded file in the `documents` storage bucket
- Downloads the file, extracts text from the first page (reuses the existing PDF-via-AI / DOCX/PPTX extraction logic, but limited to first page content)
- Sends extracted text to Gemini with a structured prompt asking it to return JSON with fields: `title`, `resource_type` (syllabus/past_paper/reference_material), `institution`, `program`, `education_level` (diploma/degree), `exam_type` (semester/board), `description`
- Also queries existing institutions from `curriculum_resources` and includes them in the prompt so the AI can match to known institutions when possible
- Returns the structured JSON metadata

**2. Update `src/pages/admin/AdminContent.tsx`**
- Redesign the upload dialog flow:
  - Step 1: Admin selects a file. File is uploaded to storage immediately. A "Classifying..." spinner appears.
  - Step 2: The `classify-curriculum` function is called. Response auto-fills the form fields (title, resource type, institution, program, education level, exam type, description).
  - Step 3: Admin reviews the pre-filled form, makes corrections if needed, and confirms.
- If classification fails, fall back to manual entry with a toast warning.
- When navigating from within an institution/program context, those values are still pre-filled as defaults but can be overridden by AI results.

### Technical Details

**Edge Function prompt design:**
```text
Analyze the first page/section of this academic document and extract:
1. title: The document's full title
2. resource_type: One of "syllabus", "past_paper", "reference_material"
3. institution: The examining body or institution (e.g. "TEVETA", "University of Zambia")
4. program: The academic program (e.g. "Diploma in Business Administration")
5. education_level: "diploma" or "degree"
6. exam_type: "board" or "semester"
7. description: A one-sentence summary

Known institutions in the system: [list from DB]

Return ONLY valid JSON with these fields.
```

**For PDFs**: Send the full PDF to Gemini (it already handles multimodal) but instruct it to focus on the first/cover page for metadata.

**For DOCX/PPTX**: Extract text from first section only, then send to Gemini for classification.

