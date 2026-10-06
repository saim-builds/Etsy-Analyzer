import { searchListings } from "@/lib/etsy";
import { auditListing, parseTags, type AuditResult } from "@/lib/audit";
import CopyButton from "@/components/CopyButton";
import RewritePanel from "@/components/RewritePanel";
import { saveAudit } from "@/app/actions";

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
        <main className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="page-title">Listing audit</h1>
            <p className="mt-3 max-w-xl text-muted">
                Paste your listing title and tags, and the keyword you want to rank for. We compare them with the top listings for that keyword.
            </p>

            <form className="mt-8 space-y-5">
                <label className="block">
                    <span className="text-sm font-medium">Target keyword</span>
                    <input
                        name="q"
                        defaultValue={q}
                        required
                        placeholder="e.g. dog portrait from photo"
                        className="field mt-2"
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
                        className="field mt-2"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Tags</span>
                    <textarea
                        name="tags"
                        defaultValue={tags}
                        rows={3}
                        placeholder="Separate tags with commas or new lines"
                        className="field mt-2"
                    />
                </label>
                <button className="btn btn-light">Audit listing</button>
            </form>

            {error && <p className="mt-6 text-bad">{error}</p>}

            {result && v && (
                <section className="mt-12">
                    <div className="card p-6">
                        <p className="text-sm text-muted">Listing score</p>
                        <p className="mt-2 text-5xl font-medium tracking-tight">
                            {result.score} <span className={`text-lg ${v.cls}`}>{v.text}</span>
                        </p>
                        <div className="mt-4 h-2 rounded-full bg-white/10">
                            <div className="h-2 rounded-full" style={{ width: `${result.score}%`, background: "var(--accent)" }} />
                        </div>
                        <p className="mt-4 text-xs text-muted">
                            Compared with the top {result.sample} of {result.total.toLocaleString()} listings. The score is a checklist estimate, not a ranking guarantee.
                        </p>
                    </div>

                    <h2 className="mt-12 text-2xl font-medium tracking-tight">Checks</h2>
                    <ul className="card mt-4">
                        {result.checks.map((c) => (
                            <li key={c.title} className="flex gap-4 border-b border-line p-5 last:border-0">
                                <span
                                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${c.status === "ok" ? "bg-good" : c.status === "warn" ? "bg-warn" : "bg-bad"
                                        }`}
                                />
                                <div>
                                    <p className="font-medium">{c.title}</p>
                                    <p className="mt-1 text-sm text-muted">{c.detail}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <h2 className="mt-12 text-2xl font-medium tracking-tight">Suggested tags</h2>
                    <p className="mt-1 max-w-xl text-sm text-muted">
                        Your valid tags are kept. New suggestions have an amber border and fill the open slots. Weak tags you already have stay, so review them yourself.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
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
                    <div className="mt-5 flex flex-wrap gap-3">
                        <CopyButton text={result.fullSet.join(", ")} />
                        <form action={saveAudit}>
                            <input type="hidden" name="q" value={q} />
                            <input type="hidden" name="title" value={title} />
                            <input type="hidden" name="tags" value={tags} />
                            <button className="btn btn-ghost btn-sm">Save this audit</button>
                        </form>
                    </div>

                    <RewritePanel q={q} title={title} tags={tags} />
                </section>
            )}
        </main>
    );
}