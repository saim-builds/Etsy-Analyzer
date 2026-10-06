import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSnapshot } from "@/lib/snapshot";

const MAX_TERMS = 40; // keywords per run, to stay inside Etsy's limits
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function authorized(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || secret.length < 16) return false;
    const given = Buffer.from(request.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
    if (!authorized(request)) return new NextResponse("Unauthorized", { status: 401 });

    const admin = createAdminClient();
    const { data: rows, error } = await admin.from("saved_keywords").select("id, user_id, term");
    if (error || !rows) {
        return NextResponse.json({ error: "Could not read saved keywords" }, { status: 500 });
    }

    // One Etsy lookup per distinct phrase, even if many users saved it
    const byTerm = new Map<string, { id: number; user_id: string }[]>();
    for (const r of rows) {
        const list = byTerm.get(r.term) ?? [];
        list.push({ id: r.id, user_id: r.user_id });
        byTerm.set(r.term, list);
    }

    const terms = [...byTerm.keys()].slice(0, MAX_TERMS);
    const today = new Date().toISOString().slice(0, 10);
    let saved = 0;
    let failed = 0;

    for (const term of terms) {
        try {
            const s = await fetchSnapshot(term);
            const records = byTerm.get(term)!.map((r) => ({
                saved_keyword_id: r.id,
                user_id: r.user_id,
                captured_on: today,
                demand: s.demand,
                competition: s.competition,
                opportunity: s.opportunity,
                total_results: s.total,
            }));
            const { error: upErr } = await admin
                .from("keyword_history")
                .upsert(records, { onConflict: "saved_keyword_id,captured_on" });
            if (upErr) failed++;
            else saved += records.length;
        } catch {
            failed++;
        }
        await sleep(300);
    }

    return NextResponse.json({
        terms: terms.length,
        saved,
        failed,
        skipped: Math.max(byTerm.size - terms.length, 0),
    });
}