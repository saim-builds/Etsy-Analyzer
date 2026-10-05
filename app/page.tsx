import Link from "next/link";

const features = [
  ["Keyword research", "Type a phrase and see demand, competition, and an opportunity score based on live Etsy listings."],
  ["Common tags", "See which tags and title words the top listings share, so you know what buyers in your niche respond to."],
  ["Listing audit", "Paste your title and tags and get a checklist of fixes plus a suggested tag set to copy into Etsy."],
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Find the tags your buyers actually search for
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
            Research keywords and see how competitive they are, using live Etsy listing data.
          </p>
          <form action="/keywords" className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input
              name="q"
              placeholder="e.g. custom pet portrait"
              aria-label="Keyword"
              className="flex-1 rounded-md border border-line bg-card px-4 py-3"
            />
            <button className="rounded-md bg-brand px-6 py-3 font-medium text-onbrand">Analyze keyword</button>
          </form>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <p className="text-sm text-muted">Example result</p>
          <p className="mt-1 font-display text-xl font-medium">dog portrait from photo</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-tint py-3"><p className="text-2xl font-medium">70</p><p className="text-xs text-muted">Demand</p></div>
            <div className="rounded-lg bg-tint py-3"><p className="text-2xl font-medium">61</p><p className="text-xs text-muted">Competition</p></div>
            <div className="rounded-lg border-2 border-accent py-3"><p className="text-2xl font-medium">46</p><p className="text-xs text-muted">Opportunity</p></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="tag">custom dog portrait</span>
            <span className="tag">custom pet portrait</span>
            <span className="tag">portrait from photo</span>
            <span className="tag">dog lover gift</span>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="max-w-xl font-display text-3xl font-semibold">Built to get one listing found</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {features.map(([title, text]) => (
              <div key={title} className="grid gap-4 py-7 md:grid-cols-3">
                <h3 className="font-display text-xl font-medium">{title}</h3>
                <p className="max-w-xl leading-relaxed text-muted md:col-span-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-tint">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
          <h2 className="font-display text-3xl font-semibold">Opportunity is demand weighed against competition</h2>
          <p className="leading-relaxed text-muted">
            Etsy doesn&apos;t publish real search volume, so scores are estimates. Demand comes from views and favorites on top listings. Competition comes from how many listings match. Use the scores to compare keywords against each other.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="items-center justify-between gap-8 rounded-2xl bg-brand px-8 py-12 text-onbrand sm:flex">
          <h2 className="font-display text-3xl font-semibold">Try a keyword now</h2>
          <Link href="/keywords" className="mt-6 inline-block whitespace-nowrap rounded-md bg-accent px-6 py-3 font-medium text-[#10302F] sm:mt-0">
            Open keyword research
          </Link>
        </div>
      </section>
    </main>
  );
}