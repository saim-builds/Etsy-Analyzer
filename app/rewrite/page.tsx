import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RewriteTool from "@/components/RewriteTool";

export default async function RewritePage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) redirect("/login?next=/rewrite");

    return (
        <main className="mx-auto max-w-4xl px-5 py-10">
            <h1 className="font-display text-3xl font-semibold">AI title and tag rewriter</h1>
            <p className="mt-2 max-w-xl text-muted">
                Enter your keyword and current listing. Get new title options and a tag set based on what top listings use.
            </p>
            <RewriteTool />
        </main>
    );
}