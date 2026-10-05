import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchListings } from "@/lib/etsy";
import { parseTags } from "@/lib/audit";
import { rewriteWithGemini, RewriteError } from "@/lib/gemini";

const DAILY_LIMIT = 5; // rewrites per user per day (UTC)

function fail(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) return fail("Log in to use the AI rewriter.", 401);

    let body: any;
    try {
        body = await request.json();
    } catch {
        return fail("Invalid request.", 400);
    }
    const q = String(body?.q ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const rawTags = String(body?.tags ?? "");
    if (!q || q.length > 100 || !title || title.length > 300 || rawTags.length > 1000) {
        return fail("Check the keyword, title, and tags, then try again.", 400);
    }

    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
        .from("rewrites")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since.toISOString());
    const used = count ?? 0;
    if (used >= DAILY_LIMIT) {
        return fail(`You have used all ${DAILY_LIMIT} rewrites for today. They reset at midnight UTC.`, 429);
    }

    try {
        const { listings } = await searchListings(q, 48);
        const result = await rewriteWithGemini({
            keyword: q,
            title,
            tags: parseTags(rawTags).slice(0, 13),
            listings,
        });
        await supabase.from("rewrites").insert({});
        return NextResponse.json({ ...result, remaining: Math.max(DAILY_LIMIT - used - 1, 0) });
    } catch (e) {
        console.error("Rewrite route error:", e);
        if (e instanceof RewriteError) {
            if (e.code === "not_configured") return fail("The AI rewriter is not set up yet.", 503);
            if (e.code === "rate_limited") return fail("The AI service is busy. Try again in a minute.", 429);
        }
        return fail("The rewrite did not work this time. Try again.", 502);
    }
}