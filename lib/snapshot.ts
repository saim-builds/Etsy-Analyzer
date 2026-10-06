import { searchListings } from "./etsy";
import { scoreKeyword } from "./score";

export async function fetchSnapshot(term: string) {
  const { listings, total } = await searchListings(term, 48);
  const s = scoreKeyword(listings, total);
  return { ...s, total };
}