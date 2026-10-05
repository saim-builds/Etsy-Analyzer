import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, DM_Sans } from "next/font/google";
import ThemeToggle from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--nf-display" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--nf-sans" });

export const metadata: Metadata = {
  title: "TagLoom: Etsy keyword and tag research",
  description: "Research keywords, audit listings, and choose better Etsy tags.",
};

const themeScript = `try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="font-display text-xl font-semibold">
              TagLoom
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted">
              <Link href="/keywords" className="hover:text-ink">Keywords</Link>
              <Link href="/compare" className="hover:text-ink">Compare</Link>
              <Link href="/audit" className="hover:text-ink">Listing audit</Link>
              {signedIn ? (
                <>
                  <Link href="/account" className="hover:text-ink">Account</Link>
                  <form action="/auth/signout" method="post">
                    <button className="hover:text-ink">Log out</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="hover:text-ink">Log in</Link>
              )}
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line">
          <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-muted">
            TagLoom is not affiliated with or endorsed by Etsy, Inc.
          </p>
        </footer>
      </body>
    </html>
  );
}