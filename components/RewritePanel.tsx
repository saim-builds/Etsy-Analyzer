"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";

type Result = { titles: string[]; tags: string[]; remaining: number };

export default function RewritePanel({ q, title, tags }: { q: string; title: string; tags: string }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<Result | null>(null);

    async function run() {
        setBusy(true);
        setError("");
        try {
            const res = await fetch("/api/rewrite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ q, title, tags }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.status === 401) {
                window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                return;
            }
            if (!res.ok) {
                setError(data.error ?? "Something went wrong.");
                return;
            }
            setResult(data);
        } catch {
            setError("Could not reach the server.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="mt-12">
            <h2 className="text-2xl font-medium tracking-tight">AI rewrite</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
                Get title options and a tag set written from this listing and the top listings. Your title and tags are sent to Google&apos;s Gemini service to do this. Check the results before you use them.
            </p>
            <button type="button" onClick={run} disabled={busy} className="btn btn-light mt-5">
                {busy ? "Writing..." : result ? "Rewrite again" : "Rewrite with AI"}
            </button>
            {error && <p className="mt-4 text-sm text-bad">{error}</p>}

            {result && (
                <div className="mt-8 space-y-8">
                    {result.titles.length > 0 && (
                        <div>
                            <p className="font-medium">Title options</p>
                            <ul className="card mt-3">
                                {result.titles.map((t) => (
                                    <li key={t} className="flex items-start justify-between gap-4 border-b border-line p-5 last:border-0">
                                        <div>
                                            <p>{t}</p>
                                            <p className="mt-1 text-xs text-muted">{t.length} of 140 characters</p>
                                        </div>
                                        <CopyButton text={t} label="Copy" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {result.tags.length > 0 && (
                        <div>
                            <p className="font-medium">Suggested tags</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {result.tags.map((t) => (
                                    <span key={t} className="tag">{t}</span>
                                ))}
                            </div>
                            <div className="mt-4">
                                <CopyButton text={result.tags.join(", ")} />
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-muted">{result.remaining} rewrites left today.</p>
                </div>
            )}
        </section>
    );
}