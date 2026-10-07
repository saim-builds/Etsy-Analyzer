"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { createClient } from "@/lib/supabase/client";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
    const router = useRouter();
    const turnstile = useRef<TurnstileInstance>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const isSignup = mode === "signup";
    const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
    const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
    const waitingForCaptcha = !!SITE_KEY && !captchaToken;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setMessage("");
        if (!email.trim()) {
            setError("Enter your email.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (isSignup && password !== confirm) {
            setError("The two passwords do not match.");
            return;
        }
        if (waitingForCaptcha) {
            setError("Please wait for the verification check to finish.");
            return;
        }

        setBusy(true);
        try {
            const supabase = createClient();
            const token = captchaToken || undefined;
            if (isSignup) {
                const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        captchaToken: token,
                    },
                });
                if (error) {
                    setError(error.message);
                    return;
                }
                if (!data.session) {
                    setMessage("Account created. Check your email to confirm it, then log in.");
                    return;
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                    options: { captchaToken: token },
                });
                if (error) {
                    setError(error.message);
                    return;
                }
            }
            router.push(dest);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Check the browser console.");
        } finally {
            // A captcha token works only once, so get a fresh one for the next try
            turnstile.current?.reset();
            setCaptchaToken("");
            setBusy(false);
        }
    }

    return (
        <main className="mx-auto max-w-md px-6 py-16">
            <div className="card p-8">
                <h1 className="text-3xl font-medium tracking-tight">
                    {isSignup ? "Create your account" : "Log in"}
                </h1>
                <p className="mt-2 text-muted">
                    {isSignup
                        ? "Sign up to use the tools and save your keywords and audits."
                        : "Welcome back. Log in to your account."}
                </p>

                {error && <p className="mt-5 text-bad">{error}</p>}
                {message && (
                    <p className="mt-5 text-good">
                        {message}{" "}
                        <Link href={`/login${suffix}`} className="underline">
                            Go to log in
                        </Link>
                    </p>
                )}

                <form onSubmit={submit} className="mt-6 space-y-5">
                    <label className="block">
                        <span className="text-sm font-medium">Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className="field mt-2"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={isSignup ? "new-password" : "current-password"}
                            className="field mt-2"
                        />
                        <span className="mt-1 block text-xs text-muted">At least 8 characters.</span>
                    </label>
                    {isSignup && (
                        <label className="block">
                            <span className="text-sm font-medium">Confirm password</span>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                className="field mt-2"
                            />
                        </label>
                    )}

                    {SITE_KEY && (
                        <Turnstile
                            ref={turnstile}
                            siteKey={SITE_KEY}
                            onSuccess={setCaptchaToken}
                            onExpire={() => setCaptchaToken("")}
                            onError={() => setCaptchaToken("")}
                            options={{ theme: "dark" }}
                        />
                    )}

                    <button type="submit" disabled={busy || waitingForCaptcha} className="btn btn-light w-full">
                        {busy ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                    {isSignup ? (
                        <>
                            Already have an account?{" "}
                            <Link href={`/login${suffix}`} className="text-violet underline">
                                Log in
                            </Link>
                        </>
                    ) : (
                        <>
                            New here?{" "}
                            <Link href={`/signup${suffix}`} className="text-violet underline">
                                Create an account
                            </Link>
                        </>
                    )}
                </p>
            </div>
        </main>
    );
}