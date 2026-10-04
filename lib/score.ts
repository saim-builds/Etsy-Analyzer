import type { EtsyListing } from "./etsy";

const MAX_RESULTS = 50_000_000;
const MAX_ENGAGEMENT = 3000;
function normLog(x: number, max: number) {
  return Math.min(Math.log1p(Math.max(x, 0)) / Math.log1p(max), 1);
}

export type KeywordScore = {
  demand: number;
  competition: number;
  opportunity: number;
};

export function scoreKeyword(listings: EtsyListing[], total: number): KeywordScore {
  const nowSec = Date.now() / 1000;

  const perMonth = listings.map((l) => {
    const months = l.createdAt
      ? Math.max((nowSec - l.createdAt) / (30 * 24 * 3600), 1)
      : 12;
    return (l.views + 5 * l.favorites) / months;
  });
  const avg = perMonth.length
    ? perMonth.reduce((a, b) => a + b, 0) / perMonth.length
    : 0;


  const demand = normLog(avg, MAX_ENGAGEMENT);
  const competition = normLog(total, MAX_RESULTS);
  const opportunity = Math.min(demand / (competition + 0.15), 2) / 2;

  return {
    demand: Math.round(demand * 100),
    competition: Math.round(competition * 100),
    opportunity: Math.round(opportunity * 100),
  };
}