/**
 * Short preview of a journal entry for list cards.
 *
 * The saved entry is always preserved in storage — this only builds the
 * ~2-sentence / ~160-character teaser shown on the card. Truncation always
 * ends in "…", never mid-word, so previews stay tidy on any screen width.
 */
export function journalPreview(
  content: string,
  maxSentences = 2,
  maxChars = 160
): string {
  const trimmed = content.trim();
  if (!trimmed) return "";

  const sentences = trimmed.split(/(?<=[.!?…])\s+/).filter(Boolean);
  const preview = sentences.slice(0, maxSentences).join(" ");
  const truncatedBySentences = sentences.length > maxSentences;

  if (preview.length > maxChars) {
    let cut = preview.slice(0, maxChars);
    const lastSpace = cut.lastIndexOf(" ");
    // Only break at a word boundary when there's a real word to keep —
    // otherwise just hard-cut (e.g. a single giant word or URL).
    if (lastSpace > maxChars * 0.5) cut = cut.slice(0, lastSpace);
    // Drop trailing period-style punctuation (not ! or ? — those carry
    // meaning) before the ellipsis, e.g. "…building apps…".
    return cut.replace(/[\s.,;:]+$/, "") + "…";
  }

  if (truncatedBySentences) {
    return preview.replace(/[\s.,;:]+$/, "") + "…";
  }

  return preview;
}