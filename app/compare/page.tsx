import { searchListings } from "@/lib/etsy";
import { scoreKeyword } from "@/lib/score";

function label(v: number) {
    if (v >= 45) return { text: "High", cls: "text-good" };
    if (v >= 30) return { text: "Medium", cls: "text-warn" };
    return { text: "Low", cls: "text-bad" };
}

export default async function ComparePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q = "" } = await searchParams;
    const phrases = [...new Set(q.split(/\r?\n/).map((s) => s.trim()).filter(Boolean))].slice(0, 5);

    const settled = await Promise.allSettled(
        phrases.map(async (phrase) => {
            const r = await searchListings(phrase, 48);
            return { phrase, total: r.total, ...scoreKeyword(r.listings, r.total) };
        })
    );

    const rows = settled
        .flatMap((s) => (s.status === "fulfilled" ? [s.value] : []))
        .sort((a, b) => b.opportunity - a.opportunity);
    const failed = phrases.filter((_, i) => settled[i].status === "rejected");

    return (
        <main className="mx-auto max-w-4xl px-5 py-10">
            <h1 className="font-display text-3xl font-semibold">Compare keywords</h1>
            <p className="mt-2 max-w-xl text-muted">
                Enter up to 5 phrases, one per line, and see which has the best opportunity score.
            </p>

            <form className="mt-6 space-y-3">
                <textarea
                    name="q"
                    defaultValue={q}
                    rows={5}
                    placeholder={"dog portrait from photo\ncustom pet portrait\npet memorial gift"}
                    className="w-full rounded-md border border-line bg-card px-4 py-3"
                />
                <button className="rounded-md bg-brand px-6 py-3 font-medium text-onbrand">Compare</button>
            </form>

            {failed.length > 0 && (
                <p className="mt-6 text-bad">Could not load: {failed.join(", ")}. Try again in a moment.</p>
            )}

            {rows.length > 0 && (
                <section className="mt-8">
                    <p className="text-sm text-muted">
                        Best pick: <span className="font-medium text-ink">{rows[0].phrase}</span>. Scores are estimates, so use them to compare phrases against each other.
                    </p>
                    <div className="mt-3 overflow-x-auto rounded-lg border border-line bg-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line text-muted">
                                <tr>
                                    <th className="p-3 font-normal">Keyword</th>
                                    <th className="p-3 font-normal">Matches</th>
                                    <th className="p-3 font-normal">Demand</th>
                                    <th className="p-3 font-normal">Competition</th>
                                    <th className="min-w-40 p-3 font-normal">Opportunity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => {
                                    const l = label(r.opportunity);
                                    return (
                                        <tr key={r.phrase} className="border-b border-line last:border-0">
                                            <td className="p-3 font-medium">{r.phrase}</td>
                                            <td className="p-3">{r.total.toLocaleString()}</td>
                                            <td className="p-3">{r.demand}</td>
                                            <td className="p-3">{r.competition}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-7">{r.opportunity}</span>
                                                    <div className="h-1.5 flex-1 rounded bg-tint">
                                                        <div className="h-1.5 rounded bg-brand" style={{ width: `${r.opportunity}%` }} />
                                                    </div>
                                                    <span className={`text-xs font-medium ${l.cls}`}>{l.text}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </main>
    );
}