"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { searchListings } from "@/lib/etsy";
import { scoreKeyword } from "@/lib/score";
import { auditListing, parseTags } from "@/lib/audit";

export async function saveKeyword(formData: FormData) {
    const term = String(formData.get("term") ?? "").trim().toLowerCase();
    if (!term || term.length > 100) return;

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) redirect(`/login?next=${encodeURIComponent("/keywords?q=" + term)}`);

    let ok = false;
    try {
        // Scores are recomputed here, so the form can't send made-up numbers
        const { listings, total } = await searchListings(term, 48);
        const s = scoreKeyword(listings, total);
        const { error } = await supabase.from("saved_keywords").insert({
            term,
            demand: s.demand,
            competition: s.competition,
            opportunity: s.opportunity,
            total_results: total,
        });
        ok = !error || error.code === "23505"; // 23505 = already saved
    } catch {
        ok = false;
    }

    revalidatePath("/account");
    const q = encodeURIComponent(term);
    redirect(ok ? `/keywords?q=${q}&saved=1` : `/keywords?q=${q}&error=${encodeURIComponent("Could not save. Try again.")}`);
}

export async function saveAudit(formData: FormData) {
    const keyword = String(formData.get("q") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const rawTags = String(formData.get("tags") ?? "");
    if (!keyword || keyword.length > 100 || !title || title.length > 300 || rawTags.length > 1000) return;

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) redirect("/login?next=/audit");

    let ok = false;
    try {
        const tags = parseTags(rawTags);
        const { listings, total } = await searchListings(keyword, 48);
        const result = auditListing({ title, tags, keyword, listings, total });
        const { error } = await supabase.from("audits").insert({
            keyword,
            title,
            tags: tags.slice(0, 30),
            score: result.score,
            suggested_tags: result.fullSet,
        });
        ok = !error;
    } catch {
        ok = false;
    }

    revalidatePath("/account");
    redirect(ok ? "/account" : "/account?failed=1");
}

export async function deleteKeyword(formData: FormData) {
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id)) return;
    const supabase = await createClient();
    await supabase.from("saved_keywords").delete().eq("id", id);
    revalidatePath("/account");
}

export async function deleteAudit(formData: FormData) {
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id)) return;
    const supabase = await createClient();
    await supabase.from("audits").delete().eq("id", id);
    revalidatePath("/account");
}