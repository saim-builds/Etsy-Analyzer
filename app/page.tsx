"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function nextPath() {
    const n = new URLSearchParams(window.location.search).get("next") ?? "";
    return n.startsWith("/") && !n.startsWith("//") ? n : "/account";
  }

  async function submit(mode: "login" | "signup") {
    setError("");
    setMessage("");
    if (!email.trim() || password.length < 8) {
      setError("Enter an email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message);
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (!data.session) {
          setMessage("Check your email to confirm your account, then log in.");
          return;
        }
      }
      router.push(nextPath());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Check the browser console.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <h1 className="font-display text-3xl font-semibold">Log in or sign up</h1>
      <p className="mt-2 text-muted">Save keywords and audits to your account.</p>

      {error && <p className="mt-5 text-bad">{error}</p>}
      {message && <p className="mt-5 text-good">{message}</p>}
      {busy && <p className="mt-5 text-muted">Working...</p>}

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit("login");
        }}
      >
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-line bg-card px-4 py-3"
          />
          <span className="text-xs text-muted">At least 8 characters.</span>
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-brand px-6 py-3 font-medium text-onbrand disabled:opacity-60"
          >
            Log in
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => submit("signup")}
            className="rounded-md border border-line bg-card px-6 py-3 font-medium hover:border-brand disabled:opacity-60"
          >
            Sign up
          </button>
        </div>
      </form>
    </main>
  );
}