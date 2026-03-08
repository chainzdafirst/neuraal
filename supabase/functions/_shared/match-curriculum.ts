/**
 * Content-based keyword matching for syllabus alignment.
 * Extracts significant terms from a document and scores curriculum resources
 * to identify the specific course/subject the document belongs to.
 */

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should",
  "may", "might", "must", "can", "could", "this", "that", "these", "those",
  "it", "its", "not", "no", "nor", "so", "if", "then", "than", "too", "very",
  "just", "about", "above", "after", "again", "all", "also", "am", "any",
  "as", "because", "before", "between", "both", "each", "few", "get", "got",
  "he", "her", "here", "him", "his", "how", "i", "into", "me", "more", "most",
  "my", "new", "now", "off", "old", "only", "other", "our", "out", "own",
  "re", "same", "she", "some", "such", "take", "their", "them", "there",
  "they", "through", "under", "up", "us", "use", "used", "using", "we",
  "what", "when", "where", "which", "while", "who", "whom", "why", "you",
  "your", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "first", "second", "third", "last", "next", "well", "also",
  "back", "even", "still", "way", "many", "much", "make", "like", "long",
  "look", "come", "know", "over", "think", "see", "time", "part", "say",
  // Academic generic terms to exclude
  "chapter", "page", "section", "figure", "table", "example", "note", "notes",
  "student", "students", "course", "lecture", "class", "exam", "test",
  "question", "answer", "study", "learning", "objective", "objectives",
  "introduction", "conclusion", "summary", "reference", "references",
  "university", "college", "department", "faculty", "semester", "year",
]);

/** Clean and tokenize text into lowercase words */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/** Extract significant unigrams and bigrams from document text */
export function extractKeywords(documentText: string, maxKeywords = 60): string[] {
  const text = documentText.slice(0, 30000); // Cap processing
  const tokens = tokenize(text);

  // Count unigram frequencies
  const unigramFreq = new Map<string, number>();
  for (const t of tokens) {
    unigramFreq.set(t, (unigramFreq.get(t) || 0) + 1);
  }

  // Count bigram frequencies (domain-specific compound terms)
  const bigramFreq = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    bigramFreq.set(bigram, (bigramFreq.get(bigram) || 0) + 1);
  }

  // Score: bigrams weighted 3x, unigrams 1x; require min frequency of 2
  const scored: Array<{ term: string; score: number }> = [];

  for (const [term, freq] of bigramFreq) {
    if (freq >= 2) {
      scored.push({ term, score: freq * 3 });
    }
  }
  for (const [term, freq] of unigramFreq) {
    if (freq >= 2 && term.length > 3) {
      scored.push({ term, score: freq });
    }
  }

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxKeywords).map((s) => s.term);
}

interface CurriculumResource {
  title: string;
  resource_type: string;
  content_text: string | null;
  [key: string]: unknown;
}

interface ScoredResource extends CurriculumResource {
  _matchScore: number;
  _matchedKeywords: number;
}

/**
 * Score curriculum resources against document keywords.
 * Returns only the best-matching course cluster to prevent cross-subject contamination.
 */
export function matchResources(
  documentText: string,
  resources: CurriculumResource[]
): { matchedResources: CurriculumResource[]; identifiedCourse: string | null } {
  if (!resources || resources.length === 0) {
    return { matchedResources: [], identifiedCourse: null };
  }

  const keywords = extractKeywords(documentText);
  if (keywords.length === 0) {
    return { matchedResources: resources, identifiedCourse: null };
  }

  // Score each resource by counting distinct keyword matches
  const scored: ScoredResource[] = resources.map((res) => {
    const searchText = `${res.title} ${res.content_text || ""}`.toLowerCase();
    let matchedCount = 0;
    let totalHits = 0;

    for (const kw of keywords) {
      if (searchText.includes(kw)) {
        matchedCount++;
        // Count occurrences for weighting
        const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const matches = searchText.match(regex);
        totalHits += matches ? matches.length : 0;
      }
    }

    // Title matches get a 2x bonus — if keyword appears in the title it's very relevant
    const titleText = res.title.toLowerCase();
    let titleBonus = 0;
    for (const kw of keywords) {
      if (titleText.includes(kw)) {
        titleBonus += 5;
      }
    }

    return {
      ...res,
      _matchScore: totalHits + titleBonus,
      _matchedKeywords: matchedCount,
    };
  });

  // Sort by matched keywords first, then by score
  scored.sort((a, b) => {
    if (b._matchedKeywords !== a._matchedKeywords) {
      return b._matchedKeywords - a._matchedKeywords;
    }
    return b._matchScore - a._matchScore;
  });

  // Find the top-scoring resource's title as the identified course
  const topResource = scored[0];

  // If the best match has very few keyword hits, fallback to all resources
  if (topResource._matchedKeywords < 3) {
    return { matchedResources: resources, identifiedCourse: null };
  }

  // Group by title similarity — resources with the same title prefix likely belong to the same course
  const topTitle = topResource.title.toLowerCase();
  const threshold = Math.max(3, topResource._matchedKeywords * 0.3);

  const filtered = scored.filter((r) => {
    // Include if it's the same course/title or has strong keyword overlap
    const sameTitle = r.title.toLowerCase() === topTitle;
    const strongMatch = r._matchedKeywords >= threshold;
    return sameTitle || strongMatch;
  });

  // Clean up internal scoring fields before returning
  const cleanResults = filtered.map(({ _matchScore, _matchedKeywords, ...rest }) => rest as CurriculumResource);

  return {
    matchedResources: cleanResults,
    identifiedCourse: topResource.title,
  };
}

/**
 * Build curriculum context string for AI prompts.
 * This is the main function edge functions should call.
 */
export function buildCurriculumContext(
  documentText: string,
  resources: CurriculumResource[],
  userProfile: { institution?: string; program?: string }
): { context: string; identifiedCourse: string | null } {
  const { matchedResources, identifiedCourse } = matchResources(documentText, resources);

  if (matchedResources.length === 0) {
    return { context: "", identifiedCourse: null };
  }

  const snippets = matchedResources
    .filter((r) => r.content_text)
    .map((r) => `[${r.resource_type.toUpperCase()}: ${r.title}]\n${r.content_text!.slice(0, 3000)}`)
    .join("\n\n---\n\n");

  if (!snippets) {
    return { context: "", identifiedCourse: null };
  }

  const courseLabel = identifiedCourse ? ` The uploaded document has been identified as belonging to "${identifiedCourse}".` : "";
  const institution = userProfile.institution || "the institution";
  const program = userProfile.program || "the program";

  const context = `\n\n${courseLabel} Use ONLY the following matched curriculum resources from ${institution} (${program}) for syllabus alignment. Ignore any unrelated subjects:\n\n${snippets}`;

  return { context, identifiedCourse };
}
