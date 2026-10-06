import Link from "next/link";
import PromptBox from "@/components/PromptBox";

const features = [
  ["01", "Keyword research", "Type a phrase and see demand, competition, and an opportunity score based on live Etsy listings."],
  ["02", "Common tags", "See which tags and title words the top listings share, so you know what buyers in your niche respond to."],
  ["03", "Listing audit", "Paste your title and tags and get a checklist of fixes plus a suggested tag set to copy into Etsy."],
];

const bars = [
  { label: "Demand", value: 70, color: "var(--blue)" },
  { label: "Competition", value: 61, color: "var(--violet)" },
  { label: "Opportunity", value: 46, color: "var(--accent)" },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-16 text-center md:pt-24">
        <h1 className="mx-auto max-w-4xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          Find the tags your buyers actually search for
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#CFCDE3]">
          Research keywords and see how competitive they are, using live Etsy listing data.
        </p>
        <div className="mt-12">
          <PromptBox />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            Opportunity is demand weighed against competition
          </h2>
          <p className="mt-6 max-w-lg leading-relaxed text-muted">
            Etsy doesn&apos;t publish real search volume, so scores are estimates. Demand comes from views and favorites on top listings. Competition comes from how many listings match. Use the scores to compare keywords against each other.
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-card p-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Example result</p>
          <p className="mt-2 text-2xl font-medium">dog portrait from photo</p>
          <div className="mt-6 space-y-4">
            {bars.map((b) => (
              <div key={b.label} className="flex items-center gap-4 text-sm">
                <span className="w-28 shrink-0">{b.label}</span>
                <div className="h-2 flex-1 rounded-full bg-white/10">
                  <div className="h-2 rounded-full" style={{ width: `${b.value}%`, background: b.color }} />
                </div>
                <span className="w-8 text-right font-medium">{b.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {["custom dog portrait", "custom pet portrait", "portrait from photo", "dog lover gift"].map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-medium tracking-tight md:text-5xl">Built to get one listing found</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map(([n, title, text]) => (
            <div key={n} className="rounded-3xl border border-line bg-card p-8">
              <p className="text-sm text-violet">{n}</p>
              <h3 className="mt-6 text-2xl font-medium">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <div className="items-center justify-between gap-8 rounded-3xl border border-line bg-[linear-gradient(135deg,#5B3FD6,#3A2A9E_55%,#1B1550)] px-10 py-14 md:flex">
          <h2 className="text-4xl font-medium tracking-tight md:text-5xl">Try a keyword now</h2>
          <Link
            href="/keywords"
            className="mt-6 inline-block whitespace-nowrap rounded-full bg-white px-8 py-4 font-medium text-[#0B0A14] md:mt-0"
          >
            Open keyword research
          </Link>
        </div>
      </section>
    </main>
  );
}