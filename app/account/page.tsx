import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const email = data?.claims?.email as string | undefined;
    if (!data?.claims) redirect("/login?next=/account");

    return (
        <main className="mx-auto max-w-4xl px-5 py-10">
            <h1 className="font-display text-3xl font-semibold">Your account</h1>
            <p className="mt-3 text-muted">
                Signed in as <span className="font-medium text-ink">{email}</span>
            </p>
            <p className="mt-6 max-w-xl text-muted">
                Saved keyword lists and audit history will appear here after Day 10.
            </p>
        </main>
    );
}