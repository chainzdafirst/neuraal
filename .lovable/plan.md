## Plan: Add "Year of Study" Filter to Admin Dashboard and AI Pipeline

### What Changes

**1. Database: Add `year_of_study` column to two tables**

- `profiles` table: add `year_of_study integer` (nullable) — stores each user's current year
- `curriculum_resources` table: add `year_of_study integer` (nullable) — allows admins to tag resources by year

**2. Onboarding: Collect year of study from users**

- Add a new step (or extend an existing step) in `src/pages/Onboarding.tsx` to ask the user their year of study (1, 2, 3, 4, 5+)
- Save it to the `profiles` table via `updateProfile`
  &nbsp;

**4. Admin Dashboard: Year of study filter and form fields**

- `src/pages/admin/AdminContent.tsx`:
  - Add `year_of_study` to the resource upload form 
  - Add a year filter dropdown in the resources table view
  - Display year of study in the resources table

**5. AI Pipeline: Pass year_of_study in userProfile**

- Update all edge function calls in these files to include `year_of_study` in the `userProfile` object:
  - `src/pages/AITutor.tsx`
  - `src/pages/Flashcards.tsx`
  - `src/pages/Quiz.tsx`
  - `src/pages/SummaryView.tsx`
  - `src/pages/Upload.tsx`

**6. Edge Functions: Use year_of_study in curriculum queries and prompts**

- Update all 4 edge functions (`ai-chat`, `generate-summary`, `generate-quiz`, `generate-flashcards`) to:
  - Filter `curriculum_resources` query by `year_of_study` when available
  - Include year of study context in the AI system prompt (e.g., "This student is in Year 2")

### Migration SQL

```sql
ALTER TABLE public.profiles ADD COLUMN year_of_study integer;
ALTER TABLE public.curriculum_resources ADD COLUMN year_of_study integer;
```

### Files Modified

- **Migration** — add columns
- `src/contexts/AuthContext.tsx` — Profile interface
- `src/pages/Onboarding.tsx` — new year selection step
- `src/pages/admin/AdminContent.tsx` — form fields + filter
- `src/pages/AITutor.tsx`, `Flashcards.tsx`, `Quiz.tsx`, `SummaryView.tsx`, `Upload.tsx` — pass year_of_study
- `supabase/functions/ai-chat/index.ts`, `generate-summary/index.ts`, `generate-quiz/index.ts`, `generate-flashcards/index.ts` — filter + prompt update