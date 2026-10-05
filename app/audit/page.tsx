import { searchListings } from "@/lib/etsy";
import { auditListing, parseTags, type AuditResult } from "@/lib/audit";
import CopyButton from "@/components/CopyButton";
import { saveAudit } from "@/app/actions";
import RewritePanel from "@/components/RewritePanel";

function verdict(score: number) {
    if (score >= 80) return { text: "Strong", cls: "text-good" };
    if (score >= 60) return { text: "Needs work", cls: "text-warn" };
    return { text: "Weak", cls: "text-bad" };
}

export default async function AuditPage({
    searchParams,
}: {
    searchParams: Promise<{ title?: string; tags?: string; q?: string }>;
}) {
    const { title = "", tags = "", q = "" } = await searchParams;
    let result: AuditResult | null = null;
    let error = "";

    if (title && q) {
        try {
            const { listings, total } = await searchListings(q, 48);
            result = auditListing({ title, tags: parseTags(tags), keyword: q, listings, total });
        } catch (e) {
            error = e instanceof Error ? e.message : "Something went wrong";
        }
    }

    const v = result ? verdict(result.score) : null;

    return (
        <main className="mx-auto max-w-4xl px-5 py-10">
            <h1 className="font-display text-3xl font-semibold">Listing audit</h1>
            <p className="mt-2 max-w-xl text-muted">
                Paste your listing title and tags, and the keyword you want to rank for. We compare them with the top listings for that keyword.
            </p>

            <form className="mt-6 space-y-4">
                <label className="block">
                    <span className="text-sm font-medium">Target keyword</span>
                    <input
                        name="q"
                        defaultValue={q}
                        required
                        placeholder="e.g. dog portrait from photo"
                        className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Listing title</span>
                    <textarea
                        name="title"
                        defaultValue={title}
                        required
                        rows={2}
                        placeholder="Paste your current listing title"
                        className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Tags</span>
                    <textarea
                        name="tags"
                        defaultValue={tags}
                        rows={3}
                        placeholder="Separate tags with commas or new lines"
                        className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
                    />
                </label>
                <button className="rounded-md bg-brand px-6 py-3 font-medium text-onbrand">Audit listing</button>
            </form>

            {error && <p className="mt-6 text-bad">{error}</p>}

            {result && v && (
                <section className="mt-10">
                    <div className="rounded-lg border border-line bg-card p-5">
                        <p className="text-sm text-muted">Listing score</p>
                        <p className="mt-1 text-4xl font-medium">
                            {result.score} <span className={`text-base ${v.cls}`}>{v.text}</span>
                        </p>
                        <div className="mt-3 h-1.5 rounded bg-tint">
                            <div className="h-1.5 rounded bg-brand" style={{ width: `${result.score}%` }} />
                        </div>
                        <p className="mt-3 text-xs text-muted">
                            Compared with the top {result.sample} of {result.total.toLocaleString()} listings. The score is a checklist estimate, not a ranking guarantee.
                        </p>
                    </div>

                    <h2 className="mt-8 font-display text-xl font-medium">Checks</h2>
                    <ul className="mt-3 rounded-lg border border-line bg-card">
                        {result.checks.map((c) => (
                            <li key={c.title} className="flex gap-3 border-b border-line p-4 last:border-0">
                                <span
                                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${c.status === "ok" ? "bg-good" : c.status === "warn" ? "bg-warn" : "bg-bad"
                                        }`}
                                />
                                <div>
                                    <p className="text-sm font-medium">{c.title}</p>
                                    <p className="text-sm text-muted">{c.detail}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <h2 className="mt-8 font-display text-xl font-medium">Suggested tags</h2>
                    <p className="mt-1 text-sm text-muted">
                        Your valid tags are kept. New suggestions have an orange border and fill the open slots. Weak tags you already have stay, so review them yourself.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {result.fullSet.map((t) => (
                            <span
                                key={t}
                                className="tag"
                                style={result.addTags.includes(t) ? { borderColor: "var(--accent)" } : undefined}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <CopyButton text={result.fullSet.join(", ")} />
                        <form action={saveAudit}>
                            <input type="hidden" name="q" value={q} />
                            <input type="hidden" name="title" value={title} />
                            <input type="hidden" name="tags" value={tags} />
                            <button className="rounded-md border border-line bg-card px-4 py-2 text-sm font-medium hover:border-brand">
                                Save this audit
                            </button>
                        </form>
                    </div>
                    <RewritePanel q={q} title={title} tags={tags} />
                </section>
            )}
        </main>
    );
}