"use client";

import { useState } from "react";
import RewritePanel from "@/components/RewritePanel";

export default function RewriteTool() {
    const [q, setQ] = useState("");
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const ready = q.trim().length > 0 && title.trim().length > 0;

    return (
        <div className="mt-6 space-y-4">
            <label className="block">
                <span className="text-sm font-medium">Target keyword</span>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    maxLength={100}
                    placeholder="e.g. dog portrait from photo"
                    className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
                />
            </label>
            <label className="block">
                <span className="text-sm font-medium">Current listing title</span>
                <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={300}
                    rows={2}
                    placeholder="Paste your current listing title"
                    className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
                />
            </label>
            <label className="block">
                <span className="text-sm font-medium">Current tags (optional)</span>
                <textarea
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Separate tags with commas or new lines"
                    className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
                />
            </label>

            {ready ? (
                <RewritePanel q={q.trim()} title={title.trim()} tags={tags} />
            ) : (
                <p className="text-sm text-muted">Fill in the keyword and title to continue.</p>
            )}
        </div>
    );
}