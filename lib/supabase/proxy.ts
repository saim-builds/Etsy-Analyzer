import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/account"];

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(
                    cookiesToSet: { name: string; value: string; options?: any }[],
                    headers?: Record<string, string>
                ) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                    Object.entries(headers ?? {}).forEach(([key, value]) =>
                        supabaseResponse.headers.set(key, value)
                    );
                },
            },
        }
    );

    // Do not add code between createServerClient and getClaims
    const { data } = await supabase.auth.getClaims();
    const signedIn = !!data?.claims;

    const path = request.nextUrl.pathname;
    if (!signedIn && PROTECTED.some((p) => path.startsWith(p))) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = "";
        url.searchParams.set("next", path);
        const redirect = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c));
        return redirect;
    }

    return supabaseResponse;
}