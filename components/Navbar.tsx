"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
    { href: "/", label: "Home" },
    { href: "/keywords", label: "Keywords" },
    { href: "/compare", label: "Compare" },
    { href: "/audit", label: "Listing audit" },
    { href: "/rewrite", label: "AI rewrite" },
];

export default function Navbar({ signedIn }: { signedIn: boolean }) {
    const pathname = usePathname();
    // The menu is open only for the page it was opened on, so it closes by itself after navigating
    const [openFor, setOpenFor] = useState<string | null>(null);
    const open = openFor === pathname;

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
    const linkClass = (href: string) =>
        isActive(href) ? "text-violet" : "text-ink hover:text-violet";

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenFor(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <header>
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                <Link href="/" className="text-2xl font-medium tracking-tight">
                    TagLoom
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden items-center gap-x-6 text-sm md:flex" aria-label="Main">
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

                {/* Mobile menu button */}
                <button
                    type="button"
                    onClick={() => setOpenFor(open ? null : pathname)}
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-violet md:hidden"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                    >
                        {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                    </svg>
                </button>
            </div>

            {/* Mobile menu panel */}
            {open && (
                <div id="mobile-menu" className="px-6 pb-6 md:hidden">
                    <nav className="card p-3" aria-label="Mobile">
                        <ul>
                            {LINKS.map((l) => (
                                <li key={l.href}>
                                    <Link
                                        href={l.href}
                                        aria-current={isActive(l.href) ? "page" : undefined}
                                        className={`block rounded-xl px-4 py-3 text-base ${linkClass(l.href)}`}
                                        onClick={() => setOpenFor(null)}
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                            {signedIn && (
                                <li>
                                    <Link
                                        href="/account"
                                        aria-current={isActive("/account") ? "page" : undefined}
                                        className={`block rounded-xl px-4 py-3 text-base ${linkClass("/account")}`}
                                    >
                                        Account
                                    </Link>
                                </li>
                            )}
                        </ul>
                        <div className="mt-2 space-y-3 border-t border-line p-3 pt-4">
                            {signedIn ? (
                                <form action="/auth/signout" method="post">
                                    <button className="btn btn-ghost w-full">Log out</button>
                                </form>
                            ) : (
                                <>
                                    <Link href="/signup" className="btn btn-light w-full">
                                        Sign up
                                    </Link>
                                    <Link href="/login" className="btn btn-ghost w-full">
                                        Log in
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}