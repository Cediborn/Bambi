import { describe, expect, it } from "vitest";
import { journalPreview } from "@/utils/journalPreview";

describe("journalPreview", () => {
  it("returns an empty string for empty content", () => {
    expect(journalPreview("")).toBe("");
    expect(journalPreview("   ")).toBe("");
  });

  it("keeps short entries whole", () => {
    expect(journalPreview("A good day.")).toBe("A good day.");
  });

  it("shows the first two sentences and ends with an ellipsis", () => {
    const content =
      "Today was a really interesting day. I managed to finish my project and learned a lot about building apps. Tomorrow I want to read more.";
    expect(journalPreview(content)).toBe(
      "Today was a really interesting day. I managed to finish my project and learned a lot about building apps…"
    );
  });

  it("shows the first two sentences when the entry ends right there", () => {
    const content =
      "First sentence goes here. Second sentence also fits.";
    expect(journalPreview(content)).toBe(content);
  });

  it("caps an enormous single sentence at maxChars on a word boundary", () => {
    const long = "word ".repeat(200).trim();
    const preview = journalPreview(long, 2, 160);
    expect(preview.endsWith("…")).toBe(true);
    expect(preview.length).toBeLessThanOrEqual(160 + 1); // +1 for the ellipsis
    expect(preview).not.toContain("… ");
  });

  it("hard-cuts when a single word/URL is longer than the cap", () => {
    const url = "https://example.com/" + "a".repeat(300);
    const preview = journalPreview(url, 2, 160);
    expect(preview.endsWith("…")).toBe(true);
    expect(preview.length).toBeLessThanOrEqual(160 + 1);
  });

  it("respects sentence-ending punctuation and newlines", () => {
    const content = "Line one.\nLine two!\nLine three?";
    expect(journalPreview(content)).toBe("Line one. Line two!…");
  });
});