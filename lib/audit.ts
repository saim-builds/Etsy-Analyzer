import type { EtsyListing } from "./etsy";
import { titleWordFrequency } from "./analyze";

const MAX_TAGS = 13;
const MAX_TAG_LEN = 20;
const MAX_TITLE_LEN = 140;

export type Check = { status: "ok" | "warn" | "bad"; title: string; detail: string };

export type AuditResult = {
  score: number;
  checks: Check[];
  addTags: string[];
  fullSet: string[];
  sample: number;
  total: number;
};

// "portraits" and "portrait" count as the same word
function sing(w: string) {
  return w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
}
function wordsOf(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean).map(sing);
}
// Same key means near-duplicate, even if word order differs
function keyOf(s: string) {
  return wordsOf(s).sort().join(" ");
}

export function parseTags(raw: string): string[] {
  return raw.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
}

type Input = {
  title: string;
  tags: string[];
  keyword: string;
  listings: EtsyListing[];
  total: number;
};

export function auditListing({ title, tags, keyword, listings, total }: Input): AuditResult {
  const checks: Check[] = [];
  const cleanTitle = title.trim();
  const cleanKeyword = keyword.trim();
  const userKeys = new Set(tags.map(keyOf));

  // Tags used by top listings, each counted once per listing
  const counts = new Map<string, number>();
  for (const l of listings) {
    const seen = new Set(l.tags.map((t) => t.toLowerCase().trim()).filter(Boolean));
    for (const t of seen) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const marketTags = [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);

  // 1. Tag slots
  const used = tags.length;
  if (used > MAX_TAGS) {
    checks.push({ status: "bad", title: `${used} tags entered`, detail: `Etsy accepts only ${MAX_TAGS}. The extras will be dropped.` });
  } else if (used === MAX_TAGS) {
    checks.push({ status: "ok", title: "All 13 tag slots used", detail: "Every slot is a chance to be found." });
  } else {
    checks.push({
      status: used >= 10 ? "warn" : "bad",
      title: `${MAX_TAGS - used} tag slots unused`,
      detail: `You use ${used} of ${MAX_TAGS}. Fill every slot with a different phrase.`,
    });
  }

  // 2. Tag length
  const longTags = tags.filter((t) => t.length > MAX_TAG_LEN);
  checks.push(
    longTags.length === 0
      ? { status: "ok", title: "All tags fit the 20-character limit", detail: "No tag is too long." }
      : { status: "bad", title: `${longTags.length} tag(s) over ${MAX_TAG_LEN} characters`, detail: `Shorten: ${longTags.join(", ")}` }
  );

  // 3. Near-duplicates
  const groups = new Map<string, string[]>();
  for (const t of tags) {
    const k = keyOf(t);
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  const dupGroups = [...groups.values()].filter((g) => g.length > 1);
  checks.push(
    dupGroups.length === 0
      ? { status: "ok", title: "No duplicate tags", detail: "Each tag is a different phrase." }
      : { status: "warn", title: `${dupGroups.length} duplicate tag group(s)`, detail: `Near-duplicates waste a slot: ${dupGroups.map((g) => g.join(" / ")).join("; ")}` }
  );

  // 4. Title length
  const len = cleanTitle.length;
  if (len > MAX_TITLE_LEN) {
    checks.push({ status: "bad", title: `Title is ${len} characters`, detail: `Etsy's limit is ${MAX_TITLE_LEN}. Trim ${len - MAX_TITLE_LEN} characters.` });
  } else if (len < 80) {
    checks.push({ status: "warn", title: `Title is only ${len} characters`, detail: "Use more of the 140 characters for descriptive keywords." });
  } else {
    checks.push({ status: "ok", title: `Title length is good (${len} of ${MAX_TITLE_LEN})`, detail: "You use most of the available space." });
  }

  // 5. Target keyword in title and tags
  const kwWords = wordsOf(cleanKeyword);
  const titleWords = new Set(wordsOf(cleanTitle));
  const inTitleFrac = kwWords.length ? kwWords.filter((w) => titleWords.has(w)).length / kwWords.length : 1;
  checks.push(
    inTitleFrac === 1
      ? { status: "ok", title: "Target keyword is in the title", detail: `"${cleanKeyword}" appears in your title.` }
      : { status: inTitleFrac >= 0.5 ? "warn" : "bad", title: "Target keyword missing from title", detail: `Work "${cleanKeyword}" into the start of your title.` }
  );

  const kwInTags = kwWords.length > 0 && tags.some((t) => {
    const tw = wordsOf(t);
    return kwWords.every((w) => tw.includes(w));
  });
  checks.push(
    kwInTags
      ? { status: "ok", title: "Target keyword is in your tags", detail: "At least one tag contains the full phrase." }
      : { status: "bad", title: "Target keyword is not in any tag", detail: `Add "${cleanKeyword}" as a tag if it fits in 20 characters.` }
  );

  // 6. Coverage of tags top listings use
  const topTags = marketTags.slice(0, 10);
  const missingTop = topTags.filter((t) => !userKeys.has(keyOf(t)));
  const covered = topTags.length - missingTop.length;
  if (topTags.length > 0) {
    const ratio = covered / topTags.length;
    checks.push({
      status: ratio >= 0.6 ? "ok" : ratio >= 0.3 ? "warn" : "bad",
      title: `You use ${covered} of the ${topTags.length} most common tags`,
      detail: missingTop.length ? `Missing: ${missingTop.slice(0, 5).join(", ")}` : "You cover all of them.",
    });
  }

  // 7. Common title words
  const missingWords = titleWordFrequency(listings)
    .filter((s) => s.share >= 0.4 && !titleWords.has(sing(s.term)))
    .map((s) => s.term)
    .slice(0, 6);
  checks.push(
    missingWords.length === 0
      ? { status: "ok", title: "Title has the common words", detail: "Your title uses the words most top listings use." }
      : { status: "warn", title: "Title lacks common words", detail: `Most top titles include: ${missingWords.join(", ")}` }
  );

  // Score out of 100
  const points =
    (20 * Math.min(used, MAX_TAGS)) / MAX_TAGS +
    (longTags.length === 0 ? 5 : 0) +
    Math.max(0, 10 - 5 * dupGroups.length) +
    (len === 0 || len > MAX_TITLE_LEN ? 0 : len >= 80 ? 15 : (15 * len) / 80) +
    15 * inTitleFrac +
    (kwInTags ? 10 : 0) +
    (topTags.length ? (25 * covered) / topTags.length : 25);

  // Suggested set: keep valid tags, then fill the free slots
  const kept: string[] = [];
  const keptKeys = new Set<string>();
  for (const t of tags) {
    const k = keyOf(t);
    if (t.length <= MAX_TAG_LEN && !keptKeys.has(k)) {
      kept.push(t);
      keptKeys.add(k);
    }
  }
  const candidates = [...(cleanKeyword ? [cleanKeyword.toLowerCase()] : []), ...marketTags];
  const addTags: string[] = [];
  for (const c of candidates) {
    if (kept.length + addTags.length >= MAX_TAGS) break;
    if (c.length > MAX_TAG_LEN) continue;
    const k = keyOf(c);
    if (keptKeys.has(k)) continue;
    addTags.push(c);
    keptKeys.add(k);
  }

  return {
    score: Math.round(points),
    checks,
    addTags,
    fullSet: [...kept, ...addTags].slice(0, MAX_TAGS),
    sample: listings.length,
    total,
  };
}