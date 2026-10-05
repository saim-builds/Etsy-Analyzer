import { searchListings } from "@/lib/etsy";
import { tagFrequency, titleWordFrequency } from "@/lib/analyze";

// Wraps a value for CSV, and blocks spreadsheet formula injection
function cell(v: string | number) {
    let s = String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(rows: (string | number)[][]) {
    return "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
}

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const q = (params.get("q") ?? "").trim();
    const type = params.get("type") === "listings" ? "listings" : "tags";

    if (!q || q.length > 100) {
        return new Response("Missing or invalid keyword", { status: 400 });
    }

    try {
        const { listings } = await searchListings(q, 48);

        const rows: (string | number)[][] =
            type === "listings"
                ? [
                    ["Title", "Price", "Favorites", "Tags", "URL"],
                    ...listings.map((l) => [l.title, l.price, l.favorites, l.tags.join("; "), l.url]),
                ]
                : [
                    ["Type", "Term", "Listings using it", "Share of listings"],
                    ...tagFrequency(listings, 50).map((s) => ["Tag", s.term, s.count, `${Math.round(s.share * 100)}%`]),
                    ...titleWordFrequency(listings, 50).map((s) => ["Title word", s.term, s.count, `${Math.round(s.share * 100)}%`]),
                ];

        const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "keyword";
        return new Response(toCsv(rows), {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="tagloom-${slug}-${type}.csv"`,
            },
        });
    } catch {
        return new Response("Could not fetch data from Etsy", { status: 502 });
    }
}