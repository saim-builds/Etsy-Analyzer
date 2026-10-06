"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TABS = [
    { id: "keywords", label: "Keywords", path: "/keywords", placeholder: "What keyword shall we analyze? e.g. custom pet portrait" },
    { id: "compare", label: "Compare", path: "/compare", placeholder: "Enter up to 5 phrases, one per line" },
    { id: "audit", label: "Audit", path: "/audit", placeholder: "Which keyword should your listing rank for?" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const EXAMPLES = ["custom dog portrait", "portrait from photo", "dog lover gift"];

export default function PromptBox() {
    const router = useRouter();
    const [tab, setTab] = useState<TabId>("keywords");
    const [value, setValue] = useState("");
    const ref = useRef<HTMLTextAreaElement>(null);
    const current = TABS.find((t) => t.id === tab)!;

    function go(text: string, t: TabId) {
        const v = text.trim();
        if (!v) {
            ref.current?.focus();
            return;
        }
        const q =
            t === "compare"
                ? v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).slice(0, 5).join("\n")
                : v.replace(/\s+/g, " ");
        const path = TABS.find((x) => x.id === t)!.path;
        router.push(`${path}?q=${encodeURIComponent(q)}`);
    }

    return (
        <div className="mx-auto w-full max-w-3xl">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    go(value, tab);
                }}
                className="rounded-3xl border border-line bg-[rgba(15,13,31,0.75)] p-4 backdrop-blur"
            >
                <textarea
                    ref={ref}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && tab !== "compare") {
                            e.preventDefault();
                            go(value, tab);
                        }
                    }}
                    rows={2}
                    maxLength={500}
                    aria-label="Keyword"
                    placeholder={current.placeholder}
                    className="w-full resize-none bg-transparent px-2 py-2 text-lg outline-none"
                />
                <div className="mt-3 flex items-center justify-between">
                    <div role="tablist" className="flex rounded-full bg-white/5 p-1">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={tab === t.id}
                                onClick={() => setTab(t.id)}
                                className={`rounded-full px-4 py-2 text-sm font-medium ${tab === t.id ? "bg-white/10 text-white" : "text-muted hover:text-white"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button
                        type="submit"
                        aria-label="Analyze"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0B0A14]"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                    </button>
                </div>
            </form>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
                {EXAMPLES.map((ex) => (
                    <button
                        key={ex}
                        type="button"
                        onClick={() => go(ex, "keywords")}
                        className="rounded-full border border-line px-5 py-2 text-sm hover:border-violet"
                    >
                        {ex}
                    </button>
                ))}
            </div>
        </div>
    );
}