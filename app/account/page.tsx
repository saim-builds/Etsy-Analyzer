import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteKeyword, deleteAudit } from "@/app/actions";

type Kw = { id: number; term: string; demand: number | null; competition: number | null; opportunity: number | null; created_at: string };
type Au = { id: number; keyword: string; title: string; tags: string[] | null; score: number; created_at: string };

function date(s: string) {
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AccountPage({
    searchParams,
}: {
    searchParams: Promise<{ failed?: string }>;
}) {
    const { failed } = await searchParams;
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) redirect("/login?next=/account");
    const email = data.claims.email as string | undefined;

    const { data: kwData } = await supabase
        .from("saved_keywords")
        .select("id, term, demand, competition, opportunity, created_at")
        .order("created_at", { ascending: false });
    const { data: auData } = await supabase
        .from("audits")
        .select("id, keyword, title, tags, score, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

    const keywords = (kwData ?? []) as Kw[];
    const audits = (auData ?? []) as Au[];

    return (
        <main className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="page-title">Your account</h1>
            <p className="mt-3 text-muted">
                Signed in as <span className="font-medium text-ink">{email}</span>
            </p>
            {failed && <p className="mt-4 text-bad">Could not save that. Please try again.</p>}

            <h2 className="mt-12 text-2xl font-medium tracking-tight">Saved keywords</h2>
            {keywords.length === 0 ? (
                <p className="mt-4 text-muted">
                    Nothing saved yet. Search a phrase on the{" "}
                    <Link href="/keywords" className="text-violet underline">Keywords</Link> page and press Save keyword.
                </p>
            ) : (
                <div className="card mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-line text-muted">
                            <tr>
                                <th className="p-4 font-normal">Keyword</th>
                                <th className="p-4 font-normal">Demand</th>
                                <th className="p-4 font-normal">Competition</th>
                                <th className="p-4 font-normal">Opportunity</th>
                                <th className="p-4 font-normal">Saved</th>
                                <th className="p-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {keywords.map((k) => (
                                <tr key={k.id} className="border-b border-line last:border-0 hover:bg-white/5">
                                    <td className="p-4 font-medium">
                                        <Link href={`/keywords?q=${encodeURIComponent(k.term)}`} className="underline decoration-line underline-offset-4 hover:decoration-violet">
                                            {k.term}
                                        </Link>
                                    </td>
                                    <td className="p-4">{k.demand}</td>
                                    <td className="p-4">{k.competition}</td>
                                    <td className="p-4">{k.opportunity}</td>
                                    <td className="p-4 text-muted">{date(k.created_at)}</td>
                                    <td className="p-4 text-right">
                                        <form action={deleteKeyword}>
                                            <input type="hidden" name="id" value={k.id} />
                                            <button className="text-muted hover:text-bad">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {keywords.length > 0 && (
                <p className="mt-3 text-xs text-muted">Scores are from the day you saved each keyword. Open one to see current numbers.</p>
            )}

            <h2 className="mt-12 text-2xl font-medium tracking-tight">Audit history</h2>
            {audits.length === 0 ? (
                <p className="mt-4 text-muted">
                    No saved audits yet. Run one on the{" "}
                    <Link href="/audit" className="text-violet underline">Listing audit</Link> page and press Save this audit.
                </p>
            ) : (
                <ul className="card mt-4">
                    {audits.map((a) => (
                        <li key={a.id} className="flex items-start justify-between gap-4 border-b border-line p-5 last:border-0">
                            <div className="min-w-0">
                                <p className="truncate font-medium">{a.title}</p>
                                <p className="mt-1 text-sm text-muted">
                                    {a.keyword} &middot; score {a.score} &middot; {date(a.created_at)}
                                </p>
                                <Link
                                    href={`/audit?q=${encodeURIComponent(a.keyword)}&title=${encodeURIComponent(a.title)}&tags=${encodeURIComponent((a.tags ?? []).join(", "))}`}
                                    className="mt-2 inline-block text-sm text-violet underline"
                                >
                                    Run again
                                </Link>
                            </div>
                            <form action={deleteAudit}>
                                <input type="hidden" name="id" value={a.id} />
                                <button className="text-sm text-muted hover:text-bad">Delete</button>
                            </form>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}