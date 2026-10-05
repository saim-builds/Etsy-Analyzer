import type { EtsyListing } from "./etsy";

export type TermStat = { term: string; count: number; share: number };
export type Phrase = { term: string; count: number };

const STOP_WORDS = new Set([
  "and", "the", "for", "with", "your", "you", "from", "that", "this",
  "are", "not", "but", "can", "all", "any", "has", "have", "per", "set",
]);

function rank(counts: Map<string, number>, total: number, top: number): TermStat[] {
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([term, count]) => ({ term, count, share: count / total }));
}

// How many listings use each tag (counted once per listing)
export function tagFrequency(listings: EtsyListing[], top = 15): TermStat[] {
  const counts = new Map<string, number>();
  for (const l of listings) {
    const tags = new Set(l.tags.map((t) => t.toLowerCase().trim()).filter(Boolean));
    for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return rank(counts, listings.length, top);
}

// How many listing titles contain each word (counted once per listing)
export function titleWordFrequency(listings: EtsyListing[], top = 15): TermStat[] {
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
  return rank(counts, listings.length, top);
}

function sing(w: string) {
  return w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
}
function toWords(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

// Tags that contain every word of the keyword plus something extra
export function longTailPhrases(listings: EtsyListing[], keyword: string, top = 12): Phrase[] {
  const kw = toWords(keyword).map(sing);
  if (kw.length === 0) return [];
  const kwKey = [...kw].sort().join(" ");
  const counts = new Map<string, number>();

  for (const l of listings) {
    const found = new Set<string>();
    for (const tag of l.tags) {
      const words = toWords(tag);
      const sw = words.map(sing);
      if (!kw.every((w) => sw.includes(w))) continue;
      if ([...sw].sort().join(" ") === kwKey) continue; // same as the keyword itself
      found.add(words.join(" "));
    }
    for (const p of found) counts.set(p, (counts.get(p) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)
    .slice(0, top)
    .map(([term, count]) => ({ term, count }));
}