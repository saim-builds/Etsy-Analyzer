import { searchListings, type EtsyListing } from "../lib/etsy";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let listings: EtsyListing[] = [];
  let error = "";

  if (q) {
    try {
      listings = await searchListings(q);
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong";
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Keyword research</h1>
      <form className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="e.g. custom pet portrait"
          className="flex-1 rounded border px-3 py-2"
        />
        <button className="rounded bg-black px-4 py-2 text-white">Analyze</button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {listings.length > 0 && (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Title</th>
              <th>Price</th>
              <th>Favorites</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-b align-top">
                <td className="py-2 pr-3">
                  <a href={l.url} target="_blank" className="underline">
                    {l.title}
                  </a>
                </td>
                <td className="pr-3">{l.price}</td>
                <td className="pr-3">{l.favorites}</td>
                <td>{l.tags.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}