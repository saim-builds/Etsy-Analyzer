"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    { href: "/keywords", label: "Keywords" },
    { href: "/compare", label: "Compare" },
    { href: "/audit", label: "Listing audit" },
    { href: "/rewrite", label: "AI rewrite" },
];

export default function Navbar({ signedIn }: { signedIn: boolean }) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
    const linkClass = (href: string) =>
        isActive(href) ? "text-violet" : "text-ink hover:text-violet";

    return (
        <header>
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-6 py-5">
                <Link href="/" className="text-2xl font-medium tracking-tight">
                    TagLoom
                </Link>
                <nav className="order-3 flex w-full flex-wrap items-center gap-x-6 gap-y-2 text-sm md:order-none md:w-auto">
                    {LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            aria-current={isActive(l.href) ? "page" : undefined}
                            className={linkClass(l.href)}
                        >
                            {l.label}
                        </Link>
                    ))}
                    {signedIn ? (
                        <>
                            <Link
                                href="/account"
                                aria-current={isActive("/account") ? "page" : undefined}
                                className={linkClass("/account")}
                            >
                                Account
                            </Link>
                            <form action="/auth/signout" method="post">
                                <button className="rounded-full border border-line px-5 py-2 hover:border-violet">
                                    Log out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                aria-current={isActive("/login") ? "page" : undefined}
                                className={linkClass("/login")}
                            >
                                Log in
                            </Link>
                            <Link href="/signup" className="rounded-full bg-white px-5 py-2.5 font-medium text-[#0B0A14]">
                                Sign up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}