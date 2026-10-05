import { searchListings, type EtsyListing } from "@/lib/etsy";
import { tagFrequency, titleWordFrequency, longTailPhrases, type TermStat } from "@/lib/analyze";
import { scoreKeyword } from "@/lib/score";
import { saveKeyword } from "@/app/actions";

// Tuning knob: where "High" and "Medium" begin
function opportunityLabel(v: number) {
    if (v >= 45) return { text: "High", cls: "text-good" };
    if (v >= 30) return { text: "Medium", cls: "text-warn" };
    return { text: "Low", cls: "text-bad" };
}

function ScoreCard({ label, value, note }: { label: string; value: number; note?: { text: string; cls: string } }) {
    return (
        <div className="rounded-lg border border-line bg-card p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-3xl font-medium">{value}</p>
            <div className="mt-2 h-1.5 rounded bg-tint">
                <div className="h-1.5 rounded bg-brand" style={{ width: `${value}%` }} />
            </div>
            {note && <p className={`mt-2 text-sm font-medium ${note.cls}`}>{note.text}</p>}
        </div>
    );
}

function StatList({ title, stats }: { title: string; stats: TermStat[] }) {
    return (
        <section className="rounded-lg border border-line bg-card p-5">
            <h2 className="font-display text-lg font-medium">{title}</h2>
            {stats.length === 0 && <p className="mt-2 text-sm text-muted">Not enough data.</p>}
            <ul className="mt-3 space-y-3">
                {stats.map((s) => (
                    <li key={s.term} className="text-sm">
                        <div className="flex justify-between gap-3">
                            <span>{s.term}</span>
                            <span className="shrink-0 text-muted">{Math.round(s.share * 100)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded bg-tint">
                            <div className="h-1.5 rounded bg-brand" style={{ width: `${s.share * 100}%` }} />
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default async function KeywordsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; saved?: string; error?: string }>;
}) {
    const { q, saved, error: saveError } = await searchParams;
    let listings: EtsyListing[] = [];
    let total = 0;
    let error = "";

    if (q) {
        try {
            const result = await searchListings(q, 48);
            listings = result.listings;
            total = result.total;
        } catch (e) {
            error = e instanceof Error ? e.message : "Something went wrong";
        }
    }

    const score = listings.length > 0 ? scoreKeyword(listings, total) : null;
    const tags = tagFrequency(listings);
    const longTail = q ? longTailPhrases(listings, q) : [];

    return (
        <main className="mx-auto max-w-6xl px-5 py-10">
            <h1 className="font-display text-3xl font-semibold">Keyword research</h1>
            <form className="mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row">
                <input
                    name="q"
                    defaultValue={q}
                    placeholder="e.g. custom pet portrait"
                    className="flex-1 rounded-md border border-line bg-card px-4 py-3"
                />
                <button className="rounded-md bg-brand px-6 py-3 font-medium text-onbrand">Analyze</button>
            </form>

            {error && <p className="mt-6 text-bad">{error}</p>}
            {!q && <p className="mt-6 text-muted">Enter a phrase to see its scores, common tags, and top listings.</p>}

            {score && (
                <>
                    <p className="mt-8 text-sm text-muted">
                        {total.toLocaleString()} listings match &ldquo;{q}&rdquo;. Scores are estimates based on the top {listings.length} results.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <ScoreCard label="Demand" value={score.demand} />
                        <ScoreCard label="Competition" value={score.competition} />
                        <ScoreCard label="Opportunity" value={score.opportunity} note={opportunityLabel(score.opportunity)} />
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                        <form action={saveKeyword}>
                            <input type="hidden" name="term" value={q ?? ""} />
                            <button className="rounded-md border border-line bg-card px-4 py-2 text-sm font-medium hover:border-brand">
                                Save keyword
                            </button>
                        </form>
                        {saved && <span className="text-sm text-good">Saved to your account.</span>}
                        {saveError && <span className="text-sm text-bad">{saveError}</span>}
                    </div>
                    <h2 className="mt-10 font-display text-xl font-medium">Tags top sellers use</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((t) => (
                            <span key={t.term} className="tag">
                                {t.term} <span className="text-muted">{Math.round(t.share * 100)}%</span>
                            </span>
                        ))}
                    </div>
                    <h2 className="mt-10 font-display text-xl font-medium">Long-tail ideas</h2>
                    <p className="mt-1 text-sm text-muted">
                        Longer phrases built on &ldquo;{q}&rdquo; that appear in several top listings.
                    </p>
                    {longTail.length === 0 ? (
                        <p className="mt-3 text-sm text-muted">Not enough repeated phrases found.</p>
                    ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {longTail.map((p) => (
                                <span key={p.term} className="tag">
                                    {p.term} <span className="text-muted">{p.count}</span>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                        <a href={`/api/export?q=${encodeURIComponent(q ?? "")}&type=tags`} className="rounded-md border border-line bg-card px-4 py-2 font-medium hover:border-brand">
                            Download tags CSV
                        </a>
                        <a href={`/api/export?q=${encodeURIComponent(q ?? "")}&type=listings`} className="rounded-md border border-line bg-card px-4 py-2 font-medium hover:border-brand">
                            Download listings CSV
                        </a>
                    </div>
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        <StatList title="Most common tags" stats={tags} />
                        <StatList title="Most common title words" stats={titleWordFrequency(listings)} />
                    </div>

                    <h2 className="mt-10 font-display text-xl font-medium">Top listings</h2>
                    <div className="mt-3 overflow-x-auto rounded-lg border border-line bg-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line text-muted">
                                <tr>
                                    <th className="p-3 font-normal">Title</th>
                                    <th className="p-3 font-normal">Price</th>
                                    <th className="p-3 font-normal">Favorites</th>
                                    <th className="p-3 font-normal">Tags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map((l) => (
                                    <tr key={l.id} className="border-b border-line align-top last:border-0">
                                        <td className="min-w-64 p-3">
                                            <a href={l.url} target="_blank" rel="noopener" className="underline decoration-line underline-offset-2 hover:decoration-brand">
                                                {l.title}
                                            </a>
                                        </td>
                                        <td className="whitespace-nowrap p-3">{l.price}</td>
                                        <td className="p-3">{l.favorites}</td>
                                        <td className="min-w-64 p-3 text-muted">{l.tags.join(", ")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </main>
    );
}