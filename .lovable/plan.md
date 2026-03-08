

## Plan: Content-Based Keyword Matching for Syllabus Alignment

### Problem
Currently, all 4 AI edge functions fetch up to 15 curriculum resources matching only by metadata (institution, program, year). If a Pharmacy student uploads a Pharmacology document, the system also sends Biochemistry and Anatomy syllabi — causing misalignment and noise.

### Solution
Add a **keyword-scoring step** after fetching curriculum resources but before injecting them into the AI prompt. This step:

1. **Extracts keywords** from the uploaded document text (top N significant terms)
2. **Scores each curriculum resource** by counting keyword hits in its `content_text` and `title`
3. **Selects only the best-matching course/subject** — since a single document belongs to one course, pick the resource cluster with the highest aggregate score
4. **Sends only those filtered resources** to the AI, with explicit course identification in the prompt

### Technical Approach

**New shared helper file**: `supabase/functions/_shared/match-curriculum.ts`

```text
extractKeywords(documentText) → string[]
  - Lowercase, strip punctuation
  - Remove common stop words
  - Extract multi-word terms (bigrams) for domain specificity
  - Return top ~50 unique keywords by frequency

scoreResources(keywords, resources) → scored & ranked resources
  - For each resource: count keyword matches in title + content_text
  - Group by resource title/course cluster
  - Return resources from the top-scoring group only
```

**Edge function changes** (all 4 functions: `generate-summary`, `generate-quiz`, `generate-flashcards`, `ai-chat`):
- After fetching resources from DB, pass them through `scoreResources()` with extracted document keywords
- Only inject the filtered (best-match) resources into the prompt
- Add the identified course/subject name to the system prompt so the AI knows the precise context
- Update prompt instructions: "The document has been identified as belonging to [Course X]. Use ONLY the following syllabus section for alignment."

**Keyword extraction strategy** (pure text, no AI call needed):
- Tokenize document text, filter stop words
- Weight multi-word terms (e.g., "antimicrobial agents", "Alexander Fleming") higher than single words
- Use bigram extraction to catch domain-specific compound terms
- Score = number of distinct keyword matches (not raw count, to avoid bias from repeated terms)

### Files to Create/Edit
1. **Create** `supabase/functions/_shared/match-curriculum.ts` — keyword extraction + scoring logic
2. **Edit** `supabase/functions/generate-summary/index.ts` — integrate matching
3. **Edit** `supabase/functions/generate-quiz/index.ts` — integrate matching
4. **Edit** `supabase/functions/generate-flashcards/index.ts` — integrate matching
5. **Edit** `supabase/functions/ai-chat/index.ts` — integrate matching

### No Database Changes Required
This is purely logic within edge functions using existing data.

