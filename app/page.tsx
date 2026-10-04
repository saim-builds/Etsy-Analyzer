import { searchListings, type EtsyListing } from "@/lib/etsy";
import { tagFrequency, titleWordFrequency, type TermStat } from "@/lib/analyze";
import { scoreKeyword } from "@/lib/score";

function StatList({ title, stats }: { title: string; stats: TermStat[] }) {
  return (
    <section>
      <h2 className="font-semibold">{title}</h2>
      {stats.length === 0 && <p className="mt-2 text-sm text-gray-500">Not enough data.</p>}
      <ul className="mt-2 space-y-2">
        {stats.map((s) => (
          <li key={s.term} className="text-sm">
            <div className="flex justify-between">
              <span>{s.term}</span>
              <span className="text-gray-500">
                {s.count} listings ({Math.round(s.share * 100)}%)
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded bg-gray-200">
              <div className="h-1.5 rounded bg-black" style={{ width: `${s.share * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let listings: EtsyListing[] = [];
  let total = 0;
  let error = "";

  if (q) {
    try {
      const result = await searchListings(q, 48);
      listings = result.listings;
      total = result.total;
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong";
    }
  }
  const score = listings.length > 0 ? scoreKeyword(listings, total) : null;
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
        <>
          <p className="mt-6 text-sm text-gray-500">
            Based on the top {listings.length} listings for &ldquo;{q}&rdquo;
          </p>
          {score && (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Demand", value: score.demand },
                  { label: "Competition", value: score.competition },
                  { label: "Opportunity", value: score.opportunity },
                ].map((s) => (
                  <div key={s.label} className="rounded border p-3">
                    <p className="text-2xl font-medium">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {total.toLocaleString()} listings match this keyword. Scores are early estimates.
              </p>
            </>
          )}
          <div className="mt-4 grid gap-8 md:grid-cols-2">
            <StatList title="Most common tags" stats={tagFrequency(listings)} />
            <StatList title="Most common title words" stats={titleWordFrequency(listings)} />
          </div>

          <h2 className="mt-10 font-semibold">All listings</h2>
          <table className="mt-2 w-full text-left text-sm">
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
        </>
      )}
    </main>
  );
}