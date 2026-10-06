import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import Footer from "@/components/Footer";

const outfit = Outfit({ subsets: ["latin"], variable: "--nf-sans" });

export const metadata: Metadata = {
  title: "TagLoom: Etsy keyword and tag research",
  description: "Research keywords, audit listings, and choose better Etsy tags.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;

  return (
    <html lang="en" className={outfit.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <div className="glow-wrap" aria-hidden="true">
          <div className="glow-a" />
          <div className="glow-b" />
          <div className="dots" />
        </div>
        <Navbar signedIn={signedIn} />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}