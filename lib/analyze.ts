import type { EtsyListing } from "./etsy";

export type TermStat = { term: string; count: number; share: number };

const STOP_WORDS = new Set([
  "and", "the", "for", "with", "your", "you", "from", "that", "this",
  "are", "not", "but", "can", "all", "any", "has", "have", "per", "set",
]);

function rank(counts: Map<string, number>, total: number, top = 15): TermStat[] {
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([term, count]) => ({ term, count, share: count / total }));
}

// How many listings use each tag (counted once per listing)
export function tagFrequency(listings: EtsyListing[]): TermStat[] {
  const counts = new Map<string, number>();
  for (const l of listings) {
    const tags = new Set(l.tags.map((t) => t.toLowerCase().trim()).filter(Boolean));
    for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return rank(counts, listings.length);
}

// How many listing titles contain each word (counted once per listing)
export function titleWordFrequency(listings: EtsyListing[]): TermStat[] {
  const counts = new Map<string, number>();
  for (const l of listings) {
    const words = new Set(
      l.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    );
    for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return rank(counts, listings.length);
}