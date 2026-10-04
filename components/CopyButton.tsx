"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copy all tags" }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { }
    }

    return (
        <button
            type="button"
            onClick={copy}
            className="rounded-md border border-line bg-card px-4 py-2 text-sm font-medium hover:border-brand"
        >
            {copied ? "Copied" : label}
        </button>
    );
}