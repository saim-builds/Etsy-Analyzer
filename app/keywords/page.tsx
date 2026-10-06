import { searchListings, type EtsyListing } from "@/lib/etsy";
import { tagFrequency, titleWordFrequency, longTailPhrases, type TermStat } from "@/lib/analyze";
import { scoreKeyword } from "@/lib/score";
import { saveKeyword } from "@/app/actions";

function opportunityLabel(v: number) {
    if (v >= 45) return { text: "High opportunity", cls: "text-good" };
    if (v >= 30) return { text: "Medium opportunity", cls: "text-warn" };
    return { text: "Low opportunity", cls: "text-bad" };
}

function ScoreCard({
    label,
    value,
    color,
    note,
}: {
    label: string;
    value: number;
    color: string;
    note?: { text: string; cls: string };
}) {
    return (
        <div className="card p-6">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-5xl font-medium tracking-tight">{value}</p>
            <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full" style={{ width: `${value}%`, background: color }} />
            </div>
            {note && (
                <p className={`mt-4 inline-block rounded-full border border-line px-3 py-1 text-xs font-medium ${note.cls}`}>
                    {note.text}
                </p>
            )}
        </div>
    );
}

function StatList({ title, stats, color }: { title: string; stats: TermStat[]; color: string }) {
    return (
        <section className="card p-6">
            <h2 className="text-xl font-medium">{title}</h2>
            {stats.length === 0 && <p className="mt-3 text-sm text-muted">Not enough data.</p>}
            <ul className="mt-4 space-y-4">
                {stats.map((s) => (
                    <li key={s.term} className="text-sm">
                        <div className="flex justify-between gap-3">
                            <span>{s.term}</span>
                            <span className="shrink-0 text-muted">{Math.round(s.share * 100)}%</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-white/10">
                            <div className="h-2 rounded-full" style={{ width: `${s.share * 100}%`, background: color }} />
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
        <main className="mx-auto max-w-6xl px-6 py-12">
            <h1 className="page-title">Keyword research</h1>
            <p className="mt-3 max-w-xl text-muted">
                See demand, competition, and the tags top sellers use for any phrase.
            </p>

            <form className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
                <input name="q" defaultValue={q} placeholder="e.g. custom pet portrait" className="field flex-1" />
                <button className="btn btn-light">Analyze</button>
            </form>

            {error && <p className="mt-6 text-bad">{error}</p>}
            {!q && <p className="mt-8 text-muted">Enter a phrase to see its scores, common tags, and top listings.</p>}

            {score && (
                <>
                    <p className="mt-10 text-sm text-muted">
                        {total.toLocaleString()} listings match &ldquo;{q}&rdquo;. Scores are estimates based on the top {listings.length} results.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <ScoreCard label="Demand" value={score.demand} color="var(--blue)" />
                        <ScoreCard label="Competition" value={score.competition} color="var(--violet)" />
                        <ScoreCard
                            label="Opportunity"
                            value={score.opportunity}
                            color="var(--accent)"
                            note={opportunityLabel(score.opportunity)}
                        />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <form action={saveKeyword}>
                            <input type="hidden" name="term" value={q ?? ""} />
                            <button className="btn btn-ghost btn-sm">Save keyword</button>
                        </form>
                        <a href={`/api/export?q=${encodeURIComponent(q ?? "")}&type=tags`} className="btn btn-ghost btn-sm">
                            Download tags CSV
                        </a>
                        <a href={`/api/export?q=${encodeURIComponent(q ?? "")}&type=listings`} className="btn btn-ghost btn-sm">
                            Download listings CSV
                        </a>
                        {saved && <span className="text-sm text-good">Saved to your account.</span>}
                        {saveError && <span className="text-sm text-bad">{saveError}</span>}
                    </div>

                    <h2 className="mt-12 text-2xl font-medium tracking-tight">Tags top sellers use</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((t) => (
                            <span key={t.term} className="tag">
                                {t.term} <span className="text-muted">{Math.round(t.share * 100)}%</span>
                            </span>
                        ))}
                    </div>

                    <h2 className="mt-12 text-2xl font-medium tracking-tight">Long-tail ideas</h2>
                    <p className="mt-1 text-sm text-muted">
                        Longer phrases built on &ldquo;{q}&rdquo; that appear in several top listings.
                    </p>
                    {longTail.length === 0 ? (
                        <p className="mt-4 text-sm text-muted">Not enough repeated phrases found.</p>
                    ) : (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {longTail.map((p) => (
                                <span key={p.term} className="tag">
                                    {p.term} <span className="text-muted">{p.count}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 grid gap-5 md:grid-cols-2">
                        <StatList title="Most common tags" stats={tags} color="var(--violet)" />
                        <StatList title="Most common title words" stats={titleWordFrequency(listings)} color="var(--blue)" />
                    </div>

                    <h2 className="mt-12 text-2xl font-medium tracking-tight">Top listings</h2>
                    <div className="card mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line text-muted">
                                <tr>
                                    <th className="p-4 font-normal">Title</th>
                                    <th className="p-4 font-normal">Price</th>
                                    <th className="p-4 font-normal">Favorites</th>
                                    <th className="p-4 font-normal">Tags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map((l) => (
                                    <tr key={l.id} className="border-b border-line align-top last:border-0 hover:bg-white/5">
                                        <td className="min-w-64 p-4">
                                            <a href={l.url} target="_blank" rel="noopener" className="underline decoration-line underline-offset-4 hover:decoration-violet">
                                                {l.title}
                                            </a>
                                        </td>
                                        <td className="whitespace-nowrap p-4">{l.price}</td>
                                        <td className="p-4">{l.favorites}</td>
                                        <td className="min-w-64 p-4 text-muted">{l.tags.join(", ")}</td>
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