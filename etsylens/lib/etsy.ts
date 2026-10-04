export type EtsyListing = {
  id: number;
  title: string;
  tags: string[];
  price: string;
  favorites: number;
  url: string;
};

export async function searchListings(keyword: string, limit = 24): Promise<EtsyListing[]> {
  const key = process.env.ETSY_API_KEY;
  if (!key) throw new Error("ETSY_API_KEY is missing in .env.local");

  const url = new URL("https://api.etsy.com/v3/application/listings/active");
  url.searchParams.set("keywords", keyword);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort_on", "score");

  const res = await fetch(url, {
    headers: { "x-api-key": key },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Etsy API error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  return data.results.map((l: any) => ({
    id: l.listing_id,
    title: l.title,
    tags: l.tags ?? [],
    price: l.price
      ? `${(l.price.amount / l.price.divisor).toFixed(2)} ${l.price.currency_code}`
      : "",
    favorites: l.num_favorers ?? 0,
    url: l.url,
  }));
}