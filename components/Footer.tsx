import Link from "next/link";
import { SITE } from "@/lib/site";

const PRODUCT = [
    { href: "/keywords", label: "Keyword research" },
    { href: "/compare", label: "Compare keywords" },
    { href: "/audit", label: "Listing audit" },
    { href: "/rewrite", label: "AI rewrite" },
];

export default function Footer() {
    const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
        `Hi, I have a question about ${SITE.name}.`
    )}`;

    return (
        <footer className="mt-16 border-t border-line">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
                <div>
                    <p className="text-2xl font-medium tracking-tight">{SITE.name}</p>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                        Research keywords, audit listings, and choose better Etsy tags.
                    </p>
                </div>

                <nav aria-label="Product">
                    <p className="text-sm font-medium">Product</p>
                    <ul className="mt-4 space-y-3 text-sm text-muted">
                        {PRODUCT.map((l) => (
                            <li key={l.href}>
                                <Link href={l.href} className="hover:text-violet">
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <p className="text-sm font-medium">Contact us</p>
                    <ul className="mt-4 space-y-3 text-sm">
                        <li>
                            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 text-muted hover:text-violet">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <polyline points="3,7 12,13 21,7" />
                                </svg>
                                {SITE.email}
                            </a>
                        </li>
                        <li>
                            <a
                                href={wa}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Chat with us on WhatsApp (opens in a new tab)"
                                className="inline-flex items-center gap-2 text-muted hover:text-violet"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    style={{ color: "#25D366" }}
                                    aria-hidden="true"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.87 9.87 0 0 1-1.511-5.26c.001-5.45 4.436-9.884 9.89-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.478-8.413" />
                                </svg>
                                Chat on WhatsApp
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-line">
                <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs text-muted">
                    &copy; {new Date().getFullYear()} {SITE.name}. {SITE.etsyNotice}
                </p>
            </div>
        </footer>
    );
}